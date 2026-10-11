"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export type SpecItem = { title: string; content: React.ReactNode; defaultOpen?: boolean };

/**
 * 商品详情折叠区（maxbone 式 Features / Description / Why We Made This / Care）。
 * - 复用全局 .accordion-item / .accordion-panel（grid-rows 0fr→1fr）纯 CSS 过渡
 * - 支持多开（各自独立），首个可默认展开
 */
export function SpecAccordion({ items }: { items: SpecItem[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>(
    Object.fromEntries(items.map((it, i) => [i, Boolean(it.defaultOpen)]))
  );

  return (
    <div className="border-t border-ink/10">
      {items.map((it, i) => {
        const isOpen = open[i];
        return (
          <div key={it.title} className="border-b border-ink/10">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
              className="flex w-full items-center justify-between gap-6 py-5 text-left transition-opacity hover:opacity-70"
            >
              <span className="eyebrow !mb-0">{it.title}</span>
              <Plus
                size={16}
                strokeWidth={1.6}
                className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
              />
            </button>
            <div className="accordion-item" data-open={isOpen}>
              <div className="accordion-panel">
                <div>
                  <div className="pb-6 text-sm leading-relaxed text-ink/80">{it.content}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
