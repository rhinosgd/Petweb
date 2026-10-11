import type { GatewayConfig } from "./config";
import { buildAutoSubmitForm, generateSign, verifySign } from "./sign";
import type { CreateCheckoutInput, CreateCheckoutResult, PaymentProvider, VerifyCallbackResult } from "./types";

/**
 * Wintopay Provider（托管收银台）
 * 流程与钱海一致：生成签名 → 自动提交表单跳转 → 异步通知验签更新订单。
 *
 * ⚠️ 字段名（merchantNo/orderNo/orderAmount/orderCurrency/returnUrl/notifyUrl...）
 *    以 Wintopay 官方最新文档为准，此处为通用示例结构。
 */
export class WintopayProvider implements PaymentProvider {
  gateway = "WINTOPAY" as const;

  constructor(private cfg: GatewayConfig) {
    if (!cfg.merchantId || !cfg.secureCode) throw new Error("Wintopay 商户号/密钥未配置");
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const params: Record<string, string> = {
      merchantNo: this.cfg.merchantId!,
      orderNo: input.orderNo,
      orderAmount: (input.amount / 100).toFixed(2),
      orderCurrency: input.currency,
      returnUrl: input.returnUrl,
      notifyUrl: input.notifyUrl,
      buyerEmail: input.email,
      buyerName: input.name ?? ""
    };
    params.sign = generateSign(params, this.cfg.secureCode!);

    const gatewayUrl = this.cfg.gatewayUrl ?? "https://pay.wintopay.com/gateway/pay";
    return {
      clientPayload: { html: buildAutoSubmitForm(gatewayUrl, params) },
      gatewayTxnId: input.orderNo
    };
  }

  async verifyCallback(payload: unknown): Promise<VerifyCallbackResult> {
    const body = (payload ?? {}) as Record<string, string>;
    const receivedSign = body.sign || "";
    const ok = verifySign(body, this.cfg.secureCode!, receivedSign);

    const status = body.status || body.orderStatus;
    const success = ok && (status === "1" || String(status).toUpperCase() === "SUCCESS" || String(status).toUpperCase() === "PAID");

    return {
      success,
      orderNo: body.orderNo ?? "",
      gatewayTxnId: body.transactionId ?? body.tradeNo,
      amount: body.orderAmount ? Math.round(parseFloat(body.orderAmount) * 100) : undefined,
      currency: body.orderCurrency,
      raw: body
    };
  }
}
