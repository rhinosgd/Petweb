import type { PaymentGateway } from "@prisma/client";

/** 创建支付时的入参 */
export interface CreateCheckoutInput {
  orderNo: string;
  amount: number; // 最小货币单位（分）
  currency: string;
  email: string;
  name?: string;
  returnUrl: string; // 支付成功后跳转
  notifyUrl: string; // 异步通知地址（服务端回调）
  cancelUrl?: string;
}

/** 创建支付的返回 */
export interface CreateCheckoutResult {
  /** 跳转型支付：重定向 URL */
  redirectUrl?: string;
  /** 客户端型支付：传给前端的参数（如 Stripe clientSecret） */
  clientPayload?: Record<string, unknown>;
  /** 本系统内该网关的支付单号/交易号 */
  gatewayTxnId?: string;
}

/** 回调验签结果 */
export interface VerifyCallbackResult {
  success: boolean;
  orderNo: string;
  gatewayTxnId?: string;
  amount?: number;
  currency?: string;
  raw: unknown;
}

/** 支付网关统一接口 */
export interface PaymentProvider {
  gateway: PaymentGateway;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  verifyCallback(payload: unknown, headers?: Record<string, string>): Promise<VerifyCallbackResult>;
}
