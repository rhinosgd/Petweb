"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * 字段错误反馈：出错时输入框短促抖动一次，下方显示具体原因与修正方法。
 * error 变化（非空）时重放抖动动画。
 */
export function FieldError({
  error,
  children,
  className
}: {
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!error || !wrapRef.current) return;
    const el = wrapRef.current;
    el.classList.remove("shake");
    // 强制重排以便重放动画
    void el.offsetWidth;
    el.classList.add("shake");
    const t = window.setTimeout(() => el.classList.remove("shake"), 400);
    return () => window.clearTimeout(t);
  }, [error]);

  return (
    <div className={className}>
      <div ref={wrapRef}>{children}</div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
