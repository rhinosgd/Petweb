import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { generateOrderNo } from "@/lib/utils";
import { getProvider } from "@/lib/payments";
import type { PaymentGateway } from "@prisma/client";

interface CheckoutBody {
  gateway: PaymentGateway;
  email: string;
  name?: string;
  country?: string;
  address?: string;
  items: {
    productId?: string;
    title: string;
    price: number;
    quantity: number;
    customText?: string;
    style?: string;
    size?: string;
  }[];
  locale?: string;
}

/**
 * 创建订单并发起支付。
 * 返回：
 *  - redirectUrl：跳转型（PayPal / 钱海 / Wintopay）
 *  - clientPayload.html：托管收银台自动提交表单
 *  - clientPayload.clientSecret：Stripe 前端确认用
 *  - orderNo：订单号
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;

    if (!body.email || !body.items?.length) {
      return NextResponse.json({ error: "邮箱和商品不能为空" }, { status: 400 });
    }

    const currency = "USD";
    const amount = body.items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // 校验网关是否启用
    const cfg = await prisma.paymentConfig.findUnique({ where: { gateway: body.gateway } });
    if (!cfg?.enabled) {
      return NextResponse.json({ error: "该支付方式未启用" }, { status: 400 });
    }

    const orderNo = generateOrderNo();
    const order = await prisma.order.create({
      data: {
        orderNo,
        email: body.email,
        name: body.name,
        country: body.country,
        address: body.address,
        amount,
        currency,
        gateway: body.gateway,
        status: "PENDING",
        items: {
          create: body.items.map((it) => ({
            productId: it.productId ?? null,
            title: it.title,
            price: it.price,
            quantity: it.quantity,
            customText: it.customText ?? null,
            style: it.style ?? null,
            size: it.size ?? null
          }))
        }
      }
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const provider = await getProvider(body.gateway);

    const result = await provider.createCheckout({
      orderNo,
      amount,
      currency,
      email: body.email,
      name: body.name,
      returnUrl: `${siteUrl}/checkout/success?order=${orderNo}`,
      cancelUrl: `${siteUrl}/checkout?canceled=1`,
      notifyUrl: `${siteUrl}/api/payment/${body.gateway.toLowerCase()}/callback`
    });

    // 记录网关交易号
    if (result.gatewayTxnId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { gatewayTxnId: result.gatewayTxnId }
      });
    }

    return NextResponse.json({
      orderNo,
      redirectUrl: result.redirectUrl,
      clientPayload: result.clientPayload
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "支付发起失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
