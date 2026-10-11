import { handleCallback } from "@/lib/payments/callback";

export async function POST(req: Request) {
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
  const body = await req.json().catch(() => ({}));
  return handleCallback("PAYPAL", body, headers);
}
