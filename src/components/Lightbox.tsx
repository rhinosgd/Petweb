"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { useOverlay } from "@/lib/useOverlay";

/**
 * 全屏图片放大预览：点击关闭或按 ESC 恢复原状。
 */
export function Lightbox({
  src,
  alt,
  open,
  onClose
}: {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const panelRef = useOverlay(open, onClose);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      style={{ animation: "fade-in 200ms ease-out" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — enlarged`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-5 top-5 text-white/70 transition-colors hover:text-white"
      >
        <X size={26} strokeWidth={1.4} />
      </button>
      <div ref={panelRef} tabIndex={-1} className="relative h-full max-h-[88vh] w-full max-w-4xl">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-contain"
          style={{ animation: "scale-in 220ms cubic-bezier(0.2,0.8,0.2,1)" }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <span className="absolute bottom-6 text-[11px] uppercase tracking-widest text-white/50">
        Click anywhere or press Esc to close
      </span>
    </div>,
    document.body
  );
}
