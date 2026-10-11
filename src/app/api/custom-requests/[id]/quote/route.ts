import { NextResponse } from "next/server";
import { getCustomRequest, updateCustomRequest } from "@/lib/custom-requests";
import { sendMail, mailQuoteReady } from "@/lib/mailer";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** 后台完成报价 → 状态变为 QUOTED（客户端显示「等待付款」），并邮件通知客户 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { amount, note } = (await req.json()) as { amount: number; note?: string };

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Please enter a valid quote amount." }, { status: 400 });
    }

    const current = await getCustomRequest(params.id);
    if (!current) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const updated = await updateCustomRequest(
      params.id,
      {
        quotedAmount: Math.round(amount),
        quotedNote: note?.trim() || null,
        quotedAt: now,
        status: "QUOTED"
      },
      {
        at: now,
        actor: "admin",
        event: `Quote sent — ${formatPrice(Math.round(amount))}`,
        note: note?.trim() || undefined
      }
    );

    const mail = await sendMail(
      mailQuoteReady(
        current.orderNo,
        current.productTitle,
        current.email,
        formatPrice(Math.round(amount)),
        note?.trim() || null
      )
    );

    return NextResponse.json({ ok: true, request: updated, mailSent: mail.sent, mailDemo: mail.demo });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not send the quote";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
