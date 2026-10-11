import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { isDemoMode } from "@/lib/demo-data";

export const metadata = { title: "Admin · Paw & Craft" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const demo = isDemoMode();
  const session = demo ? { user: { email: "demo@preview" } } : await getServerSession(authOptions);

  // 未登录（登录页）：不加壳，避免登录页出现侧栏
  if (!session) {
    return <div className="min-h-screen bg-[#F4F2EF]">{children}</div>;
  }

  return <AdminShell email={session.user?.email ?? "admin"}>{children}</AdminShell>;
}
