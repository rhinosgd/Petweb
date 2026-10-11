"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Package,
  CreditCard,
  ClipboardList,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/custom-orders", label: "Custom Requests", icon: Sparkles },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Site Settings", icon: Settings }
];

/** 管理端左侧导航（桌面固定）。移动端内容相同，放入 Drawer。 */
export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/admin" onClick={onNavigate} className="font-serif text-lg">
          Paw &amp; Craft
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {ADMIN_LINKS.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={17} strokeWidth={1.6} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          target="_blank"
          className="block rounded-md px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/10 hover:text-white"
        >
          View Site ↗
        </Link>
      </div>
    </div>
  );
}
