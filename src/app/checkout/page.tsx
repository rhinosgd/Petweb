"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import {
  getCart,
  clearCart,
  setCart as persistCart,
  cartTotal,
  cartCount,
  variantKey,
  STYLE_OPTIONS,
  SIZE_OPTIONS,
  getPendingVariant,
  setPendingVariant,
  type CartItem
} from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { SiteFooter } from "@/components/SiteChrome";
import { SpinnerButton } from "@/components/SpinnerButton";
import { FieldError } from "@/components/FieldError";
import { Lock, Tag, Truck, RotateCcw, ShieldCheck, ChevronDown, X } from "lucide-react";

interface Method {
  gateway: "STRIPE" | "PAYPAL" | "OCEANPAYMENT" | "WINTOPAY";
  displayName: string;
  currencies: string[];
}

/** 配送方式（运价参考 maxbone 公开运费表） */
const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Shipping", eta: "3–7 business days", price: 900 },
  { id: "express", label: "Expedited Shipping", eta: "1–3 business days", price: 1900 },
  { id: "international", label: "International Shipping", eta: "7–10 business days", price: 4800 }
];

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 7500; // $75

export default function CheckoutPage() {
  const [cart, setLocalCart] = useState<CartItem[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [gateway, setGateway] = useState<Method["gateway"] | "">("");
  const [form, setForm] = useState({
    email: "",
    name: "",
    country: "United States",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phone: ""
  });
  const [shipping, setShipping] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  /** 空车状态下预选的 Style / Size（加购时自动套用） */
  const [pendingStyle, setPendingStyle] = useState("");
  const [pendingSize, setPendingSize] = useState("");

  useEffect(() => {
    setLocalCart(getCart());
    const onUpdate = () => setLocalCart(getCart());
    window.addEventListener("cart-updated", onUpdate);

    const pv = getPendingVariant();
    if (pv.style) setPendingStyle(pv.style);
    if (pv.size) setPendingSize(pv.size);

    fetch("/api/payment/methods")
      .then((r) => r.json())
      .then((data: Method[]) => {
        setMethods(data);
        if (data[0]) setGateway(data[0].gateway);
      })
      .catch(() => {});

    return () => window.removeEventListener("cart-updated", onUpdate);
  }, []);

  /** 就地更新某一行（规格 / 数量）并同步 localStorage */
  function patchItem(key: string, patch: Partial<CartItem>) {
    const next = cart.map((c) => (variantKey(c) === key ? { ...c, ...patch } : c));
    persistCart(next);
    setLocalCart(next);
  }

  function removeItem(key: string) {
    const next = cart.filter((c) => variantKey(c) !== key);
    persistCart(next);
    setLocalCart(next);
  }

  /** 空车时预选规格 → 写入偏好，加购时自动套用 */
  function updatePending(patch: { style?: string; size?: string }) {
    const nextStyle = patch.style !== undefined ? patch.style : pendingStyle;
    const nextSize = patch.size !== undefined ? patch.size : pendingSize;
    setPendingStyle(nextStyle);
    setPendingSize(nextSize);
    setPendingVariant({ style: nextStyle || undefined, size: nextSize || undefined });
  }

  const subtotal = cartTotal(cart);
  const shipOption = SHIPPING_OPTIONS.find((s) => s.id === shipping) ?? SHIPPING_OPTIONS[0];
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shipOption.price;
  const discountAmount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const taxBase = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxBase * TAX_RATE);
  const total = taxBase + shippingCost + tax;
  const freeShipRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const gatewayLabel = useMemo(
    () => methods.find((m) => m.gateway === gateway)?.displayName ?? "",
    [methods, gateway]
  );

  async function submit() {
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setEmailError("Please enter a valid email address, e.g. you@example.com");
      return;
    }
    setEmailError("");
    if (!gateway) return setError("Please select a payment method.");
    if (!agreeTerms) return setError("Please agree to the Terms of Service to continue.");
    if (cart.length === 0) return setError("Your cart is empty.");

    setLoading(true);
    setError("");
    try {
      if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        clearCart();
        window.location.href = "/checkout/success?demo=1";
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateway,
          email: form.email,
          name: form.name,
          country: form.country,
          address: [form.address, form.address2, form.city, form.state, form.zip]
            .filter(Boolean)
            .join(", "),
          items: cart.map((c) => ({
            productId: c.id,
            title: c.title,
            price: c.price,
            quantity: c.quantity,
            customText: c.customText,
            style: c.style,
            size: c.size
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment could not be started");

      if (data.clientPayload?.html) {
        clearCart();
        document.open();
        document.write(data.clientPayload.html);
        document.close();
        return;
      }
      if (data.redirectUrl) {
        clearCart();
        window.location.href = data.redirectUrl;
        return;
      }
      if (data.clientPayload?.clientSecret) {
        clearCart();
        alert("Stripe payment created. In production, confirm the payment here with Stripe.js.");
        return;
      }
      setError("Unrecognized payment response.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://js.stripe.com/v3/" strategy="lazyOnload" />

      {/* ===== 结算页极简品牌头（不放主导航，减少跳出）===== */}
      <header className="border-b border-ink/10 bg-white">
        <div className="container-content flex h-16 items-center justify-between md:h-20">
          <span className="text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.18em" }}>
            Secure Checkout
          </span>
          <Link href="/" className="font-serif text-2xl font-medium tracking-tight md:text-[26px]">
            Paw &amp; Craft
          </Link>
          <span className="flex items-center gap-2 text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.18em" }}>
            <Lock size={13} strokeWidth={1.8} />
            Encrypted
          </span>
        </div>
        {/* 步骤进度条 */}
        <div className="container-content pb-4">
          <ol className="flex items-center justify-center gap-3 text-[10px] uppercase md:gap-5 md:text-[11px]" style={{ letterSpacing: "0.16em" }}>
            <li className="text-ink/65">Cart</li>
            <li className="text-ink/55">—</li>
            <li className="border-b-2 border-ink pb-1 text-ink">Information</li>
            <li className="text-ink/55">—</li>
            <li className="text-ink/65">Payment</li>
            <li className="text-ink/55">—</li>
            <li className="text-ink/65">Confirmation</li>
          </ol>
        </div>
      </header>

      <section className="container-content py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
          {/* ================= 左侧：表单 ================= */}
          <div>
            {/* ---- Express Checkout ---- */}
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px flex-1 bg-ink/10" />
                <span className="text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.18em" }}>
                  Express Checkout
                </span>
                <span className="h-px flex-1 bg-ink/10" />
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {["Apple Pay", "Google Pay", "PayPal", "Shop Pay"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setError(`${p} requires live merchant credentials — enable it in Admin → Payments.`)}
                    className="flex h-11 items-center justify-center border border-ink/15 bg-white text-[11px] font-medium uppercase text-ink/85 transition-colors hover:border-ink hover:text-ink"
                    style={{ letterSpacing: "0.1em" }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-4">
                <span className="h-px flex-1 bg-ink/10" />
                <span className="text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.18em" }}>
                  Or continue below
                </span>
                <span className="h-px flex-1 bg-ink/10" />
              </div>
            </div>

            {/* ---- Contact ---- */}
            <section className="mb-10">
              <h2 className="eyebrow mb-6">Contact</h2>
              <FieldError error={emailError}>
                <label className="label" htmlFor="email">Email *</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </FieldError>
              <div className="mt-6">
                <label className="label" htmlFor="phone">Phone (optional)</label>
                <input
                  id="phone"
                  className="input"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </section>

            {/* ---- Delivery ---- */}
            <section className="mb-10">
              <h2 className="eyebrow mb-6">Delivery</h2>
              <div className="space-y-6">
                <div>
                  <label className="label" htmlFor="country">Country / Region</label>
                  <select
                    id="country"
                    className="input"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  >
                    {["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", "Singapore", "Other"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    className="input"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="address">Address</label>
                  <input
                    id="address"
                    className="input"
                    autoComplete="address-line1"
                    placeholder="Street address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="address2">Apartment, suite, etc. (optional)</label>
                  <input
                    id="address2"
                    className="input"
                    autoComplete="address-line2"
                    value={form.address2}
                    onChange={(e) => setForm({ ...form, address2: e.target.value })}
                  />
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <label className="label" htmlFor="city">City</label>
                    <input
                      id="city"
                      className="input"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="state">State / Province</label>
                    <input
                      id="state"
                      className="input"
                      autoComplete="address-level1"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="zip">ZIP / Postal code</label>
                    <input
                      id="zip"
                      className="input"
                      autoComplete="postal-code"
                      value={form.zip}
                      onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ---- Shipping Method ---- */}
            <section className="mb-10">
              <h2 className="eyebrow mb-6">Shipping Method</h2>
              <div className="border border-ink/15">
                {SHIPPING_OPTIONS.map((s) => {
                  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;
                  const active = shipping === s.id;
                  return (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 text-sm transition-colors last:border-b-0 ${
                        active ? "bg-sand" : "hover:bg-sand/50"
                      }`}
                    >
                      <span className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shipping-method"
                          checked={active}
                          onChange={() => setShipping(s.id)}
                        />
                        <span>
                          <span className="block">{s.label}</span>
                          <span className="mt-0.5 block text-xs text-ink/65">{s.eta}</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-sm">
                        {isFree || s.price === 0 ? "Free" : formatPrice(s.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
              {freeShipRemaining > 0 && (
                <p className="mt-3 flex items-center gap-2 text-xs text-ink/70">
                  <Truck size={13} strokeWidth={1.7} />
                  Add {formatPrice(freeShipRemaining)} more for complimentary shipping.
                </p>
              )}
            </section>

            {/* ---- Payment ---- */}
            <section className="mb-10">
              <h2 className="eyebrow mb-6">Payment</h2>
              <p className="mb-5 text-xs text-ink/70">All transactions are secure and encrypted.</p>

              {methods.length === 0 && (
                <p className="mb-4 text-sm text-amber-600">
                  No payment methods are enabled. Turn them on in Admin → Payments.
                </p>
              )}

              <div className="border border-ink/15">
                {methods.map((m) => {
                  const active = gateway === m.gateway;
                  return (
                    <div key={m.gateway} className="border-b border-ink/10 last:border-b-0">
                      <label className="flex cursor-pointer items-center gap-4 px-5 py-4 text-sm">
                        <input
                          type="radio"
                          name="gateway"
                          checked={active}
                          onChange={() => setGateway(m.gateway)}
                        />
                        <span>{m.displayName}</span>
                      </label>

                      {/* 选中后展开卡号表单（仅前端展示，真实字段由各网关托管） */}
                      {active && m.gateway === "STRIPE" && (
                        <div className="space-y-4 border-t border-ink/10 bg-sand/50 px-5 py-5">
                          <div>
                            <label className="label">Card Number</label>
                            <input className="input" placeholder="1234 1234 1234 1234" inputMode="numeric" />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                              <label className="label">Expiry</label>
                              <input className="input" placeholder="MM / YY" inputMode="numeric" />
                            </div>
                            <div className="col-span-1">
                              <label className="label">CVC</label>
                              <input className="input" placeholder="123" inputMode="numeric" />
                            </div>
                            <div className="col-span-1">
                              <label className="label">Name on Card</label>
                              <input className="input" placeholder="Full name" />
                            </div>
                          </div>
                          <p className="flex items-center gap-2 text-[11px] text-ink/65">
                            <Lock size={12} strokeWidth={1.8} />
                            Card details are tokenized by Stripe and never touch our servers.
                          </p>
                        </div>
                      )}

                      {active && m.gateway !== "STRIPE" && (
                        <div className="border-t border-ink/10 bg-sand/50 px-5 py-5 text-sm text-ink/75">
                          You will be redirected to <strong className="font-medium text-ink">{m.displayName}</strong> to
                          complete your purchase securely.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ---- Gift card / discount code ---- */}
            <section className="mb-10">
              <button
                type="button"
                onClick={() => setDiscountOpen((v) => !v)}
                aria-expanded={discountOpen}
                className="flex items-center gap-2 text-[11px] uppercase text-ink/70 transition-colors hover:text-ink"
                style={{ letterSpacing: "0.16em" }}
              >
                <Tag size={13} strokeWidth={1.8} />
                Gift card or discount code
                <ChevronDown
                  size={14}
                  strokeWidth={1.8}
                  className={`transition-transform duration-200 ${discountOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div className="accordion-item" data-open={discountOpen}>
                <div className="accordion-panel">
                  <div>
                    <div className="flex gap-3 pt-4">
                      <input
                        className="input flex-1"
                        placeholder="Enter code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setDiscountApplied(discountCode.trim() || null)}
                        className="btn-outline shrink-0 !px-6 !py-3"
                      >
                        Apply
                      </button>
                    </div>
                    {discountApplied && (
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-ink/78">
                          <Tag size={12} strokeWidth={1.8} />
                          Code <strong className="font-medium text-ink">{discountApplied}</strong> applied — 10% off
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountApplied(null);
                            setDiscountCode("");
                          }}
                          className="flex items-center gap-1 text-ink/65 transition-colors hover:text-ink"
                        >
                          <X size={12} strokeWidth={2} />
                          Remove
                        </button>
                      </div>
                    )}
                    <p className="mt-3 text-[11px] text-ink/65">
                      Only one promo code may be applied per order. Codes cannot be combined with store credit or gift cards.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <SpinnerButton loading={loading} onClick={submit} className="btn-primary w-full">
              {loading ? "Processing…" : `Pay Now · ${formatPrice(total)}`}
            </SpinnerButton>

            {/* ---- 信任徽章 ---- */}
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "Secure Payment", desc: "256-bit SSL encryption" },
                { icon: RotateCcw, title: "Easy Returns", desc: "14-day return window" },
                { icon: Truck, title: "Worldwide Shipping", desc: "Ships to 60+ countries" }
              ].map((b) => (
                <li key={b.title} className="flex items-start gap-3">
                  <b.icon size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink/65" />
                  <span>
                    <span className="block text-[11px] font-medium uppercase" style={{ letterSpacing: "0.14em" }}>
                      {b.title}
                    </span>
                    <span className="block text-xs text-ink/65">{b.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= 右侧：订单摘要 ================= */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            {/* 移动端折叠开关 */}
            <button
              type="button"
              onClick={() => setSummaryOpen((v) => !v)}
              aria-expanded={summaryOpen}
              className="mb-4 flex w-full items-center justify-between border-y border-ink/10 py-4 lg:hidden"
            >
              <span className="flex items-center gap-2 text-[11px] uppercase" style={{ letterSpacing: "0.16em" }}>
                {summaryOpen ? "Hide order summary" : "Show order summary"}
                <ChevronDown
                  size={14}
                  strokeWidth={1.8}
                  className={`transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""}`}
                />
              </span>
              <span className="text-base">{formatPrice(total)}</span>
            </button>

            <div className={`${summaryOpen ? "block" : "hidden"} lg:block bg-sand p-6 md:p-8`}>
              <h2 className="eyebrow mb-6">Order Summary</h2>

              {/* ===== 空车状态：仍展示 Style / Size 区块 ===== */}
              {cart.length === 0 && (
                <div className="border border-dashed border-ink/25 bg-white/60 p-4">
                  <p className="text-sm text-ink/85">Your cart is empty.</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/70">
                    Pick your preferences below — we&apos;ll apply them automatically to the
                    next item you add.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="pending-style"
                        className="mb-1 block text-[10px] uppercase text-ink/65"
                        style={{ letterSpacing: "0.14em" }}
                      >
                        Style
                      </label>
                      <select
                        id="pending-style"
                        className="w-full border border-ink/20 bg-white px-2 py-1.5 text-xs outline-none focus:border-ink"
                        value={pendingStyle}
                        onChange={(e) => updatePending({ style: e.target.value })}
                      >
                        <option value="">Select</option>
                        {STYLE_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="pending-size"
                        className="mb-1 block text-[10px] uppercase text-ink/65"
                        style={{ letterSpacing: "0.14em" }}
                      >
                        Size
                      </label>
                      <select
                        id="pending-size"
                        className="w-full border border-ink/20 bg-white px-2 py-1.5 text-xs outline-none focus:border-ink"
                        value={pendingSize}
                        onChange={(e) => updatePending({ size: e.target.value })}
                      >
                        <option value="">Select</option>
                        {SIZE_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(pendingStyle || pendingSize) && (
                    <p className="mt-3 text-[11px] text-ink/70">
                      Saved: {pendingStyle || "—"} · {pendingSize || "—"}
                    </p>
                  )}

                  <Link
                    href="/products"
                    className="mt-4 inline-flex h-10 items-center justify-center border border-ink bg-ink px-6 text-[11px] font-medium uppercase text-white transition-colors hover:bg-ink/85"
                    style={{ letterSpacing: "0.16em" }}
                  >
                    Continue shopping
                  </Link>
                </div>
              )}

              <ul className="space-y-6">
                {cart.map((c) => {
                  const key = variantKey(c);
                  return (
                    <li key={key} className="flex gap-4">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-white">
                        {c.image && (
                          <Image src={c.image} alt={c.title} fill sizes="80px" className="object-cover" />
                        )}
                        <button
                          type="button"
                          aria-label={`Remove ${c.title}`}
                          onClick={() => removeItem(key)}
                          className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-ink/20 bg-white text-ink/70 transition-colors hover:border-ink hover:text-ink"
                        >
                          <X size={11} strokeWidth={2.2} />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm leading-snug">{c.title}</span>
                          <span className="shrink-0 text-sm">{formatPrice(c.price * c.quantity, c.currency)}</span>
                        </div>
                        {c.customText && (
                          <div className="mt-1 text-xs text-ink/65">“{c.customText}”</div>
                        )}

                        {/* ===== Style / Size 选择器（可选，选了就存进购物车）===== */}
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-[10px] uppercase text-ink/65" style={{ letterSpacing: "0.14em" }}>
                              Style
                            </label>
                            <select
                              className="w-full border border-ink/20 bg-white px-2 py-1.5 text-xs outline-none focus:border-ink"
                              value={c.style ?? ""}
                              onChange={(e) => patchItem(key, { style: e.target.value || undefined })}
                            >
                              <option value="">Select</option>
                              {STYLE_OPTIONS.map((o) => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] uppercase text-ink/65" style={{ letterSpacing: "0.14em" }}>
                              Size
                            </label>
                            <select
                              className="w-full border border-ink/20 bg-white px-2 py-1.5 text-xs outline-none focus:border-ink"
                              value={c.size ?? ""}
                              onChange={(e) => patchItem(key, { size: e.target.value || undefined })}
                            >
                              <option value="">Select</option>
                              {SIZE_OPTIONS.map((o) => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* 数量 */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center border border-ink/20 bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              className="px-2.5 py-1 text-sm transition-colors hover:bg-sand"
                              onClick={() => patchItem(key, { quantity: Math.max(1, c.quantity - 1) })}
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-xs">{c.quantity}</span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              className="px-2.5 py-1 text-sm transition-colors hover:bg-sand"
                              onClick={() => patchItem(key, { quantity: c.quantity + 1 })}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(key)}
                            className="text-[10px] uppercase text-ink/65 transition-colors hover:text-ink"
                            style={{ letterSpacing: "0.14em" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {cart.length > 0 && (
                <>
                  {/* 金额明细 */}
                  <dl className="mt-8 space-y-3 border-t border-ink/15 pt-6 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink/75">Subtotal · {cartCount(cart)} items</dt>
                      <dd>{formatPrice(subtotal)}</dd>
                    </div>
                    {discountApplied && (
                      <div className="flex justify-between text-ink">
                        <dt className="text-ink/75">Discount ({discountApplied})</dt>
                        <dd>−{formatPrice(discountAmount)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-ink/75">
                        Shipping <span className="text-ink/60">· {shipOption.label}</span>
                      </dt>
                      <dd>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink/75">Estimated Tax</dt>
                      <dd>{formatPrice(tax)}</dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex items-baseline justify-between border-t border-ink/15 pt-6">
                    <span className="eyebrow !mb-0">Total</span>
                    <span className="text-xl">{formatPrice(total)} <span className="text-xs text-ink/65">USD</span></span>
                  </div>

                  {/* Newsletter */}
                  <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs text-ink/75">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                    />
                    <span>Email me with news and offers, including new handmade drops and limited collaborations.</span>
                  </label>

                  {/* Terms */}
                  <label className="mt-3 flex cursor-pointer items-start gap-3 text-xs text-ink/75">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="#" className="underline transition-colors hover:text-ink">Terms of Service</Link>{" "}
                      and{" "}
                      <Link href="#" className="underline transition-colors hover:text-ink">Refund Policy</Link>.
                    </span>
                  </label>

                  <p className="mt-5 flex items-center gap-2 text-[11px] text-ink/65">
                    <Lock size={12} strokeWidth={1.8} />
                    All transactions are secure and encrypted.
                  </p>
                </>
              )}
            </div>

            {/* 支付方式提示 */}
            {gatewayLabel && (
              <p className="mt-4 hidden text-center text-[11px] uppercase text-ink/65 lg:block" style={{ letterSpacing: "0.16em" }}>
                Paying with {gatewayLabel}
              </p>
            )}
          </aside>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
