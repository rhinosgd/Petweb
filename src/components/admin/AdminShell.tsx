"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { Drawer } from "@/components/Drawer";

/**
 * 管理端外壳：桌面左侧固定侧栏 + 右侧（顶栏 + 内容）；
 * 移动端侧栏收进左侧抽屉。
 */
export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F2EF]">
      {/* 桌面固定侧栏 */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">
        <AdminSidebar />
      </aside>

      <div className="lg:pl-60">
        <AdminTopbar email={email} onMenu={() => setMobileNav(true)} />
        <main className="p-4 md:p-8">{children}</main>
      </div>

      {/* 移动端侧栏抽屉 */}
      <Drawer open={mobileNav} onClose={() => setMobileNav(false)} side="left" title="Menu">
        <nav className="space-y-1">
          <AdminSidebar onNavigate={() => setMobileNav(false)} />
        </nav>
      </Drawer>
    </div>
  );
}
