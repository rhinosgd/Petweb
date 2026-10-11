"use client";

import { useMemo, useState } from "react";

/**
 * 订单量 + 销售额 双曲线图（纯内联 SVG，无第三方图表库）。
 * - 左轴：订单数量（青色实线 + 面积）
 * - 右轴：销售额（陶土色实线）
 * - hover 显示当期明细 tooltip，默认高亮最后一点
 */

export interface TrendPoint {
  label: string;
  at: number;
  orders: number;
  revenue: number;
}

const W = 760;
const H = 260;
const PAD = { t: 20, r: 56, b: 34, l: 46 };

export function RevenueOrdersChart({
  data,
  currency = "USD"
}: {
  data: TrendPoint[];
  currency?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const geom = useMemo(() => {
    if (data.length === 0) return null;

    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;

    const maxOrders = Math.max(...data.map((d) => d.orders), 1);
    const maxRev = Math.max(...data.map((d) => d.revenue), 1);

    // 刻度取整到好看的数值
    const orderAxisMax = niceCeil(maxOrders);
    const revAxisMax = niceCeil(maxRev);

    const x = (i: number) => PAD.l + (i * innerW) / Math.max(data.length - 1, 1);
    const yOrders = (v: number) => PAD.t + (1 - v / orderAxisMax) * innerH;
    const yRev = (v: number) => PAD.t + (1 - v / revAxisMax) * innerH;

    const orderPts = data.map((d, i) => [x(i), yOrders(d.orders)] as const);
    const revPts = data.map((d, i) => [x(i), yRev(d.revenue)] as const);

    const toPath = (pts: readonly (readonly [number, number])[]) =>
      pts.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");

    const orderLine = toPath(orderPts);
    const orderArea = `${orderLine} L${orderPts[orderPts.length - 1][0].toFixed(1)},${(H - PAD.b).toFixed(1)} L${orderPts[0][0].toFixed(1)},${(H - PAD.b).toFixed(1)} Z`;

    return {
      innerW,
      innerH,
      orderAxisMax,
      revAxisMax,
      x,
      yOrders,
      yRev,
      orderPts,
      revPts,
      orderLine,
      orderArea,
      revLine: toPath(revPts)
    };
  }, [data]);

  if (!geom || data.length === 0) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-ink/65">No data for this period.</div>;
  }

  // x 轴标签抽稀：最多显示 8 个
  const step = Math.max(1, Math.ceil(data.length / 8));
  const active = hover ?? data.length - 1;
  const ap = data[active];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Orders and revenue trend">
        <defs>
          <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C8A6B" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#7C8A6B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 横向网格 + 左轴（订单量） */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = PAD.t + (i * geom.innerH) / 4;
          const val = Math.round(geom.orderAxisMax * (1 - i / 4));
          return (
            <g key={i}>
              <line
                x1={PAD.l}
                y1={y}
                x2={W - PAD.r}
                y2={y}
                stroke="#1A1A1A"
                strokeOpacity="0.07"
                strokeWidth="1"
              />
              <text x={PAD.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#1A1A1A" opacity="0.6">
                {val}
              </text>
            </g>
          );
        })}

        {/* 右轴（销售额） */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = PAD.t + (i * geom.innerH) / 4;
          const val = geom.revAxisMax * (1 - i / 4);
          return (
            <text key={`r${i}`} x={W - PAD.r + 8} y={y + 4} textAnchor="start" fontSize="10" fill="#A67C52" opacity="0.85">
              {compactMoney(val)}
            </text>
          );
        })}

        {/* 销售额曲线（无填充） */}
        <path d={geom.revLine} fill="none" stroke="#A67C52" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* 订单量曲线 + 面积 */}
        <path d={geom.orderArea} fill="url(#ordersFill)" />
        <path d={geom.orderLine} fill="none" stroke="#5F6E4F" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

        {/* x 轴标签 */}
        {data.map((d, i) =>
          i % step === 0 || i === data.length - 1 ? (
            <text key={i} x={geom.x(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#1A1A1A" opacity="0.6">
              {d.label}
            </text>
          ) : null
        )}

        {/* hover 热区 */}
        {data.map((d, i) => {
          const w = geom.innerW / Math.max(data.length - 1, 1);
          return (
            <rect
              key={`h${i}`}
              x={geom.x(i) - w / 2}
              y={PAD.t}
              width={w}
              height={geom.innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}

        {/* 高亮点 + 竖向指示线 */}
        <line
          x1={geom.x(active)}
          y1={PAD.t}
          x2={geom.x(active)}
          y2={H - PAD.b}
          stroke="#1A1A1A"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <circle cx={geom.x(active)} cy={geom.yRev(ap.revenue)} r="3.5" fill="#fff" stroke="#A67C52" strokeWidth="2" />
        <circle cx={geom.x(active)} cy={geom.yOrders(ap.orders)} r="3.5" fill="#fff" stroke="#5F6E4F" strokeWidth="2" />
      </svg>

      {/* tooltip */}
      <div
        className="pointer-events-none absolute top-1 z-10 min-w-[150px] -translate-x-1/2 rounded-md border border-ink/12 bg-white px-3 py-2 shadow-sm"
        style={{
          left: `${(geom.x(active) / W) * 100}%`,
          transform:
            active > data.length * 0.72
              ? "translateX(-100%)"
              : active < data.length * 0.2
                ? "translateX(0)"
                : "translateX(-50%)"
        }}
      >
        <div className="text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.12em" }}>
          {ap.label}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#5F6E4F" }} />
          <span className="text-ink/75">Orders</span>
          <span className="ml-auto font-medium">{ap.orders}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#A67C52" }} />
          <span className="text-ink/75">Revenue</span>
          <span className="ml-auto font-medium">{formatMoney(ap.revenue, currency)}</span>
        </div>
      </div>

      {/* 图例 */}
      <div className="mt-3 flex items-center gap-5 text-[11px] text-ink/70">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4" style={{ backgroundColor: "#5F6E4F" }} />
          Orders
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4" style={{ backgroundColor: "#A67C52" }} />
          Revenue
        </span>
      </div>
    </div>
  );
}

/** 取一个好看的坐标轴上限（1/2/5 × 10^n） */
function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const n = v / base;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return m * base;
}

function compactMoney(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${Math.round(v)}`;
}

function formatMoney(cents: number, currency: string): string {
  const v = cents / 100;
  return `${currency === "USD" ? "$" : ""}${v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
