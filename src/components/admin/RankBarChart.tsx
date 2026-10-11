"use client";

import { useState } from "react";

/**
 * 横向条形图（纯内联 SVG/CSS），适用于国家 Top10、渠道分布等排行类数据。
 * 支持两个数值列（如 访问量 / 下单量），条形宽度按主指标归一化。
 */

export interface BarRow {
  /** 行主键 */
  key: string;
  /** 主标签（国家名 / 渠道名） */
  label: string;
  /** 前置图标或旗帜（emoji 文本） */
  prefix?: string;
  /** 主指标（决定条形长度） */
  primary: number;
  /** 次指标（显示为右侧数字） */
  secondary?: number;
  /** 第三指标（如转化率 / 销售额），显示在末尾 */
  tertiary?: string;
  /** 自定义条形颜色 */
  color?: string;
}

export function RankBarChart({
  rows,
  primaryLabel = "Visits",
  secondaryLabel = "Orders",
  tertiaryLabel,
  emptyText = "No data for this period."
}: {
  rows: BarRow[];
  primaryLabel?: string;
  secondaryLabel?: string;
  tertiaryLabel?: string;
  emptyText?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);

  if (rows.length === 0) {
    return <div className="py-10 text-center text-sm text-ink/65">{emptyText}</div>;
  }

  const max = Math.max(...rows.map((r) => r.primary), 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        {/* 表头 */}
        <div className="mb-2 flex items-center gap-3 border-b border-ink/10 pb-2 text-[10px] uppercase text-ink/65" style={{ letterSpacing: "0.14em" }}>
          <span className="w-6 shrink-0" />
          <span className="min-w-0 flex-1">Country / Channel</span>
          <span className="w-16 shrink-0 text-right">{primaryLabel}</span>
          <span className="w-16 shrink-0 text-right">{secondaryLabel}</span>
          {tertiaryLabel && <span className="w-16 shrink-0 text-right">{tertiaryLabel}</span>}
        </div>

        <ul className="space-y-1">
          {rows.map((r, i) => {
            const pct = (r.primary / max) * 100;
            const isHover = hover === r.key;
            return (
              <li
                key={r.key}
                className="relative flex items-center gap-3 rounded px-1 py-1.5 transition-colors"
                style={{ backgroundColor: isHover ? "rgba(26,26,26,0.035)" : "transparent" }}
                onMouseEnter={() => setHover(r.key)}
                onMouseLeave={() => setHover(null)}
              >
                {/* 排名 */}
                <span className="w-6 shrink-0 text-[11px] tabular-nums text-ink/50">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* 标签 + 条形 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    {r.prefix && <span className="text-sm leading-none">{r.prefix}</span>}
                    <span className="truncate text-sm">{r.label}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                    <div
                      className="h-full rounded-full transition-[width] duration-500 ease-out"
                      style={{
                        width: `${Math.max(pct, 1.5)}%`,
                        backgroundColor: r.color ?? "#A67C52"
                      }}
                    />
                  </div>
                </div>

                {/* 指标数字 */}
                <span className="w-16 shrink-0 text-right text-sm tabular-nums">
                  {r.primary.toLocaleString("en-US")}
                </span>
                <span className="w-16 shrink-0 text-right text-sm tabular-nums text-ink/78">
                  {r.secondary !== undefined ? r.secondary.toLocaleString("en-US") : "—"}
                </span>
                {tertiaryLabel && (
                  <span className="w-16 shrink-0 text-right text-xs tabular-nums text-ink/65">
                    {r.tertiary ?? "—"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
