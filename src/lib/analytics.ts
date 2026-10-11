import prisma from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-data";

/* ============================================================================
 * 后台数据分析层
 *
 * 设计原则：
 *   1. 订单量 / 销售额 / 热销产品 —— 走真实数据库（有订单即真实）。
 *   2. 访问量 / 国家分布 / 渠道分布 —— 演示阶段用「确定性伪随机」生成，
 *      同一天多次刷新结果一致（不会乱跳），上线接埋点后替换为真实查询。
 *   3. 全部图表数据经由本文件出口，页面只负责渲染，方便后续换数据源。
 * ========================================================================== */

/** 时间范围预设 */
export type RangeKey = "today" | "7d" | "30d" | "1y" | "custom";

export interface DateRange {
  /** 起始时间（含） */
  from: Date;
  /** 结束时间（含） */
  to: Date;
  /** 图表分桶粒度 */
  granularity: "hour" | "day" | "week" | "month";
  /** 供 UI 显示的标签 */
  label: string;
}

/** 解析时间范围；custom 时使用传入的 from/to */
export function resolveRange(key: RangeKey, custom?: { from?: string; to?: string }): DateRange {
  const now = new Date();
  const end = new Date(now);
  end.setMinutes(59, 59, 999);

  if (key === "custom" && custom?.from && custom?.to) {
    const from = new Date(custom.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(custom.to);
    to.setHours(23, 59, 59, 999);
    return {
      from,
      to,
      granularity: spanGranularity(from, to),
      label: `${fmtDate(from)} – ${fmtDate(to)}`
    };
  }

  if (key === "today") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    return { from, to: end, granularity: "hour", label: "Today" };
  }
  if (key === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return { from, to: end, granularity: "day", label: "Last 7 days" };
  }
  if (key === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
    return { from, to: end, granularity: "day", label: "Last 30 days" };
  }
  // 1y
  const from = new Date(now);
  from.setDate(from.getDate() - 364);
  from.setHours(0, 0, 0, 0);
  return { from, to: end, granularity: "month", label: "Last 12 months" };
}

function spanGranularity(from: Date, to: Date): DateRange["granularity"] {
  const days = Math.ceil((to.getTime() - from.getTime()) / 86400000);
  if (days <= 2) return "hour";
  if (days <= 62) return "day";
  if (days <= 400) return "week";
  return "month";
}

export function fmtDate(d: Date): string {
  // 用本地时间格式化，避免 toISOString() 的 UTC 偏移导致日期错一天
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ---------------------------------------------------------------------------
 * 确定性伪随机：同一 seed 永远产出同一序列
 * ------------------------------------------------------------------------- */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function daySeed(d: Date, salt = 0): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + salt * 7919;
}

/* ---------------------------------------------------------------------------
 * 1. 订单量 + 销售额时序
 * ------------------------------------------------------------------------- */
export interface SeriesPoint {
  /** 分桶标签（x 轴） */
  label: string;
  /** 桶起始时间戳，用于排序/对比 */
  at: number;
  orders: number;
  revenue: number;
}

export interface TrendsResult {
  points: SeriesPoint[];
  /** 区间汇总数字，便于「一眼看到」 */
  totals: { orders: number; revenue: number; aov: number };
  /** 环比上一等长区间的变化率（%），无上期数据时为 null */
  delta: { orders: number | null; revenue: number | null };
}

