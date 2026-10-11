import Stripe from "stripe";
import type { GatewayConfig } from "./config";
import type { CreateCheckoutInput, CreateCheckoutResult, PaymentProvider, VerifyCallbackResult } from "./types";

/**
 * Stripe Provider
 * - 使用 PaymentIntent + clientSecret，前端用 Stripe.js 确认支付（不接触卡号，符合 PCI）
 * - 通过 webhook 异步通知更新订单
 */
export class StripeProvider implements PaymentProvider {
  gateway = "STRIPE" as const;
  private stripe: Stripe;
  private webhookSecret?: string;

  constructor(private cfg: GatewayConfig) {
    if (!cfg.apiKey) throw new Error("Stripe secret key 未配置");
    this.stripe = new Stripe(cfg.apiKey, { apiVersion: "2024-10-28.acacia" as never });
    this.webhookSecret = cfg.secret ?? undefined;
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: input.amount,
      currency: input.currency.toLowerCase(),
      receipt_email: input.email,
      metadata: { orderNo: input.orderNo },
      automatic_payment_methods: { enabled: true }
    });

    return {
      clientPayload: {
        clientSecret: intent.client_secret,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      },
      gatewayTxnId: intent.id
    };
  }

  async verifyCallback(payload: unknown, headers: Record<string, string> = {}): Promise<VerifyCallbackResult> {
    const signature = headers["stripe-signature"];
    let event: Stripe.Event;

    if (this.webhookSecret && signature) {
      // 生产环境：验签（payload 需为原始字符串）
      event = this.stripe.webhooks.constructEvent(
        payload as string,
        signature,
        this.webhookSecret
      );
    } else {
      // 开发环境：直接解析
      event = typeof payload === "string" ? JSON.parse(payload) : (payload as Stripe.Event);
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      return {
        success: true,
        orderNo: pi.metadata?.orderNo ?? "",
        gatewayTxnId: pi.id,
        amount: pi.amount,
        currency: pi.currency.toUpperCase(),
        raw: event
      };
    }

    return { success: false, orderNo: "", raw: event };
  }
}
