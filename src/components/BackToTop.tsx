"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/useOverlay";

/**
 * 返回顶部：滚动超过 800px 后淡入，固定右下角。
 * reduced-motion 时取消平滑滚动。
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
      className={`backtotop ${visible ? "" : "is-hidden"}`}
    >
      <ArrowUp size={18} strokeWidth={1.6} />
    </button>
  );
}