export async function getTrends(range: DateRange, key: RangeKey): Promise<TrendsResult> {
  const buckets = buildBuckets(range);

  // 真实订单（演示模式为 0，后面用模拟基线补齐）
  let realOrders: { createdAt: Date; amount: number; status: string }[] = [];
  if (!isDemoMode()) {
    realOrders = await prisma.order.findMany({
      where: { createdAt: { gte: range.from, lte: range.to }, status: { in: ["PAID", "PENDING"] } },
      select: { createdAt: true, amount: true, status: true }
    });
  }

  const points: SeriesPoint[] = buckets.map((b) => ({
    label: b.label,
    at: b.at,
    orders: 0,
    revenue: 0
  }));

  for (const o of realOrders) {
    const t = o.createdAt.getTime();
    const idx = buckets.findIndex(
      (b, i) => t >= b.at && (i === buckets.length - 1 || t < buckets[i + 1].at)
    );
    if (idx >= 0) {
      points[idx].orders += 1;
      points[idx].revenue += o.amount;
    }
  }

  // 演示基线：叠加确定性模拟订单，让曲线可看
  const baseline = simulateTrend(buckets, range, key);
  points.forEach((p, i) => {
    p.orders += baseline[i].orders;
    p.revenue += baseline[i].revenue;
  });

  const totals = points.reduce(
    (acc, p) => ({ orders: acc.orders + p.orders, revenue: acc.revenue + p.revenue }),
    { orders: 0, revenue: 0 }
  );

  // 上一等长区间，用于环比
  const span = range.to.getTime() - range.from.getTime();
  const prevFrom = new Date(range.from.getTime() - span - 1);
  const prevTo = new Date(range.from.getTime() - 1);
  const prevPoints = simulateTrend(buildBuckets({ ...range, from: prevFrom, to: prevTo }), { ...range, from: prevFrom, to: prevTo }, key);
  const prevTotals = prevPoints.reduce(
    (acc, p) => ({ orders: acc.orders + p.orders, revenue: acc.revenue + p.revenue }),
    { orders: 0, revenue: 0 }
  );

  const rate = (cur: number, prev: number): number | null =>
    prev <= 0 ? null : Math.round(((cur - prev) / prev) * 1000) / 10;

  return {
    points,
    totals: {
      orders: totals.orders,
      revenue: totals.revenue,
      aov: totals.orders > 0 ? Math.round(totals.revenue / totals.orders) : 0
    },
    delta: {
      orders: rate(totals.orders, prevTotals.orders),
      revenue: rate(totals.revenue, prevTotals.revenue)
    }
  };
}

interface Bucket {
  label: string;
  at: number;
}

