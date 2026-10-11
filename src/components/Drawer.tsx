"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useOverlay } from "@/lib/useOverlay";
import { cn } from "@/lib/utils";

/**
 * 抽屉：从侧边滑入，背景轻微遮罩，关闭时原路退回。
 * 移动端接近全屏；支持向下滑动关闭。
 */
export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer
}: {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left";
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const panelRef = useOverlay(open, onClose);
  const startY = useRef<number | null>(null);

  // 下滑关闭（仅移动端触摸）
  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startY.current == null || !panelRef.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) panelRef.current.style.transform = `translateY(${Math.min(dy, 160)}px)`;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (startY.current == null || !panelRef.current) return;
    const dy = e.changedTouches[0].clientY - startY.current;
    panelRef.current.style.transform = "";
    if (dy > 80) onClose();
    startY.current = null;
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn("drawer-panel", side === "left" && "is-left")}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="eyebrow !mb-0">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-ink/65 transition-colors hover:text-ink"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="border-t border-ink/10 px-6 py-5">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
