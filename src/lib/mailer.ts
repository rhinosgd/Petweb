/**
 * 邮件通知层（预留真实服务接口 + 演示模式模拟）
 *
 * 生产接入方式（二选一，改 sendMail 内部即可）：
 *   1) SMTP      —— 安装 nodemailer，用 SMTP_HOST/SMTP_USER/SMTP_PASS 发信
 *   2) SendGrid  —— 设置 SENDGRID_API_KEY，fetch https://api.sendgrid.com/v3/mail/send
 *
 * 当前 DEMO_MODE=true：不真的发信，只把邮件内容打到服务端日志，
 * 并返回 { sent: true, demo: true } 让前端可以展示「邮件提醒已发送」。
 */

export type MailPayload = {
  to: string;
  subject: string;
  /** 纯文本正文（生产可换成 HTML 模板） */
  text: string;
};

export type MailResult = { sent: boolean; demo: boolean; error?: string };

const DEMO = () => process.env.DEMO_MODE === "true";

export async function sendMail(payload: MailPayload): Promise<MailResult> {
  if (DEMO()) {
    // 演示：写日志，方便在服务端控制台/日志里核对邮件内容
    console.log(
      [
        "\n==================== [DEMO EMAIL] ====================",
        `To      : ${payload.to}`,
        `Subject : ${payload.subject}`,
        "------------------------------------------------------",
        payload.text,
        "======================================================\n"
      ].join("\n")
    );
    return { sent: true, demo: true };
  }

  // ---- 真实发送（生产启用）----
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      return { sent: false, demo: false, error: "No mail provider configured (set SENDGRID_API_KEY or SMTP_*)" };
    }
    const from = process.env.MAIL_FROM ?? "no-reply@pawandcraft.com";
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: from, name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Paw & Craft" },
        subject: payload.subject,
        content: [{ type: "text/plain", value: payload.text }]
      })
    });
    if (!res.ok) {
      return { sent: false, demo: false, error: `SendGrid responded ${res.status}` };
    }
    return { sent: true, demo: false };
  } catch (e) {
    return { sent: false, demo: false, error: e instanceof Error ? e.message : "Unknown mail error" };
  }
}

/* ============ 邮件模板 ============ */

const SIGNOFF = "\n\n— Paw & Craft\nHandcrafted pet essentials";

/** 客户提交询价后 → 通知客户已收到 */
export function mailRequestReceived(orderNo: string, productTitle: string, email: string): MailPayload {
  return {
    to: email,
    subject: `We've received your custom request (${orderNo})`,
    text:
      `Thank you for your custom request for "${productTitle}".\n\n` +
      `Your reference number is ${orderNo}.\n` +
      `Our makers will review your requirements and reply with a quote within 48 hours. ` +
      `You can also track the status any time under My Custom Orders using your email and this reference number.` +
      SIGNOFF
  };
}

/** 后台完成报价后 → 通知客户可以决定 */
export function mailQuoteReady(
  orderNo: string,
  productTitle: string,
  email: string,
  amountText: string,
  note?: string | null
): MailPayload {
  return {
    to: email,
    subject: `Your custom quote is ready (${orderNo})`,
    text:
      `Good news — we've finished pricing your custom request for "${productTitle}".\n\n` +
      `Quoted price: ${amountText}\n` +
      (note ? `Note from our makers: ${note}\n` : "") +
      `\nPlease review and either accept (then complete payment) or decline with a reason, ` +
      `under My Custom Orders using your email and reference ${orderNo}.` +
      SIGNOFF
  };
}

/** 客户接受后 → 确认已进入待付款 */
export function mailQuoteAccepted(orderNo: string, email: string, amountText: string): MailPayload {
  return {
    to: email,
    subject: `Custom order confirmed — awaiting payment (${orderNo})`,
    text:
      `Thank you for accepting your custom quote of ${amountText}.\n\n` +
      `An order has been created for you and is now awaiting payment. ` +
      `You'll find it under My Custom Orders — complete payment there and we'll begin making your piece.` +
      SIGNOFF
  };
}

/** 客户拒绝后 → 通知后台（内部邮箱） */
export function mailQuoteDeclined(orderNo: string, email: string, reason?: string | null): MailPayload {
  return {
    to: process.env.MAIL_INTERNAL ?? "orders@pawandcraft.com",
    subject: `[Internal] Custom quote declined (${orderNo})`,
    text:
      `The customer (${email}) declined the quote for ${orderNo}.\n\n` +
      (reason ? `Reason given:\n${reason}` : "No reason was provided.") +
      SIGNOFF
  };
}
