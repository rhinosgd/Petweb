import type { GatewayConfig } from "./config";
import type { CreateCheckoutInput, CreateCheckoutResult, PaymentProvider, VerifyCallbackResult } from "./types";

/**
 * PayPal Provider
 * - 使用 REST API 创建订单（Orders v2），前端跳转 approve 链接
 * - capture 后或 webhook 通知更新订单
 * 说明：为避免依赖官方 SDK 版本兼容问题，这里用 fetch 直连 PayPal REST API。
 */
export class PayPalProvider implements PaymentProvider {
  gateway = "PAYPAL" as const;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor(cfg: GatewayConfig) {
    if (!cfg.apiKey || !cfg.secret) throw new Error("PayPal client id/secret 未配置");
    this.clientId = cfg.apiKey;
    this.clientSecret = cfg.secret;
    this.baseUrl =
      process.env.PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });
    if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const token = await this.getAccessToken();
    const amount = (input.amount / 100).toFixed(2);

    const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: input.orderNo,
            amount: { currency_code: input.currency, value: amount }
          }
        ],
        application_context: {
          brand_name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Paw & Craft",
          user_action: "PAY_NOW",
          return_url: input.returnUrl,
          cancel_url: input.cancelUrl ?? input.returnUrl
        }
      })
    });

    if (!res.ok) throw new Error(`PayPal create order error: ${res.status}`);
    const data = (await res.json()) as {
      id: string;
      links: { rel: string; href: string }[];
    };
    const approve = data.links.find((l) => l.rel === "approve")?.href;

    return { redirectUrl: approve, gatewayTxnId: data.id };
  }

  async verifyCallback(payload: unknown): Promise<VerifyCallbackResult> {
    // Webhook：PAYMENT.CAPTURE.COMPLETED
    const body = payload as {
      event_type?: string;
      resource?: { id?: string; custom_id?: string; amount?: { value: string; currency_code: string } };
    };
    if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      return {
        success: true,
        orderNo: body.resource?.custom_id ?? "",
        gatewayTxnId: body.resource?.id,
        amount: body.resource?.amount ? Math.round(parseFloat(body.resource.amount.value) * 100) : undefined,
        currency: body.resource?.amount?.currency_code,
        raw: body
      };
    }
    return { success: false, orderNo: "", raw: body };
  }
}
