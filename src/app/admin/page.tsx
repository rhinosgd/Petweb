import prisma from "@/lib/prisma";
import { isDemoMode, DEMO_PRODUCTS } from "@/lib/demo-data";
import {
  resolveRange,
  getTrends,
  getCountries,
  getTopProducts,
  getChannels,
  fmtDate,
  type RangeKey
} from "@/lib/analytics";
import { DashboardView, type DashboardData } from "./DashboardView";

export const dynamic = "force-dynamic";

const VALID_RANGES: RangeKey[] = ["today", "7d", "30d", "1y", "custom"];

export default async function AdminDashboard({
  searchParams
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  // ---- 解析时间范围（默认「当天」）----
  const raw = searchParams.range as RangeKey | undefined;
  let rangeKey: RangeKey = raw && VALID_RANGES.includes(raw) ? raw : "today";
  // custom 缺少日期时回落到 today
  if (rangeKey === "custom" && (!searchParams.from || !searchParams.to)) {
    rangeKey = "today";
  }
  const range = resolveRange(rangeKey, { from: searchParams.from, to: searchParams.to });

  // ---- 并发取数 ----
  const [trends, countries, topProducts, channels] = await Promise.all([
    getTrends(range, rangeKey),
    getCountries(range),
    getTopProducts(30),
    getChannels(range)
  ]);

  // ---- 统计卡片 / 最近订单 / 最近商品 ----
  let stats: DashboardData["stats"];
  let recentOrders: DashboardData["recentOrders"];
  let products: DashboardData["products"];
  let counts: DashboardData["counts"];

  if (isDemoMode()) {
    stats = [
      { label: "To Ship", value: 4, hint: "Orders awaiting dispatch" },
      { label: "Shipped", value: 9, hint: "On the way to customers" },
      { label: "Pending Payment", value: 3, hint: "Awaiting payment confirmation" },
      { label: "In Cart", value: 27, hint: "Added but not yet checked out" }
    ];
    recentOrders = [
      { orderNo: "PC20261011120001", email: "emma@example.com", amount: 4800, currency: "USD", gateway: "STRIPE", status: "PAID" },
      { orderNo: "PC20261011120002", email: "liam@example.com", amount: 8900, currency: "USD", gateway: "PAYPAL", status: "PAID" },
      { orderNo: "PC20261011120003", email: "noah@example.com", amount: 2200, currency: "USD", gateway: "OCEANPAYMENT", status: "PENDING" },
      { orderNo: "PC20261011120004", email: "olivia@example.com", amount: 12900, currency: "USD", gateway: "WINTOPAY", status: "FAILED" }
    ];
    products = DEMO_PRODUCTS.map((p) => ({
      title: p.title,
      price: p.price,
      currency: p.currency,
      category: p.category
    }));
  } else {
    const [productCount, orderCount, recent, prod, toShip, shipped, pending] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "REFUNDED" } }),
      prisma.order.count({ where: { status: "PENDING" } })
    ]);
    stats = [
      { label: "To Ship", value: toShip, hint: "Orders awaiting dispatch" },
      { label: "Shipped", value: shipped, hint: "On the way to customers" },
      { label: "Pending Payment", value: pending, hint: "Awaiting payment confirmation" },
      { label: "In Cart", value: 0, hint: "Added but not yet checked out" }
    ];
    recentOrders = recent.map((o) => ({
      orderNo: o.orderNo,
      email: o.email,
      amount: o.amount,
      currency: o.currency,
      gateway: o.gateway,
      status: o.status
    }));
    products = prod.map((p) => ({ title: p.title, price: p.price, currency: p.currency, category: p.category }));
    counts = { productCount, orderCount };
  }

  const data: DashboardData = {
    range: {
      active: rangeKey,
      label: range.label,
      from: fmtDate(range.from),
      to: fmtDate(range.to)
    },
    stats,
    trends,
    countries: {
      visits: countries.visits.map((c) => ({
        country: c.country,
        flag: c.flag,
        visits: c.visits,
        orders: c.orders,
        conversion: c.conversion
      })),
      orders: countries.orders.map((c) => ({
        country: c.country,
        flag: c.flag,
        visits: c.visits,
        orders: c.orders,
        conversion: c.conversion
      }))
    },
    topProducts: topProducts.map((p) => ({ title: p.title, units: p.units, revenue: p.revenue })),
    channels: {
      visits: channels.visits.map((c) => ({
        key: c.key,
        label: c.label,
        visits: c.visits,
        orders: c.orders,
        conversion: c.conversion
      })),
      orders: channels.orders.map((c) => ({
        key: c.key,
        label: c.label,
        visits: c.visits,
        orders: c.orders,
        conversion: c.conversion
      }))
    },
    keywords: channels.keywords,
    creatives: channels.creatives,
    recentOrders,
    products,
    counts
  };

  return <DashboardView data={data} />;
}
