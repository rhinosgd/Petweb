"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ArrowRight,
  AlertCircle,
  Loader2
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SpinnerButton } from "@/components/SpinnerButton";
import { formatPrice } from "@/lib/utils";

type Timeline = { at: string; actor: string; event: string; note?: string };
type Attach = { name: string; size: number; type: string; url: string };
type CustomRecord = {
  id: string;
  orderNo: string;
  productTitle: string;
  material: string;
  color: string;
  dimensions: string;
  description: string;
  email: string;
  attachments: Attach[];
  quotedAmount?: number | null;
  quotedNote?: string | null;
  quotedAt?: string | null;
  status: "PENDING_QUOTE" | "QUOTED" | "ACCEPTED" | "DECLINED";
  declineReason?: string | null;
  linkedOrderNo?: string | null;
  timeline: Timeline[];
  createdAt: string;
};

const STATUS_META: Record<
  CustomRecord["status"],
  { label: string; tone: string; icon: typeof Clock; hint: string }
> = {
  PENDING_QUOTE: {
    label: "Awaiting Quote",
    tone: "border-amber-300 bg-amber-50 text-amber-700",
    icon: Clock,
    hint: "Our makers are reviewing your requirements. You'll hear from us within 48 hours."
  },
  QUOTED: {
    label: "Awaiting Payment",
    tone: "border-ink bg-ink text-white",
    icon: AlertCircle,
    hint: "Your quote is ready. Accept it to place the order, or decline with a reason."
  },
  ACCEPTED: {
    label: "Accepted — Awaiting Payment",
    tone: "border-sage bg-sage/10 text-sage",
    icon: CheckCircle2,
    hint: "Thanks! Your order has been created and is awaiting payment."
  },
  DECLINED: {
    label: "Declined",
    tone: "border-ink/20 bg-sand text-ink/78",
    icon: XCircle,
    hint: "You declined this quote. You're welcome to submit a new request any time."
  }
};

