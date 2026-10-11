import { NextResponse } from "next/server";
import { createCustomRequest, findCustomRequest, listCustomRequests } from "@/lib/custom-requests";
import { sendMail, mailRequestReceived } from "@/lib/mailer";

export const dynamic = "force-dynamic";

interface Body {
  productId?: string;
  productSlug: string;
  productTitle: string;
  material: string;
  color: string;
  dimensions: string;
  description: string;
  email: string;
  phone?: string;
  attachments?: { name: string; size: number; type: string; url: string }[];
}

/** 提交定做询价 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    // 基础校验
    const missing: string[] = [];
    if (!body.productSlug) missing.push("productSlug");
    if (!body.material?.trim()) missing.push("material");
    if (!body.color?.trim()) missing.push("color");
    if (!body.dimensions?.trim()) missing.push("dimensions");
    if (!body.description?.trim()) missing.push("description");
    if (!body.email?.trim()) missing.push("email");
    if (missing.length) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(body.email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const record = await createCustomRequest({
      productId: body.productId ?? null,
      productSlug: body.productSlug,
      productTitle: body.productTitle ?? "Custom piece",
      material: body.material.trim(),
      color: body.color.trim(),
      dimensions: body.dimensions.trim(),
      description: body.description.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || null,
      attachments: body.attachments ?? []
    });

    // 通知客户：已收到询价
    const mail = await sendMail(
      mailRequestReceived(record.orderNo, record.productTitle, record.email)
    );

    return NextResponse.json({
      ok: true,
      orderNo: record.orderNo,
      id: record.id,
      mailSent: mail.sent,
      mailDemo: mail.demo
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not submit your request";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * 查询定做工单
 *  - ?email=&orderNo=  客户按「邮箱 + 单号」查询（严格校验归属）
 *  - 无参数            后台列表（生产应加鉴权）
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const orderNo = searchParams.get("orderNo");

    if (email && orderNo) {
      const found = await findCustomRequest(email, orderNo);
      if (!found) {
        return NextResponse.json({ error: "No matching request found. Please check your email and reference number." }, { status: 404 });
      }
      return NextResponse.json({ request: found });
    }

    const all = await listCustomRequests();
    return NextResponse.json({ requests: all });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lookup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
