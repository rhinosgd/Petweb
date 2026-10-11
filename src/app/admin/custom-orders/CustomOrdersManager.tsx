"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  Send,
  ArrowLeft,
  Mail
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { SpinnerButton } from "@/components/SpinnerButton";

type Timeline = { at: string; actor: string; event: string; note?: string };
type Attach = { name: string; size: number; type: string; url: string };
type Master = {
  id: string;
  orderNo: string;
  productTitle: string;
  material: string;
  color: string;
  dimensions: string;
  description: string;
  email: string;
  phone?: string | null;
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

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING_QUOTE", label: "Awaiting Quote" },
  { id: "QUOTED", label: "Awaiting Payment" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "DECLINED", label: "Declined" }
] as const;

const STATUS_STYLE: Record<Master["status"], string> = {
  PENDING_QUOTE: "border-amber-300 bg-amber-50 text-amber-700",
  QUOTED: "border-ink bg-ink text-white",
  ACCEPTED: "border-sage/50 bg-sage/10 text-sage",
  DECLINED: "border-ink/20 bg-sand text-ink/75"
};

const STATUS_LABEL: Record<Master["status"], string> = {
  PENDING_QUOTE: "Awaiting Quote",
  QUOTED: "Awaiting Payment",
  ACCEPTED: "Accepted",
  DECLINED: "Declined"
};

