import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { PaymentGateway } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session;
}

// 读取支付配置（含 @ts 检查忽略）
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    gateway: PaymentGateway;
    enabled?: boolean;
    displayName?: string;
    currencies?: string[];
    apiKey?: string;
    secret?: string;
    merchantId?: string;
    terminal?: string;
    secureCode?: string;
    gatewayUrl?: string;
  };

  const config = await prisma.paymentConfig.update({
    where: { gateway: body.gateway },
    data: {
      enabled: body.enabled,
      displayName: body.displayName,
      currencies: body.currencies,
      apiKey: body.apiKey,
      secret: body.secret,
      merchantId: body.merchantId,
      terminal: body.terminal,
      secureCode: body.secureCode,
      gatewayUrl: body.gatewayUrl
    }
  });
  // 不返回敏感秘钥明文（此处演示环境简化处理）
  return NextResponse.json({ ok: true, gateway: config.gateway, enabled: config.enabled });
}
