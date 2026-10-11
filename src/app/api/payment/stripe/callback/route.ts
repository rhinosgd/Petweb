import { handleCallback } from "@/lib/payments/callback";

export async function POST(req: Request) {
  const raw = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
  // Stripe 需要原始 body 验签
  return handleCallback("STRIPE", raw, headers);
}