export function CustomOrdersLookup() {
  const [email, setEmail] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<CustomRecord | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [acting, setActing] = useState(false);
  const [notice, setNotice] = useState("");

  async function lookup() {
    if (!email.trim() || !orderNo.trim()) {
      setError("Please enter both your email and your reference number.");
      return;
    }
    setLoading(true);
    setError("");
    setRecord(null);
    setNotice("");
    try {
      const res = await fetch(
        `/api/custom-requests?email=${encodeURIComponent(email.trim())}&orderNo=${encodeURIComponent(orderNo.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setRecord(data.request as CustomRecord);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function respond(action: "accept" | "decline") {
    if (!record) return;
    if (action === "decline" && !declineReason.trim()) {
      setError("Please tell us why you're declining so we can improve your next quote.");
      return;
    }
    setActing(true);
    setError("");
    try {
      const res = await fetch(`/api/custom-requests/${record.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: declineReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not record your response");
      setRecord(data.request as CustomRecord);
      setDeclineOpen(false);
      setNotice(
        action === "accept"
          ? `Quote accepted. Order ${data.linkedOrderNo} is now awaiting payment.`
          : "Thank you — we've recorded your decision and will follow up by email."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setActing(false);
    }
  }

  const meta = record ? STATUS_META[record.status] : null;

  return (
    <>
      <SiteHeader />

      <section className="border-b border-ink/10">
        <div className="container-content py-16 text-center md:py-20">
          <span className="eyebrow">My Account</span>
          <h1 className="h-section mx-auto mt-5 max-w-3xl">My Custom Orders</h1>
          <p className="body-lg mx-auto mt-5 max-w-xl">
            Enter the email you used and the reference number we sent you to review your quote and
            accept or decline it.
          </p>
        </div>
      </section>

      <section className="container-content py-12 md:py-16">
        {/* 查询表单 */}
        <div className="mx-auto max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="lookup-email">Email</label>
              <input
                id="lookup-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
              />
            </div>
            <div>
              <label className="label" htmlFor="lookup-no">Reference Number</label>
              <input
                id="lookup-no"
                className="input"
                placeholder="CR2026101119301234"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
              />
            </div>
          </div>
          <SpinnerButton loading={loading} onClick={lookup} className="btn-primary mt-6 w-full">
            {loading ? "Searching…" : "Find My Request"}
          </SpinnerButton>

          {error && (
            <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          {notice && (
            <div className="mt-5 flex items-center gap-2 border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-sage">
              <CheckCircle2 size={15} strokeWidth={1.8} />
              {notice}
            </div>
          )}
        </div>

        {/* 结果 */}
        {record && meta && (
          <div className="mx-auto mt-12 max-w-3xl border border-ink/10">
            {/* 头部状态 */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 bg-sand/40 px-6 py-5">
              <div>
                <div className="eyebrow">Reference {record.orderNo}</div>
                <h2 className="mt-2 font-serif text-2xl">{record.productTitle}</h2>
                <p className="mt-1 text-xs text-ink/65">
                  Submitted {new Date(record.createdAt).toLocaleString("en-US")}
                </p>
              </div>
              <span
                className={`flex items-center gap-2 border px-3 py-1.5 text-[11px] font-medium uppercase ${meta.tone}`}
                style={{ letterSpacing: "0.14em" }}
              >
                <meta.icon size={13} strokeWidth={1.9} />
                {meta.label}
              </span>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm text-ink/78">{meta.hint}</p>

              {/* 定做信息 */}
              <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-ink/10 pt-6 text-sm sm:grid-cols-2">
                <Row label="Material" value={record.material} />
                <Row label="Colour" value={record.color} />
                <Row label="Dimensions" value={record.dimensions} />
                <Row label="Contact" value={record.email} />
                <div className="sm:col-span-2">
                  <dt className="eyebrow !mb-1">Description</dt>
                  <dd className="text-ink/85">{record.description}</dd>
                </div>
              </dl>

              {/* 附件 */}
              {record.attachments?.length > 0 && (
                <div className="mt-6 border-t border-ink/10 pt-6">
                  <div className="eyebrow mb-3">Attachments</div>
                  <ul className="flex flex-wrap gap-3">
                    {record.attachments.map((a, i) => (
                      <li key={i}>
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 border border-ink/15 px-3 py-2 text-xs transition-colors hover:border-ink"
                        >
                          <FileText size={13} strokeWidth={1.7} className="text-ink/65" />
                          <span className="max-w-[14rem] truncate">{a.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 报价卡片 */}
              {record.status === "QUOTED" && (
                <div className="mt-6 border border-ink bg-ink/[0.02] p-6">
                  <div className="flex items-baseline justify-between">
                    <span className="eyebrow !mb-0">Your Quote</span>
                    <span className="font-serif text-3xl">
                      {formatPrice(record.quotedAmount ?? 0)}
                    </span>
                  </div>
                  {record.quotedNote && (
                    <p className="mt-4 border-t border-ink/10 pt-4 text-sm text-ink/80">
                      <span className="font-medium text-ink">Note from our makers: </span>
                      {record.quotedNote}
                    </p>
                  )}

                  {!declineOpen ? (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => respond("accept")}
                        disabled={acting}
                        className="btn-primary flex-1 disabled:opacity-60"
                      >
                        {acting ? "Processing…" : "Accept & Pay"}
                      </button>
                      <button
                        onClick={() => setDeclineOpen(true)}
                        disabled={acting}
                        className="btn-outline flex-1 disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 border-t border-ink/10 pt-5">
                      <label className="label" htmlFor="decline-reason">
                        Why are you declining? (optional, but helpful)
                      </label>
                      <textarea
                        id="decline-reason"
                        rows={3}
                        className="input resize-y"
                        placeholder="e.g. the price is above my budget, or I'd like a different material."
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                      />
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => respond("decline")}
                          disabled={acting}
                          className="btn-outline flex-1 disabled:opacity-60"
                        >
                          {acting ? "Sending…" : "Confirm Decline"}
                        </button>
                        <button
                          onClick={() => {
                            setDeclineOpen(false);
                            setDeclineReason("");
                          }}
                          className="btn-link"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 已接受：待付款 */}
              {record.status === "ACCEPTED" && (
                <div className="mt-6 border border-sage/40 bg-sage/5 p-6">
                  <div className="flex items-center gap-2 text-sage">
                    <CheckCircle2 size={17} strokeWidth={1.8} />
                    <span className="text-[11px] font-medium uppercase" style={{ letterSpacing: "0.14em" }}>
                      Awaiting Payment
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-sm text-ink/75">Order {record.linkedOrderNo}</span>
                    <span className="font-serif text-2xl">{formatPrice(record.quotedAmount ?? 0)}</span>
                  </div>
                  <Link href={`/checkout?custom=${record.linkedOrderNo}`} className="btn-primary mt-5 w-full">
                    Complete Payment
                  </Link>
                </div>
              )}

              {/* 已拒绝 */}
              {record.status === "DECLINED" && record.declineReason && (
                <div className="mt-6 border border-ink/15 bg-sand/50 p-5 text-sm">
                  <span className="eyebrow">Your reason</span>
                  <p className="mt-2 text-ink/80">{record.declineReason}</p>
                </div>
              )}

              {/* 时间线 */}
              <div className="mt-8 border-t border-ink/10 pt-6">
                <div className="eyebrow mb-4">Activity</div>
                <ol className="space-y-4">
                  {record.timeline.map((t, i) => (
                    <li key={i} className="flex gap-4 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-ink/75">{t.event}</span>
                        {t.note && <span className="mt-0.5 block text-xs text-ink/65">{t.note}</span>}
                        <span className="mt-0.5 block text-[11px] uppercase text-ink/60" style={{ letterSpacing: "0.12em" }}>
                          {new Date(t.at).toLocaleString("en-US")} · {t.actor}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* 空态引导 */}
        {!record && !loading && !error && (
          <div className="mx-auto mt-12 max-w-2xl text-center">
            <p className="text-sm text-ink/70">
              Don&apos;t have a custom request yet?{" "}
              <Link href="/products" className="text-ink underline transition-opacity hover:opacity-70">
                Browse the collection
              </Link>{" "}
              and choose a <strong className="font-medium">Custom</strong> colour or size to get started.
            </p>
          </div>
        )}
      </section>

      <SiteFooter />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow !mb-1">{label}</dt>
      <dd className="text-ink/85">{value}</dd>
    </div>
  );
}