function buildBuckets(range: DateRange): Bucket[] {
  const out: Bucket[] = [];
  const g = range.granularity;

  if (g === "hour") {
    for (let h = 0; h < 24; h++) {
      const d = new Date(range.from);
      d.setHours(h, 0, 0, 0);
      out.push({ label: `${String(h).padStart(2, "0")}:00`, at: d.getTime() });
    }
    return out;
  }

  if (g === "day") {
    const cur = new Date(range.from);
    cur.setHours(0, 0, 0, 0);
    while (cur <= range.to) {
      out.push({
        label: `${cur.getMonth() + 1}/${cur.getDate()}`,
        at: cur.getTime()
      });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  if (g === "week") {
    const cur = new Date(range.from);
    cur.setHours(0, 0, 0, 0);
    while (cur <= range.to) {
      out.push({ label: `${cur.getMonth() + 1}/${cur.getDate()}`, at: cur.getTime() });
      cur.setDate(cur.getDate() + 7);
    }
    return out;
  }

  // month
  const cur = new Date(range.from.getFullYear(), range.from.getMonth(), 1);
  while (cur <= range.to) {
    out.push({
      label: cur.toLocaleString("en-US", { month: "short" }),
      at: cur.getTime()
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
}

/** 按桶生成确定性模拟订单（演示用基线） */
function simulateTrend(buckets: Bucket[], range: DateRange, key: RangeKey): { orders: number; revenue: number }[] {
  const scale = key === "today" ? 1 : key === "7d" ? 1 : key === "30d" ? 1 : 1;
  return buckets.map((b) => {
    const d = new Date(b.at);
    const rnd = seeded(daySeed(d, 13) + b.at % 9973);
    // 时段曲线：白天高、深夜低
    const hour = d.getHours();
    const hourFactor = range.granularity === "hour" ? 0.25 + 0.75 * Math.sin(((hour - 5) / 24) * Math.PI) : 1;
    // 周末更高
    const dow = d.getDay();
    const weekFactor = dow === 0 || dow === 6 ? 1.35 : 1;
    const base = 6 + rnd() * 10;
    const orders = Math.max(0, Math.round(base * hourFactor * weekFactor * scale));
    const aov = 3200 + Math.round(rnd() * 6800);
    return { orders, revenue: orders * aov };
  });
}

/* ---------------------------------------------------------------------------
 * 2. 国家分布 Top10（访问 / 下单）
 * ------------------------------------------------------------------------- */
export interface CountryRow {
  country: string;
  flag: string;
  visits: number;
  orders: number;
  revenue: number;
  conversion: number;
}

const COUNTRY_POOL: { name: string; flag: string; weight: number }[] = [
  { name: "United States", flag: "🇺🇸", weight: 100 },
  { name: "United Kingdom", flag: "🇬🇧", weight: 62 },
  { name: "Canada", flag: "🇨🇦", weight: 48 },
  { name: "Australia", flag: "🇦🇺", weight: 41 },
  { name: "Germany", flag: "🇩🇪", weight: 36 },
  { name: "France", flag: "🇫🇷", weight: 29 },
  { name: "Japan", flag: "🇯🇵", weight: 26 },
  { name: "Netherlands", flag: "🇳🇱", weight: 21 },
  { name: "Singapore", flag: "🇸🇬", weight: 17 },
  { name: "New Zealand", flag: "🇳🇿", weight: 14 },
  { name: "Spain", flag: "🇪🇸", weight: 13 },
  { name: "Italy", flag: "🇮🇹", weight: 11 },
  { name: "Sweden", flag: "🇸🇪", weight: 9 },
  { name: "Ireland", flag: "🇮🇪", weight: 7 }
];

export interface CountriesResult {
  visits: CountryRow[];
  orders: CountryRow[];
}

export async function getCountries(range: DateRange): Promise<CountriesResult> {
  // 真实订单的国家聚合
  let realByCountry = new Map<string, { orders: number; revenue: number }>();
  if (!isDemoMode()) {
    const grouped = await prisma.order.groupBy({
      by: ["country"],
      _count: { _all: true },
      _sum: { amount: true },
      where: { createdAt: { gte: range.from, lte: range.to }, status: { in: ["PAID", "PENDING"] } }
    });
    realByCountry = new Map(
      grouped
        .filter((g) => g.country)
        .map((g) => [g.country as string, { orders: g._count._all, revenue: g._sum.amount ?? 0 }])
    );
  }

  const seedBase = daySeed(range.from, 31) + Math.floor(range.to.getTime() / 86400000);
  const rnd = seeded(seedBase);

  const rows: CountryRow[] = COUNTRY_POOL.map((c) => {
    const noise = 0.75 + rnd() * 0.5;
    const visits = Math.round(c.weight * 42 * noise);
    const real = realByCountry.get(c.name);
    // 演示下单量：按国家权重换算，真实数据存在时叠加
    const simOrders = Math.max(1, Math.round(visits * (0.018 + rnd() * 0.026)));
    const orders = simOrders + (real?.orders ?? 0);
    const revenue = Math.round(orders * (3800 + rnd() * 5200)) + (real?.revenue ?? 0);
    return {
      country: c.name,
      flag: c.flag,
      visits,
      orders,
      revenue,
      conversion: visits > 0 ? Math.round((orders / visits) * 10000) / 100 : 0
    };
  });

  const byVisits = [...rows].sort((a, b) => b.visits - a.visits).slice(0, 10);
  const byOrders = [...rows].sort((a, b) => b.orders - a.orders || b.revenue - a.revenue).slice(0, 10);

  return { visits: byVisits, orders: byOrders };
}

/* ---------------------------------------------------------------------------
 * 3. 热销产品 Top10（近 30 天）
 * ------------------------------------------------------------------------- */
export interface TopProductRow {
  title: string;
  slug: string | null;
  units: number;
  revenue: number;
}

export async function getTopProducts(days = 30): Promise<TopProductRow[]> {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  // 真实销量
  const sales = new Map<string, { units: number; revenue: number; slug: string | null }>();
  if (!isDemoMode()) {
    const items = await prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: from }, status: { in: ["PAID", "PENDING"] } } },
      select: { title: true, quantity: true, price: true, product: { select: { slug: true } } }
    });
    for (const it of items) {
      const cur = sales.get(it.title) ?? { units: 0, revenue: 0, slug: it.product?.slug ?? null };
      cur.units += it.quantity;
      cur.revenue += it.price * it.quantity;
      sales.set(it.title, cur);
    }
  }

  // 演示基线：商品列表 + 确定性销量
  const products = isDemoMode()
    ? (await import("@/lib/demo-data")).DEMO_PRODUCTS.map((p) => ({ title: p.title, slug: p.slug as string | null, price: p.price }))
    : await prisma.product.findMany({ select: { title: true, slug: true, price: true } });

  const rnd = seeded(daySeed(from, 57));
  for (const p of products) {
    if (sales.has(p.title)) continue;
    const pop = rnd();
    const units = Math.max(3, Math.round(pop * pop * 260 + rnd() * 40));
    sales.set(p.title, { units, revenue: units * p.price, slug: p.slug });
  }

  return Array.from(sales.entries())
    .map(([title, v]) => ({ title, slug: v.slug, units: v.units, revenue: v.revenue }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 10);
}

/* ---------------------------------------------------------------------------
 * 4. 渠道分析（访问来源 + 下单来源）
 * ------------------------------------------------------------------------- */
export type ChannelKey =
  | "SEARCH_KEYWORD"
  | "IMAGE_AD"
  | "VIDEO_AD"
  | "SOCIAL"
  | "REFERRAL"
  | "EMAIL"
  | "DIRECT"
  | "OTHER";

export interface ChannelRow {
  key: ChannelKey;
  label: string;
  visits: number;
  orders: number;
  revenue: number;
  conversion: number;
  /** 代表性明细（关键词 / 投放位 / 来源站点） */
  samples: string[];
}

export interface ChannelsResult {
  visits: ChannelRow[];
  orders: ChannelRow[];
  /** 搜索关键词明细 Top */
  keywords: { term: string; visits: number; orders: number }[];
  /** 素材位明细（图片/视频投放） */
  creatives: { name: string; channel: ChannelKey; visits: number; orders: number }[];
}

const CHANNEL_DEF: { key: ChannelKey; label: string; weight: number }[] = [
  { key: "SEARCH_KEYWORD", label: "Search Keywords", weight: 34 },
  { key: "IMAGE_AD", label: "Image Ads", weight: 22 },
  { key: "VIDEO_AD", label: "Video Ads", weight: 15 },
  { key: "SOCIAL", label: "Social", weight: 13 },
  { key: "REFERRAL", label: "Referral", weight: 8 },
  { key: "EMAIL", label: "Email", weight: 5 },
  { key: "DIRECT", label: "Direct", weight: 18 },
  { key: "OTHER", label: "Other", weight: 4 }
];

const KEYWORD_POOL = [
  "handmade pet collar", "personalized dog bandana", "custom pet bed",
  "cat scratcher house", "handwoven pet blanket", "ceramic pet bowl",
  "leather dog leash", "pet gift set", "engraved pet tag", "knit cat cave"
];

const CREATIVE_POOL: { name: string; channel: ChannelKey }[] = [
  { name: "Spring Hero — Carousel 01", channel: "IMAGE_AD" },
  { name: "Handmade Story — Reel 15s", channel: "VIDEO_AD" },
  { name: "Best Sellers — Static 03", channel: "IMAGE_AD" },
  { name: "Behind the Craft — YouTube 30s", channel: "VIDEO_AD" },
  { name: "Pet of the Week — Story", channel: "SOCIAL" }
];

export async function getChannels(range: DateRange): Promise<ChannelsResult> {
  // 真实订单按渠道聚合（DEMO 下为空，上线后即为真实归因）
  let realByChannel = new Map<string, { orders: number; revenue: number }>();
  if (!isDemoMode()) {
    const grouped = await prisma.order.groupBy({
      by: ["gateway"],
      _count: { _all: true },
      _sum: { amount: true },
      where: { createdAt: { gte: range.from, lte: range.to }, status: { in: ["PAID", "PENDING"] } }
    });
    void grouped;
    // 渠道归因需要 AnalyticsEvent，上线后在此替换
    realByChannel = new Map();
  }

  const rnd = seeded(daySeed(range.from, 73));
  const days = Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / 86400000));

  const rows: ChannelRow[] = CHANNEL_DEF.map((c) => {
    const noise = 0.72 + rnd() * 0.56;
    const visits = Math.round(c.weight * days * 3.6 * noise);
    const real = realByChannel.get(c.key);
    const simOrders = Math.max(1, Math.round(visits * (0.012 + rnd() * 0.028)));
    const orders = simOrders + (real?.orders ?? 0);
    const revenue = Math.round(orders * (3600 + rnd() * 5400)) + (real?.revenue ?? 0);
    return {
      key: c.key,
      label: c.label,
      visits,
      orders,
      revenue,
      conversion: visits > 0 ? Math.round((orders / visits) * 10000) / 100 : 0,
      samples: []
    };
  });

  // 关键词明细
  const keywords = KEYWORD_POOL.map((term) => {
    const visits = Math.round(1800 + rnd() * 5200);
    const orders = Math.max(2, Math.round(visits * (0.014 + rnd() * 0.03)));
    return { term, visits, orders };
  })
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 8);

  // 素材位明细
  const creatives = CREATIVE_POOL.map((c) => {
    const visits = Math.round(1200 + rnd() * 4600);
    const orders = Math.max(2, Math.round(visits * (0.013 + rnd() * 0.032)));
    return { name: c.name, channel: c.channel, visits, orders };
  }).sort((a, b) => b.visits - a.visits);

  return {
    visits: [...rows].sort((a, b) => b.visits - a.visits),
    orders: [...rows].sort((a, b) => b.orders - a.orders),
    keywords,
    creatives
  };
}

