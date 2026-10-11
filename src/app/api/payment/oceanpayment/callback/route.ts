import { handleCallback } from "@/lib/payments/callback";

/** 钱海异步通知：form-urlencoded POST */
export async function POST(req: Request) {
  const text = await req.text();
  const params = Object.fromEntries(new URLSearchParams(text).entries());
  return handleCallback("OCEANPAYMENT", params, {});
}

/** 部分网关也用 GET 回跳 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return handleCallback("OCEANPAYMENT", params, {});
}
