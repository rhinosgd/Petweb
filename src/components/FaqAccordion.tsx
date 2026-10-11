"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * FAQ 手风琴：同一时间只展开一项；答案向下展开，下方内容平稳下移；
 * 展开项高亮，加号旋转为减号；动画 200ms。
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="accordion-item" data-open={isOpen}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left transition-colors"
              >
                <span
                  className={`font-serif text-xl transition-colors md:text-2xl ${
                    isOpen ? "text-clay" : "text-ink group-hover:text-ink/85"
                  }`}
                >
                  {item.q}
                </span>
                <span
                  className={`shrink-0 text-ink/70 transition-transform duration-200 ${
                    isOpen ? "rotate-45 text-clay" : ""
                  }`}
                  aria-hidden
                >
                  <Plus size={20} strokeWidth={1.5} />
                </span>
              </button>
            </h3>
            <div className="accordion-panel">
              <div>
                <p className="max-w-2xl pb-7 text-sm leading-relaxed text-ink/78">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
