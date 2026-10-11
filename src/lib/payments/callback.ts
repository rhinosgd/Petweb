import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProvider } from "@/lib/payments";
import type { PaymentGateway } from "@prisma/client";

/**
 * 通用回调处理器：由各网关的 callback 路由调用。
 * 负责：验签 → 幂等更新订单 → 返回各网关要求的成功响应。
 */
export async function handleCallback(
  gateway: PaymentGateway,
  payload: unknown,
  headers: Record<string, string>
): Promise<NextResponse> {
  try {
    const provider = await getProvider(gateway);
    const result = await provider.verifyCallback(payload, headers);

    if (!result.success || !result.orderNo) {
      return NextResponse.json({ code: "FAIL", message: "验签失败" }, { status: 400 });
    }

    // 幂等：已付款则直接返回成功
    const order = await prisma.order.findUnique({ where: { orderNo: result.orderNo } });
    if (!order) {
      return NextResponse.json({ code: "FAIL", message: "订单不存在" }, { status: 404 });
    }
    if (order.status === "PAID") {
      return successResponse(gateway);
    }

    // 金额校验（防篡改）
    if (result.amount !== undefined && result.amount !== order.amount) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED", gatewayRaw: result.raw as never }
      });
      return NextResponse.json({ code: "FAIL", message: "金额不匹配" }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        gatewayTxnId: result.gatewayTxnId ?? order.gatewayTxnId,
        gatewayRaw: result.raw as never
      }
    });

    return successResponse(gateway);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "回调处理失败";
    return NextResponse.json({ code: "FAIL", message: msg }, { status: 500 });
  }
}

/** 各网关要求的成功响应格式不同 */
function successResponse(gateway: PaymentGateway): NextResponse {
  if (gateway === "OCEANPAYMENT" || gateway === "WINTOPAY") {
    // 多数托管收银台要求返回纯文本 "SUCCESS"
    return new NextResponse("SUCCESS", { status: 200 });
  }
  return NextResponse.json({ received: true });
}
