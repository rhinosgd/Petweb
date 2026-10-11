import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { isDemoMode } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

const DEMO_ORDERS = [
  { id: "1", orderNo: "PC20261011120001", email: "emma@example.com", amount: 4800, currency: "USD", gateway: "STRIPE", status: "PAID", createdAt: new Date(), items: [{ id: "i1", title: "Handmade Leather Dog Collar", quantity: 1, price: 4800, customText: "Luna" }] },
  { id: "2", orderNo: "PC20261011120002", email: "liam@example.com", amount: 8900, currency: "USD", gateway: "PAYPAL", status: "PAID", createdAt: new Date(), items: [{ id: "i2", title: "Cozy Knit Pet Bed", quantity: 1, price: 8900, customText: null }] },
  { id: "3", orderNo: "PC20261011120003", email: "noah@example.com", amount: 4400, currency: "USD", gateway: "OCEANPAYMENT", status: "PENDING", createdAt: new Date(), items: [{ id: "i3", title: "Personalized Pet Bandana", quantity: 2, price: 2200, customText: "Milo" }] },
  { id: "4", orderNo: "PC20261011120004", email: "olivia@example.com", amount: 12900, currency: "USD", gateway: "WINTOPAY", status: "FAILED", createdAt: new Date(), items: [{ id: "i4", title: "Handmade Cat Scratcher House", quantity: 1, price: 12900, customText: null }] }
];

export default async function OrdersPage() {
  const orders = isDemoMode()
    ? DEMO_ORDERS
    : await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl">Orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono text-xs">{o.orderNo}</div>
              <div className="flex items-center gap-3 text-sm">
                <span>{o.gateway}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
              <div><span className="text-ink/70">Customer: </span>{o.email}</div>
              <div><span className="text-ink/70">Amount: </span>{formatPrice(o.amount, o.currency)}</div>
              <div><span className="text-ink/70">Date: </span>{new Date(o.createdAt).toLocaleString("en-US")}</div>
            </div>
            {o.items.length > 0 && (
              <div className="mt-3 border-t border-ink/5 pt-3 text-sm">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.title} × {it.quantity}{it.customText ? ` (Custom: ${it.customText})` : ""}</span>
                    <span>{formatPrice(it.price * it.quantity, o.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <div className="card text-center text-ink/65">No orders yet</div>}
      </div>
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