export function CustomOrdersManager() {
  const [list, setList] = useState<Master[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("ALL");
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Master | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/custom-requests");
      const data = await res.json();
      setList((data.requests ?? []) as Master[]);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function sendQuote() {
    if (!active) return;
    const value = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(value) || value <= 0) {
      setMsg("Please enter a valid amount.");
      return;
    }
    setSending(true);
    setMsg("");
    try {
      const res = await fetch(`/api/custom-requests/${active.id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send the quote");
      setActive(data.request as Master);
      setMsg(data.mailDemo ? "Quote sent · notification email queued (demo)" : "Quote sent and email delivered");
      setAmount("");
      setNote("");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  const filtered = filter === "ALL" ? list : list.filter((r) => r.status === filter);
  const counts = {
    ALL: list.length,
    PENDING_QUOTE: list.filter((r) => r.status === "PENDING_QUOTE").length,
    QUOTED: list.filter((r) => r.status === "QUOTED").length,
    ACCEPTED: list.filter((r) => r.status === "ACCEPTED").length,
    DECLINED: list.filter((r) => r.status === "DECLINED").length
  };

  /* ---------------- 详情视图 ---------------- */
  if (active) {
    return (
      <div>
        <button
          onClick={() => {
            setActive(null);
            setMsg("");
          }}
          className="mb-6 flex items-center gap-2 text-[11px] uppercase text-ink/70 transition-colors hover:text-ink"
          style={{ letterSpacing: "0.16em" }}
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          Back to all requests
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="eyebrow">Reference {active.orderNo}</div>
            <h1 className="mt-2 font-serif text-3xl">{active.productTitle}</h1>
            <p className="mt-1 text-xs text-ink/65">
              Submitted {new Date(active.createdAt).toLocaleString("en-US")}
            </p>
          </div>
          <span
            className={`border px-3 py-1.5 text-[11px] font-medium uppercase ${STATUS_STYLE[active.status]}`}
            style={{ letterSpacing: "0.14em" }}
          >
            {STATUS_LABEL[active.status]}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* 左：客户提交内容 */}
          <div className="space-y-6">
            <section className="card">
              <h2 className="eyebrow mb-5">Customer Requirements</h2>
              <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                <Field label="Material" value={active.material} />
                <Field label="Colour" value={active.color} />
                <Field label="Dimensions" value={active.dimensions} />
                <Field label="Email" value={active.email} />
                {active.phone && <Field label="Phone" value={active.phone} />}
                <div className="sm:col-span-2">
                  <dt className="eyebrow !mb-1">Description</dt>
                  <dd className="text-ink/85">{active.description}</dd>
                </div>
              </dl>
            </section>

            {active.attachments?.length > 0 && (
              <section className="card">
                <h2 className="eyebrow mb-5">Attachments</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {active.attachments.map((a, i) => {
                    const isImage = a.type.startsWith("image/");
                    return (
                      <li key={i} className="border border-ink/10">
                        {isImage ? (
                          <a href={a.url} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                              <Image src={a.url} alt={a.name} fill sizes="300px" className="object-cover" />
                            </div>
                          </a>
                        ) : (
                          <div className="flex h-[120px] items-center justify-center bg-sand">
                            <FileText size={26} strokeWidth={1.4} className="text-ink/60" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-2.5 text-xs">
                          <span className="min-w-0 flex-1 truncate">{a.name}</span>
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-ink/70 underline transition-colors hover:text-ink"
                          >
                            Open
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section className="card">
              <h2 className="eyebrow mb-5">Activity Timeline</h2>
              <ol className="space-y-4">
                {active.timeline.map((t, i) => (
                  <li key={i} className="flex gap-4 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-ink/80">{t.event}</span>
                      {t.note && <span className="mt-0.5 block text-xs text-ink/70">{t.note}</span>}
                      <span
                        className="mt-0.5 block text-[11px] uppercase text-ink/60"
                        style={{ letterSpacing: "0.12em" }}
                      >
                        {new Date(t.at).toLocaleString("en-US")} · {t.actor}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* 右：报价操作 */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
            <section className="card">
              <h2 className="eyebrow mb-5">Send a Quote</h2>

              {active.status === "PENDING_QUOTE" || active.status === "QUOTED" ? (
                <div className="space-y-5">
                  <div>
                    <label className="label" htmlFor="quote-amount">Quote Amount (USD)</label>
                    <input
                      id="quote-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="quote-note">Reply to Customer (optional)</label>
                    <textarea
                      id="quote-note"
                      rows={4}
                      className="input resize-y"
                      placeholder="Explain the price, lead time, or any questions you have."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  {msg && (
                    <div className="flex items-center gap-2 border border-sage/40 bg-sage/10 px-3 py-2 text-xs text-sage">
                      <Mail size={13} strokeWidth={1.8} />
                      {msg}
                    </div>
                  )}

                  <SpinnerButton loading={sending} onClick={sendQuote} className="btn-primary w-full">
                    {sending ? (
                      "Sending…"
                    ) : (
                      <>
                        <Send size={14} strokeWidth={1.8} className="mr-2" />
                        {active.status === "QUOTED" ? "Update Quote" : "Send Quote"}
                      </>
                    )}
                  </SpinnerButton>

                  <p className="text-[11px] leading-relaxed text-ink/65">
                    The customer receives an email and will see this request as{" "}
                    <strong className="font-medium text-ink/85">Awaiting Payment</strong> in their
                    account, where they can accept or decline.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="flex items-baseline justify-between border-b border-ink/10 pb-3">
                    <span className="text-ink/75">Quoted</span>
                    <span className="font-serif text-xl">{formatPrice(active.quotedAmount ?? 0)}</span>
                  </div>
                  {active.quotedNote && (
                    <p className="text-ink/78">
                      <span className="font-medium text-ink">Your note: </span>
                      {active.quotedNote}
                    </p>
                  )}
                  {active.status === "ACCEPTED" && active.linkedOrderNo && (
                    <p className="flex items-center gap-2 text-sage">
                      <CheckCircle2 size={15} strokeWidth={1.8} />
                      Accepted — order {active.linkedOrderNo} awaiting payment
                    </p>
                  )}
                  {active.status === "DECLINED" && (
                    <p className="flex items-start gap-2 text-ink/75">
                      <XCircle size={15} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                      <span>
                        Declined
                        {active.declineReason ? ` — “${active.declineReason}”` : ""}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    );
  }

  /* ---------------- 列表视图 ---------------- */
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Custom Requests</h1>
          <p className="mt-2 text-sm text-ink/70">
            Review custom enquiries, send quotes and track customer decisions.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 border border-ink/15 px-4 py-2.5 text-[11px] uppercase transition-colors hover:border-ink"
          style={{ letterSpacing: "0.14em" }}
        >
          <RefreshCw size={13} strokeWidth={1.8} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* 状态筛选 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`border px-4 py-2 text-[11px] uppercase transition-colors ${
              filter === f.id ? "border-ink bg-ink text-white" : "border-ink/15 text-ink/78 hover:border-ink"
            }`}
            style={{ letterSpacing: "0.12em" }}
          >
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center text-sm text-ink/65">Loading requests…</div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <Sparkles size={26} strokeWidth={1.4} className="text-ink/55" />
          <p className="text-sm text-ink/70">
            {list.length === 0
              ? "No custom requests yet. They'll appear here as soon as a customer submits one."
              : "No requests in this status."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setActive(r);
                setAmount(r.quotedAmount ? (r.quotedAmount / 100).toFixed(2) : "");
                setNote(r.quotedNote ?? "");
                setMsg("");
              }}
              className="card block w-full text-left transition-colors hover:border-ink/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-ink/70">{r.orderNo}</span>
                  <span
                    className={`border px-2.5 py-1 text-[10px] font-medium uppercase ${STATUS_STYLE[r.status]}`}
                    style={{ letterSpacing: "0.12em" }}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <span className="text-xs text-ink/65">
                  {new Date(r.createdAt).toLocaleDateString("en-US")}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <div className="font-medium">{r.productTitle}</div>
                <div className="text-ink/78">
                  <span className="text-ink/65">Customer: </span>
                  {r.email}
                </div>
                <div className="text-ink/78">
                  <span className="text-ink/65">Materials: </span>
                  {r.material}
                </div>
              </div>

              <p className="mt-3 line-clamp-2 border-t border-ink/5 pt-3 text-sm text-ink/75">
                {r.description}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink/65">
                {r.attachments?.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <FileText size={12} strokeWidth={1.8} />
                    {r.attachments.length} attachment{r.attachments.length > 1 ? "s" : ""}
                  </span>
                )}
                {r.quotedAmount ? (
                  <span className="font-medium text-ink/85">Quoted {formatPrice(r.quotedAmount)}</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <Clock size={12} strokeWidth={1.8} />
                    Awaiting your quote
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow !mb-1">{label}</dt>
      <dd className="text-ink/85">{value}</dd>
    </div>
  );
}
