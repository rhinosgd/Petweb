import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

/** 供前端结账页查询：当前启用的支付方式 */
export async function GET() {
  if (isDemoMode()) {
    // 演示模式：返回四家网关示意
    return NextResponse.json([
      { gateway: "STRIPE", displayName: "Credit Card · Stripe", currencies: ["USD"] },
      { gateway: "PAYPAL", displayName: "PayPal", currencies: ["USD"] },
      { gateway: "OCEANPAYMENT", displayName: "Oceanpayment", currencies: ["USD"] },
      { gateway: "WINTOPAY", displayName: "Wintopay", currencies: ["USD"] }
    ]);
  }
  const configs = await prisma.paymentConfig.findMany({
    where: { enabled: true },
    select: { gateway: true, displayName: true, currencies: true }
  });
  return NextResponse.json(configs);
}
