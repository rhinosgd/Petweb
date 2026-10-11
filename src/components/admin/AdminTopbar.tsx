"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, Search, Bell } from "lucide-react";

/** 后台顶部栏：搜索框、通知（带角标）、头像下拉。 */
export function AdminTopbar({ email, onMenu }: { email: string; onMenu: () => void }) {
  const [open, setOpen] = useState(false);
  const initial = (email || "A").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-ink/10 bg-white/90 px-4 backdrop-blur md:px-8">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenu}
        className="text-ink/78 transition-colors hover:text-ink lg:hidden"
      >
        <Menu size={20} strokeWidth={1.6} />
      </button>

      {/* 搜索 */}
      <div className="flex flex-1 items-center gap-2 border border-ink/15 px-3 py-2 sm:max-w-sm">
        <Search size={16} strokeWidth={1.6} className="text-ink/65" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink/75"
          placeholder="Search products, orders…"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* 通知 */}
        <button
          type="button"
          aria-label="Notifications, 3 unread"
          className="relative text-ink/78 transition-colors hover:text-ink"
        >
          <Bell size={18} strokeWidth={1.6} />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-semibold text-white">
            3
          </span>
        </button>

        {/* 头像 */}
        <div className="relative">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-medium text-white transition-opacity hover:opacity-85"
          >
            {initial}
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-10 z-20 w-52 border border-ink/10 bg-white py-2 shadow-lg" style={{ animation: "fade-in 150ms ease-out" }}>
                <div className="truncate px-4 py-2 text-xs text-ink/70">{email}</div>
                <div className="my-1 h-px bg-ink/10" />
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="block w-full px-4 py-2 text-left text-sm text-ink/85 transition-colors hover:bg-sand hover:text-ink"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
