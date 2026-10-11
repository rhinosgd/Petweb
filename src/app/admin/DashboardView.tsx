"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, DollarSign, MousePointerClick, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { RevenueOrdersChart } from "@/components/admin/RevenueOrdersChart";
import { RankBarChart } from "@/components/admin/RankBarChart";
import { ColumnChart } from "@/components/admin/ColumnChart";
import { RangeSwitcher, type RangeKey } from "@/components/admin/RangeSwitcher";

/* ============================================================================
 * 后台 Dashboard 数据分析视图
 * ========================================================================== */

export interface StatCard {
  label: string;
  value: number;
  hint: string;
}

export interface TrendPointDTO {
  label: string;
  at: number;
  orders: number;
  revenue: number;
}

export interface CountryRowDTO {
  country: string;
  flag: string;
  visits: number;
  orders: number;
  conversion: number;
}

export interface ChannelRowDTO {
  key: string;
  label: string;
  visits: number;
  orders: number;
  conversion: number;
}

export interface TopProductDTO {
  title: string;
  units: number;
  revenue: number;
}

export interface KeywordDTO {
  term: string;
  visits: number;
  orders: number;
}

export interface CreativeDTO {
  name: string;
  channel: string;
  visits: number;
  orders: number;
}

export interface DashboardData {
  range: { active: RangeKey; label: string; from: string; to: string };
  stats: StatCard[];
  trends: {
    points: TrendPointDTO[];
    totals: { orders: number; revenue: number; aov: number };
    delta: { orders: number | null; revenue: number | null };
  };
  countries: { visits: CountryRowDTO[]; orders: CountryRowDTO[] };
  topProducts: TopProductDTO[];
  channels: { visits: ChannelRowDTO[]; orders: ChannelRowDTO[] };
  keywords: KeywordDTO[];
  creatives: CreativeDTO[];
  recentOrders: {
    orderNo: string;
    email: string;
    amount: number;
    currency: string;
    gateway: string;
    status: string;
  }[];
  products: { title: string; price: number; currency: string; category: string }[];
  counts?: { productCount: number; orderCount: number };
}

type CountryTab = "visits" | "orders";
type ChannelTab = "visits" | "orders";

