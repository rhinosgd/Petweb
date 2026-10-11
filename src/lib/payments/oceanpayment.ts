import type { GatewayConfig } from "./config";
import { buildAutoSubmitForm, generateSign, verifySign } from "./sign";
import type { CreateCheckoutInput, CreateCheckoutResult, PaymentProvider, VerifyCallbackResult } from "./types";

/**
 * 钱海 Oceanpayment Provider（托管收银台）
 * 流程：
 *  1. 后端按参数生成签名，返回一个自动提交表单页面 → 浏览器跳转钱海收银台
 *  2. 用户付款后，钱海异步 POST 到 notifyUrl，本服务验签后更新订单
 *  3. 同步跳回 returnUrl 展示结果
 *
 * ⚠️ 字段名（account/terminal/order_number/order_amount/order_currency/...）
 *    以钱海官方最新文档为准，此处为通用示例结构。
 */
export class OceanPaymentProvider implements PaymentProvider {
  gateway = "OCEANPAYMENT" as const;

  constructor(private cfg: GatewayConfig) {
    if (!cfg.merchantId || !cfg.secureCode) throw new Error("钱海商户号/安全码未配置");
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const params: Record<string, string> = {
      account: this.cfg.merchantId!,
      terminal: this.cfg.terminal ?? "",
      order_number: input.orderNo,
      order_amount: (input.amount / 100).toFixed(2),
      order_currency: input.currency,
      order_note: "",
      backUrl: input.returnUrl,
      noticeUrl: input.notifyUrl,
      billing_email: input.email,
      billing_firstName: input.name ?? ""
    };
    params.signValue = generateSign(params, this.cfg.secureCode!);

    const gatewayUrl = this.cfg.gatewayUrl ?? "https://secure.oceanpayment.com/gateway/service/pay";
    // 返回一段自动提交表单的 HTML（由调用方直接渲染）
    return {
      clientPayload: { html: buildAutoSubmitForm(gatewayUrl, params) },
      gatewayTxnId: input.orderNo
    };
  }

  async verifyCallback(payload: unknown): Promise<VerifyCallbackResult> {
    const body = (payload ?? {}) as Record<string, string>;
    const receivedSign = body.signValue || body.sign || "";
    const ok = verifySign(body, this.cfg.secureCode!, receivedSign);

    const status = body.order_status || body.status;
    const success = ok && (status === "1" || status?.toUpperCase() === "SUCCESS");

    return {
      success,
      orderNo: body.order_number ?? "",
      gatewayTxnId: body.transaction_id ?? body.trade_no,
      amount: body.order_amount ? Math.round(parseFloat(body.order_amount) * 100) : undefined,
      currency: body.order_currency,
      raw: body
    };
  }
}
