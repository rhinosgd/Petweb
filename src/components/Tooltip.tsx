"use client";

import { cn } from "@/lib/utils";

/**
 * 纯 CSS 短提示（Tooltip）：hover 或键盘聚焦时显现。
 * 用于纯图标按钮的说明文字。带操作按钮的浮层请改用 Popover。
 */
export function Tooltip({
  label,
  children,
  side = "bottom",
  className
}: {
  label: string;
  children: React.ReactNode;
  side?: "bottom" | "top";
  className?: string;
}) {
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap bg-ink px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-white opacity-0 transition-all duration-200 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
        )}
      >
        {label}
      </span>
    </span>
  );
}