export function DashboardView({ data }: { data: DashboardData }) {
  const [countryTab, setCountryTab] = useState<CountryTab>("visits");
  const [channelTab, setChannelTab] = useState<ChannelTab>("visits");

  const { trends, range } = data;

  // 国家行 → 图表数据
  const countryRows = (
    (countryTab === "visits" ? data.countries.visits : data.countries.orders) as CountryRowDTO[]
  ).map((c) => ({
    key: c.country,
    label: c.country,
    prefix: c.flag,
    primary: countryTab === "visits" ? c.visits : c.orders,
    secondary: countryTab === "visits" ? c.orders : c.visits,
    tertiary: `${c.conversion}%`,
    color: countryTab === "visits" ? "#7C8A6B" : "#A67C52"
  }));

  const channelRows = (
    (channelTab === "visits" ? data.channels.visits : data.channels.orders) as ChannelRowDTO[]
  ).map((c) => ({
    key: c.key,
    label: c.label,
    primary: channelTab === "visits" ? c.visits : c.orders,
    secondary: channelTab === "visits" ? c.orders : c.visits,
    tertiary: `${c.conversion}%`,
    color: channelTab === "visits" ? "#A67C52" : "#5F6E4F"
  }));

  return (
    <div>
      {/* ===== 页头 + 时间范围 ===== */}
      <div className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-ink/70">
              Performance overview ·{" "}
              <span className="text-ink/85">{range.label}</span>
              {data.counts ? ` · ${data.counts.productCount} products · ${data.counts.orderCount} orders` : ""}
            </p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm">
            <span className="text-ink/70">Total revenue</span>{" "}
            <span className="font-semibold">{formatPrice(trends.totals.revenue)}</span>
          </div>
        </div>

        <div className="mt-4">
          <RangeSwitcher active={range.active} from={range.from} to={range.to} />
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Demo mode: order, revenue and product figures are computed from live queries; visit, country
        and channel figures are sample data. Set <code>DEMO_MODE=false</code> and wire the tracking
        endpoint to switch everything to real data.
      </div>

      {/* ===== 订单量 / 销售额 曲线图 + 关键数字 ===== */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] [&>*]:min-w-0">
        <div className="card">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl">Orders &amp; Revenue</h2>
            <span className="text-xs text-ink/65">{range.label}</span>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-4 border-b border-ink/10 pb-5">
            <MetricBlock
              icon={<ShoppingBag size={15} strokeWidth={1.8} />}
              label="Orders"
              value={trends.totals.orders.toLocaleString("en-US")}
              delta={trends.delta.orders}
            />
            <MetricBlock
              icon={<DollarSign size={15} strokeWidth={1.8} />}
              label="Revenue"
              value={formatPrice(trends.totals.revenue)}
              delta={trends.delta.revenue}
            />
            <MetricBlock
              icon={<TrendingUp size={15} strokeWidth={1.8} />}
              label="Avg. Order Value"
              value={formatPrice(trends.totals.aov)}
            />
          </div>

          <RevenueOrdersChart data={trends.points} />
        </div>

        {/* 统计卡片（原四项保留） */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {data.stats.map((s) => (
            <div key={s.label} className="card transition-shadow duration-300 hover:shadow-md">
              <div className="text-xs uppercase tracking-wide text-ink/70">{s.label}</div>
              <div className="mt-2 text-3xl font-semibold">{s.value}</div>
              <div className="mt-1 text-xs text-ink/65">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 国家分布 Top10 ===== */}
      <div className="mt-8 card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl">Top 10 Countries</h2>
            <p className="mt-1 text-xs text-ink/65">
              Visits and orders by country · {range.label}
            </p>
          </div>
          <TabGroup
            value={countryTab}
            onChange={(v) => setCountryTab(v as CountryTab)}
            options={[
              { value: "visits", label: "By Visits" },
              { value: "orders", label: "By Orders" }
            ]}
          />
        </div>
        <RankBarChart
          rows={countryRows}
          primaryLabel={countryTab === "visits" ? "Visits" : "Orders"}
          secondaryLabel={countryTab === "visits" ? "Orders" : "Visits"}
          tertiaryLabel="CVR"
        />
      </div>

      {/* ===== 热销产品 Top10（近 30 天） ===== */}
      <div className="mt-8 card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl">Top 10 Products</h2>
            <p className="mt-1 text-xs text-ink/65">Units sold over the last 30 days</p>
          </div>
          <Link href="/admin/products" className="text-sm text-clay hover:underline">
            Manage products →
          </Link>
        </div>
        <ColumnChart
          data={data.topProducts.map((p) => ({
            label: p.title,
            value: p.units,
            extra: formatPrice(p.revenue)
          }))}
          valueLabel="Units sold"
        />
      </div>

      {/* ===== 渠道分析 ===== */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="card">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl">Traffic Channels</h2>
              <p className="mt-1 text-xs text-ink/65">Where visitors come from · {range.label}</p>
            </div>
            <TabGroup
              value={channelTab}
              onChange={(v) => setChannelTab(v as ChannelTab)}
              options={[
                { value: "visits", label: "Visits" },
                { value: "orders", label: "Orders" }
              ]}
            />
          </div>
          <RankBarChart
            rows={channelRows}
            primaryLabel={channelTab === "visits" ? "Visits" : "Orders"}
            secondaryLabel={channelTab === "visits" ? "Orders" : "Visits"}
            tertiaryLabel="CVR"
          />
        </div>

        <div className="space-y-6">
          {/* 搜索关键词 */}
          <div className="card">
            <div className="mb-4 flex items-center gap-2">
              <MousePointerClick size={15} strokeWidth={1.8} className="text-ink/65" />
              <h2 className="font-serif text-lg">Top Search Keywords</h2>
            </div>
            <ul className="space-y-2.5">
              {data.keywords.map((k) => (
                <li key={k.term} className="flex items-center justify-between gap-3 border-b border-ink/5 pb-2.5 last:border-0 last:pb-0">
                  <span className="truncate text-sm">{k.term}</span>
                  <span className="flex shrink-0 items-center gap-4 text-xs tabular-nums">
                    <span className="text-ink/70">{k.visits.toLocaleString("en-US")} visits</span>
                    <span className="w-16 text-right text-ink/85">{k.orders} orders</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 素材位（图片 / 视频） */}
          <div className="card">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={15} strokeWidth={1.8} className="text-ink/65" />
              <h2 className="font-serif text-lg">Creative Performance</h2>
            </div>
            <ul className="space-y-2.5">
              {data.creatives.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-3 border-b border-ink/5 pb-2.5 last:border-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded-sm bg-sand px-1.5 py-0.5 text-[10px] uppercase text-ink/70" style={{ letterSpacing: "0.08em" }}>
                      {c.channel === "VIDEO_AD" ? "Video" : c.channel === "IMAGE_AD" ? "Image" : "Social"}
                    </span>
                    <span className="truncate text-sm">{c.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-4 text-xs tabular-nums">
                    <span className="text-ink/70">{c.visits.toLocaleString("en-US")} visits</span>
                    <span className="w-16 text-right text-ink/85">{c.orders} orders</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ===== 最近项目 + 最近订单（保留） ===== */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr] [&>*]:min-w-0">
        <div className="card">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent Products</h2>
            <Link href="/admin/products" className="text-sm text-clay hover:underline">View all →</Link>
          </div>
          <ul className="space-y-4">
            {data.products.slice(0, 5).map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3 border-b border-ink/5 pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <div className="truncate text-sm">{p.title}</div>
                  <div className="text-xs capitalize text-ink/65">{p.category}</div>
                </div>
                <span className="shrink-0 text-sm text-ink/78">{formatPrice(p.price, p.currency)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent Orders</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-clay hover:underline">
              View all <ArrowUpRight size={14} strokeWidth={1.6} />
            </Link>
          </div>
          <div className="card overflow-x-auto !p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 text-left text-ink/70">
                <tr>
                  <th className="px-5 py-3">Order No.</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Gateway</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.orderNo} className="border-b border-ink/5 transition-colors last:border-0 hover:bg-sand/50">
                    <td className="px-5 py-3 font-mono text-xs">{o.orderNo}</td>
                    <td className="px-5 py-3">{o.email}</td>
                    <td className="px-5 py-3">{formatPrice(o.amount, o.currency)}</td>
                    <td className="px-5 py-3">{o.gateway}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 子件 */

function MetricBlock({
  icon,
  label,
  value,
  delta
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: number | null;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase text-ink/65" style={{ letterSpacing: "0.14em" }}>
        <span className="text-ink/55">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</div>
      {delta !== undefined && delta !== null && (
        <div className={`mt-0.5 text-[11px] ${delta >= 0 ? "text-red-600" : "text-green-600"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs previous
        </div>
      )}
    </div>
  );
}

function TabGroup({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-ink/15">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`px-3 py-1.5 text-[11px] uppercase transition-colors ${
            value === o.value ? "bg-ink text-white" : "text-ink/78 hover:bg-sand hover:text-ink"
          }`}
          style={{ letterSpacing: "0.12em" }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-gray-100 text-gray-600"
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs ${map[status] ?? ""}`}>{status}</span>;
}
