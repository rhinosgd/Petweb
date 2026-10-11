import crypto from "crypto";

/**
 * 生成表单签名（用于钱海 / Wintopay 等托管收银台）。
 * 规则：将非空参数按 key 升序拼接成 key=value&... 再追加密钥做 SHA-256。
 * 注意：不同网关具体拼接规则略有差异，落地时请以官方文档为准，
 *      此处提供通用实现，可按 gateway 微调。
 */
export function generateSign(params: Record<string, string | number>, secureCode: string): string {
  const sorted = Object.keys(params)
    .filter((k) => k !== "sign" && params[k] !== undefined && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const raw = `${sorted}&${secureCode}`;
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex").toUpperCase();
}

/** 验签：回调时用同样规则重算并比对 */
export function verifySign(
  params: Record<string, string | number>,
  secureCode: string,
  receivedSign: string
): boolean {
  const expected = generateSign(params, secureCode);
  return expected.toUpperCase() === String(receivedSign).toUpperCase();
}

/** 生成自动提交的 HTML 表单（跳转到托管收银台） */
export function buildAutoSubmitForm(action: string, params: Record<string, string>): string {
  const inputs = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${escapeHtml(String(v))}" />`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redirecting…</title></head>
<body onload="document.forms[0].submit()">
<form method="POST" action="${escapeHtml(action)}">${inputs}
<noscript><button type="submit">Continue to payment</button></noscript>
</form></body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
