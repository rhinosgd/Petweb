"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

/**
 * 时间范围切换器：当天 / 7 天 / 30 天 / 1 年 / 自定义。
 * 通过 URL query 同步，交由服务端组件重新取数（保持 SSR 与可分享链接）。
 */

export type RangeKey = "today" | "7d" | "30d" | "1y" | "custom";

const PRESETS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "1y", label: "1 Year" }
];

export function RangeSwitcher({
  active,
  from,
  to
}: {
  active: RangeKey;
  from?: string;
  to?: string;
}) {
  const [customOpen, setCustomOpen] = useState(active === "custom");
  const [cFrom, setCFrom] = useState(from ?? "");
  const [cTo, setCTo] = useState(to ?? "");

  function go(key: RangeKey, extra?: { from: string; to: string }) {
    const params = new URLSearchParams();
    params.set("range", key);
    if (key === "custom" && extra) {
      params.set("from", extra.from);
      params.set("to", extra.to);
    }
    window.location.href = `/admin?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 预设按钮组 */}
      <div className="inline-flex overflow-hidden rounded-md border border-ink/15 bg-white">
        {PRESETS.map((p) => {
          const on = active === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => go(p.key)}
              aria-pressed={on}
              className={`px-3.5 py-2 text-[11px] uppercase transition-colors ${
                on ? "bg-ink text-white" : "text-ink/78 hover:bg-sand hover:text-ink"
              }`}
              style={{ letterSpacing: "0.12em" }}
            >
              {p.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          aria-pressed={active === "custom"}
          className={`flex items-center gap-1.5 border-l border-ink/15 px-3.5 py-2 text-[11px] uppercase transition-colors ${
            active === "custom" ? "bg-ink text-white" : "text-ink/78 hover:bg-sand hover:text-ink"
          }`}
          style={{ letterSpacing: "0.12em" }}
        >
          <Calendar size={12} strokeWidth={1.8} />
          Custom
        </button>
      </div>

      {/* 自定义日期区间 */}
      {customOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2">
          <input
            type="date"
            aria-label="Start date"
            value={cFrom}
            onChange={(e) => setCFrom(e.target.value)}
            className="border border-ink/15 px-2 py-1 text-xs outline-none focus:border-ink"
          />
          <span className="text-xs text-ink/65">to</span>
          <input
            type="date"
            aria-label="End date"
            value={cTo}
            onChange={(e) => setCTo(e.target.value)}
            className="border border-ink/15 px-2 py-1 text-xs outline-none focus:border-ink"
          />
          <button
            type="button"
            disabled={!cFrom || !cTo}
            onClick={() => go("custom", { from: cFrom, to: cTo })}
            className="h-[30px] border border-ink bg-ink px-[0.85rem] text-[11px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
