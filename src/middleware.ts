import { NextResponse } from "next/server";

/**
 * 演示模式：后台无需登录，直接放行（便于预览）。
 * 生产模式：由 NextAuth 保护，未登录跳转 /admin/login。
 */
export default function middleware(req: Request) {
  if (process.env.DEMO_MODE === "true") {
    return NextResponse.next();
  }
  const url = new URL(req.url);
  // 未登录时简单重定向至登录页（生产环境建议用 withAuth）
  if (url.pathname.startsWith("/admin") && url.pathname !== "/admin/login") {
    const authed = req.headers.get("cookie")?.includes("next-auth.session-token");
    if (!authed) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
