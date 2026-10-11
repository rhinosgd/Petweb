import type { PaymentGateway } from "@prisma/client";
import type { PaymentProvider } from "./types";
import { StripeProvider } from "./stripe";
import { PayPalProvider } from "./paypal";
import { OceanPaymentProvider } from "./oceanpayment";
import { WintopayProvider } from "./wintopay";
import { loadGatewayConfig } from "./config";

/**
 * 支付服务：根据已启用网关动态路由。
 * 密钥来源优先级：数据库 PaymentConfig > 环境变量兜底。
 */
export async function getProvider(gateway: PaymentGateway): Promise<PaymentProvider> {
  const cfg = await loadGatewayConfig(gateway);

  switch (gateway) {
    case "STRIPE":
      return new StripeProvider(cfg);
    case "PAYPAL":
      return new PayPalProvider(cfg);
    case "OCEANPAYMENT":
      return new OceanPaymentProvider(cfg);
    case "WINTOPAY":
      return new WintopayProvider(cfg);
    default:
      throw new Error(`Unsupported gateway: ${gateway}`);
  }
}

export type { PaymentProvider } from "./types";
export * from "./types";
