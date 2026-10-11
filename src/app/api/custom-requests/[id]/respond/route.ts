import { NextResponse } from "next/server";
import { getCustomRequest, updateCustomRequest } from "@/lib/custom-requests";
import { sendMail, mailQuoteAccepted, mailQuoteDeclined } from "@/lib/mailer";
import { formatPrice, generateOrderNo } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * 客户响应报价
 *  action = "accept" → 状态 ACCEPTED，生成待付款订单号（linkedOrderNo），邮件确认
 *  action = "decline" → 状态 DECLINED，记录理由，邮件通知后台
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { action, reason } = (await req.json()) as { action: "accept" | "decline"; reason?: string };

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const current = await getCustomRequest(params.id);
    if (!current) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    if (current.status !== "QUOTED") {
      return NextResponse.json(
        { error: "This request is not awaiting your decision." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    if (action === "accept") {
      // 生成「等待付款」订单号：客户在客户端可看到并发起付款
      const linkedOrderNo = generateOrderNo();
      const updated = await updateCustomRequest(
        params.id,
        { status: "ACCEPTED", respondedAt: now, linkedOrderNo },
        {
          at: now,
          actor: "customer",
          event: `Quote accepted — order ${linkedOrderNo} created`,
          note: `Amount ${formatPrice(current.quotedAmount ?? 0)}`
        }
      );
      const mail = await sendMail(
        mailQuoteAccepted(current.orderNo, current.email, formatPrice(current.quotedAmount ?? 0))
      );
      return NextResponse.json({
        ok: true,
        request: updated,
        linkedOrderNo,
        mailSent: mail.sent,
        mailDemo: mail.demo
      });
    }

    // decline
    const updated = await updateCustomRequest(
      params.id,
      { status: "DECLINED", respondedAt: now, declineReason: reason?.trim() || null },
      {
        at: now,
        actor: "customer",
        event: "Quote declined",
        note: reason?.trim() || undefined
      }
    );
    const mail = await sendMail(mailQuoteDeclined(current.orderNo, current.email, reason?.trim() || null));
    return NextResponse.json({ ok: true, request: updated, mailSent: mail.sent, mailDemo: mail.demo });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not record your response";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