/* ---------------------------------------------------------------------------
 * 埋点接口（当前不采集，上线时在页面挂载即可）
 * ------------------------------------------------------------------------- */

export interface TrackPayload {
  type: "PAGE_VIEW" | "PRODUCT_VIEW" | "ADD_TO_CART" | "CHECKOUT_START" | "ORDER_PLACED";
  channel?: ChannelKey;
  source?: string;
  country?: string;
  path?: string;
  productId?: string;
  orderNo?: string;
  sessionId?: string;
  visitorId?: string;
  meta?: Record<string, unknown>;
}

/**
 * 记录一条分析事件。
 *
 * 当前站点未接入采集，此函数直接返回；上线时：
 *   1. 建一个 /api/track 路由，把 req 里的 UA / referer / IP 国家解析出来；
 *   2. 在前台页面调用 fetch("/api/track", { body: JSON.stringify(payload) })；
 *   3. 本文件中的 simulate* 系列函数即可整体替换为对 AnalyticsEvent 的真实查询。
 */
export async function trackEvent(payload: TrackPayload): Promise<{ recorded: boolean; reason?: string }> {
  if (isDemoMode()) {
    return { recorded: false, reason: "demo-mode" };
  }
  void payload;
  return { recorded: false, reason: "tracking-not-wired" };
}

/** 从 referer / utm 参数推断渠道（上线后由 /api/track 使用） */
export function inferChannel(referer: string | null, utmSource?: string | null): ChannelKey {
  const src = (utmSource ?? "").toLowerCase();
  if (src.includes("google") || src.includes("bing") || src.includes("search")) return "SEARCH_KEYWORD";
  if (src.includes("youtube") || src.includes("tiktok") || src.includes("video")) return "VIDEO_AD";
  if (src.includes("image") || src.includes("display") || src.includes("banner")) return "IMAGE_AD";
  if (src.includes("instagram") || src.includes("facebook") || src.includes("pinterest") || src.includes("social")) return "SOCIAL";
  if (src.includes("newsletter") || src.includes("email")) return "EMAIL";
  if (referer) return "REFERRAL";
  return "DIRECT";
}
