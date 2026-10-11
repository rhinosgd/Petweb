"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Variant = "success" | "error" | "info";

interface ToastState {
  message: string;
  variant: Variant;
  id: number;
}

interface ToastApi {
  toast: (message: string, variant?: Variant) => void;
}

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/**
 * 单例 Toast：连续操作只更新同一条提示（不堆叠、不遮挡页面）。
 * 显示 2.4s 后淡出；新消息重置计时并复用同一容器。
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState | null>(null);
  const [out, setOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  const toast = useCallback((message: string, variant: Variant = "info") => {
    // 重置：新消息覆盖旧的，并重新计时
    if (timer.current) window.clearTimeout(timer.current);
    setOut(false);
    setState({ message, variant, id: Date.now() });
    timer.current = window.setTimeout(() => {
      setOut(true);
      timer.current = window.setTimeout(() => setState(null), 220);
    }, 2400);
  }, []);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const icon = state?.variant === "success" ? "✓" : state?.variant === "error" ? "!" : "i";

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted && state &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className={`toast ${out ? "is-out" : ""}`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                state.variant === "error" ? "bg-red-500" : state.variant === "success" ? "bg-sage" : "bg-white/25"
              }`}
            >
              {icon}
            </span>
            {state.message}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
