import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export default function SuccessPage({ searchParams }: { searchParams: { order?: string; demo?: string } }) {
  const isDemo = searchParams.demo === "1";

  return (
    <>
      <SiteHeader />
      <section className="container-narrow section text-center">
        <span className="eyebrow">Order Confirmed</span>
        <h1 className="h-section mx-auto mt-6 max-w-2xl">Thank you. It's on its way.</h1>
        <p className="body-lg mx-auto mt-6 max-w-md">
          {isDemo
            ? "(Demo mode — this was a simulated order. No real payment was processed.)"
            : "We've received your order and are confirming your payment."}
        </p>

        <div className="mx-auto mt-14 max-w-md border border-ink/10 p-8 text-left text-sm">
          <div className="flex justify-between py-3 border-b border-ink/10">
            <span className="uppercase tracking-widest text-ink/65 text-[11px]">Order</span>
            <span className="font-mono text-xs">{searchParams.order ?? "PC2026101112345678"}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-ink/10">
            <span className="uppercase tracking-widest text-ink/65 text-[11px]">Total</span>
            <span>$128.00</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="uppercase tracking-widest text-ink/65 text-[11px]">Status</span>
            <span>Paid</span>
          </div>
        </div>

        <Link href="/products" className="btn-outline mt-12">Continue Shopping</Link>
      </section>
      <SiteFooter />
    </>
  );
}
