"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 带动画的提交按钮。
 * - loading：按钮内旋转图标 + 禁用，防止重复点击
 * - success：变为对勾并显示「Saved」，短暂停留后复位
 * - error：显示错误态文案（可重试）
 */
export function SpinnerButton({
  loading,
  success,
  children,
  successText = "Saved",
  className,
  ...rest
}: {
  loading?: boolean;
  success?: boolean;
  successText?: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    setShowSuccess(true);
    const t = window.setTimeout(() => setShowSuccess(false), 1800);
    return () => window.clearTimeout(t);
  }, [success]);

  const isSuccess = loading === false && showSuccess;

  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        isSuccess && "!bg-sage",
        className
      )}
    >
      {loading && <Loader2 size={15} className="spin" />}
      {isSuccess && <Check size={15} />}
      {isSuccess ? successText : children}
    </button>
  );
}
