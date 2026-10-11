"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useOverlay } from "@/lib/useOverlay";

/**
 * 模态弹窗：遮罩先变暗 → 面板中央淡入并小幅放大；关闭按相反顺序。
 * 打开期间锁定背景滚动，并把键盘焦点移入弹窗。
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const panelRef = useOverlay(open, onClose);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="overlay flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-6">
          {title && <h2 className="font-serif text-xl">{title}</h2>}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-1 -mt-1 text-ink/65 transition-colors hover:text-ink"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>
        <div className="text-sm text-ink/85">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
