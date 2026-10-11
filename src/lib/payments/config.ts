import type { PaymentGateway } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface GatewayConfig {
  gateway: PaymentGateway;
  enabled: boolean;
  apiKey?: string | null;
  secret?: string | null;
  merchantId?: string | null;
  terminal?: string | null;
  secureCode?: string | null;
  gatewayUrl?: string | null;
  currencies: string[];
}

/** 读取网关配置：DB 优先，环境变量兜底 */
export async function loadGatewayConfig(gateway: PaymentGateway): Promise<GatewayConfig> {
  const db = await prisma.paymentConfig.findUnique({ where: { gateway } });

  const envMap: Record<PaymentGateway, Partial<GatewayConfig>> = {
    STRIPE: {
      apiKey: process.env.STRIPE_SECRET_KEY,
      secret: process.env.STRIPE_WEBHOOK_SECRET
    },
    PAYPAL: {
      apiKey: process.env.PAYPAL_CLIENT_ID,
      secret: process.env.PAYPAL_CLIENT_SECRET
    },
    OCEANPAYMENT: {
      merchantId: process.env.OCEANPAYMENT_ACCOUNT,
      terminal: process.env.OCEANPAYMENT_TERMINAL,
      secureCode: process.env.OCEANPAYMENT_SECURE_CODE,
      gatewayUrl: process.env.OCEANPAYMENT_GATEWAY_URL
    },
    WINTOPAY: {
      merchantId: process.env.WINTOPAY_MERCHANT_ID,
      secureCode: process.env.WINTOPAY_SECRET_KEY,
      gatewayUrl: process.env.WINTOPAY_GATEWAY_URL
    }
  };

  const env = envMap[gateway] ?? {};

  return {
    gateway,
    enabled: db?.enabled ?? false,
    apiKey: db?.apiKey || env.apiKey || null,
    secret: db?.secret || env.secret || null,
    merchantId: db?.merchantId || env.merchantId || null,
    terminal: db?.terminal || env.terminal || null,
    secureCode: db?.secureCode || env.secureCode || null,
    gatewayUrl: db?.gatewayUrl || env.gatewayUrl || null,
    currencies: db?.currencies ?? ["USD"]
  };
}
