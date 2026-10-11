import { handleCallback } from "@/lib/payments/callback";

/** Wintopay 异步通知：兼容 form-urlencoded / JSON */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let params: Record<string, string>;
  if (contentType.includes("application/json")) {
    params = await req.json();
  } else {
    const text = await req.text();
    params = Object.fromEntries(new URLSearchParams(text).entries());
  }
  return handleCallback("WINTOPAY", params, {});
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return handleCallback("WINTOPAY", params, {});
}
