"use client";

import { useState } from "react";

/**
 * 竖向柱状图（纯内联 SVG），适用于「热销产品 Top10」这类带长名称的排行数据。
 * 柱子带渐入动画，hover 显示明细。
 */

export interface ColumnDatum {
  label: string;
  value: number;
  /** tooltip 补充信息，如销售额 */
  extra?: string;
}

export function ColumnChart({
  data,
  height = 240,
  valueLabel = "Units sold",
  emptyText = "No sales in this period."
}: {
  data: ColumnDatum[];
  height?: number;
  valueLabel?: string;
  emptyText?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="flex items-center justify-center py-12 text-sm text-ink/65">{emptyText}</div>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  // 柱数较多时给一个最小宽度，超出则由父容器横向滚动，避免压扁或撑破布局
  const minColWidth = 44;
  const chartMinWidth = data.length * minColWidth;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: chartMinWidth }}>
        {/* 柱子区 */}
        <div className="flex items-end gap-2" style={{ height }}>
          {data.map((d, i) => {
            const pct = (d.value / max) * 100;
            const isHover = hover === i;
            return (
              <div
                key={`${d.label}-${i}`}
                className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {/* 数值 */}
                <div
                  className={`mb-1 text-center text-[10px] tabular-nums transition-opacity duration-200 ${
                    isHover ? "text-ink opacity-100" : "text-ink/60 opacity-90"
                  }`}
                >
                  {d.value}
                </div>

                {/* 柱体 */}
                <div
                  className="w-full rounded-t transition-[height,background-color] duration-500 ease-out"
                  style={{
                    height: `${Math.max(pct, 2)}%`,
                    backgroundColor: isHover ? "#8C6644" : "#A67C52"
                  }}
                />

                {/* tooltip */}
                {isHover && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 w-max max-w-[220px] -translate-x-1/2 rounded-md border border-ink/12 bg-white px-3 py-2 shadow-sm">
                    <div className="text-xs leading-snug">{d.label}</div>
                    <div className="mt-1 text-[11px] text-ink/70">
                      {valueLabel}: <span className="font-medium text-ink">{d.value}</span>
                      {d.extra ? ` · ${d.extra}` : ""}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* x 轴标签 */}
        <div className="mt-2 flex gap-2 border-t border-ink/10 pt-2">
          {data.map((d, i) => (
            <div
              key={`lbl-${i}`}
              className="min-w-0 flex-1 text-center text-[10px] leading-tight text-ink/70"
              title={d.label}
            >
              <span className="line-clamp-2">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
