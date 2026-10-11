"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Upload, X, FileText, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SpinnerButton } from "@/components/SpinnerButton";
import { FieldError } from "@/components/FieldError";

type Attach = { name: string; size: number; type: string; url: string };

/**
 * 定做询价表单页 /custom/[slug]
 * 客户选了 Color=Custom 或 Size=Custom 后进入，填写定做要求并上传参考附件。
 */
export function CustomRequestForm({
  product
}: {
  product: { id: string; slug: string; title: string; image: string; category: string };
}) {
  const [form, setForm] = useState({
    material: "",
    color: "",
    dimensions: "",
    description: "",
    email: "",
    phone: ""
  });
  const [files, setFiles] = useState<Attach[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [done, setDone] = useState<{ orderNo: string; mailDemo: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPickFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(list).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFiles((prev) => [...prev, ...(data.files as Attach[])]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function submit() {
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setEmailError("Please enter a valid email address, e.g. you@example.com");
      return;
    }
    setEmailError("");

    const missing: string[] = [];
    if (!form.material.trim()) missing.push("Material");
    if (!form.color.trim()) missing.push("Colour");
    if (!form.dimensions.trim()) missing.push("Dimensions");
    if (!form.description.trim()) missing.push("Description");
    if (missing.length) {
      setError(`Please complete: ${missing.join(", ")}.`);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productSlug: product.slug,
          productTitle: product.title,
          material: form.material,
          color: form.color,
          dimensions: form.dimensions,
          description: form.description,
          email: form.email,
          phone: form.phone,
          attachments: files
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your request");
      setDone({ orderNo: data.orderNo, mailDemo: Boolean(data.mailDemo) });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------- 提交成功 ---------------- */
  if (done) {
    return (
      <>
        <SiteHeader />
        <section className="container-content py-16 md:py-24">
          <div className="mx-auto max-w-2xl border border-ink/10 bg-sand/40 p-8 text-center md:p-12">
            <CheckCircle2 size={40} strokeWidth={1.3} className="mx-auto text-sage" />
            <h1 className="h-section mt-6">Request received.</h1>
            <p className="body-lg mt-4">
              Thank you — our makers will review your custom requirements for{" "}
              <strong className="font-medium text-ink">{product.title}</strong> and reply with a quote
              within 48 hours.
            </p>

            <div className="mt-8 border border-ink/15 bg-white px-6 py-5">
              <div className="eyebrow">Your reference number</div>
              <div className="mt-2 font-serif text-2xl tracking-wide">{done.orderNo}</div>
              <p className="mt-2 text-xs text-ink/65">
                Keep this safe — you&apos;ll need it together with your email to review and accept your
                quote.
              </p>
            </div>

            {done.mailDemo && (
              <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink/70">
                <CheckCircle2 size={13} strokeWidth={1.8} className="text-sage" />
                A confirmation email has been sent to {form.email}
              </p>
            )}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/account/custom-orders" className="btn-primary">
                View My Custom Orders
              </Link>
              <Link href="/products" className="btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
        <SiteFooter />
      </>
    );
  }

  /* ---------------- 表单 ---------------- */
  return (
    <>
      <SiteHeader />

      {/* 面包屑 */}
      <div className="border-b border-ink/10">
        <div className="container-content flex h-12 items-center gap-3 text-[11px] uppercase tracking-widest text-ink/65">
          <Link href="/products" className="hover:text-ink">Shop</Link>
          <span>/</span>
          <Link href={`/products/${product.slug}`} className="hover:text-ink">
            {product.title}
          </Link>
          <span>/</span>
          <span className="text-ink/85">Custom Request</span>
        </div>
      </div>

      <section className="container-content py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          {/* 表单主体 */}
          <div>
            <span className="eyebrow">Made to Order</span>
            <h1 className="h-section mt-4">Tell us what you have in mind.</h1>
            <p className="body-lg mt-5 max-w-2xl">
              Every custom piece begins with your idea. Share the material, colour, size and any
              details that matter — upload a sketch, a photo or a document if it helps. We&apos;ll
              review it and come back with a quote.
            </p>

            <div className="mt-10 space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="material">Material *</label>
                  <input
                    id="material"
                    className="input"
                    placeholder="e.g. full-grain leather, organic cotton"
                    value={form.material}
                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="color">Colour *</label>
                  <input
                    id="color"
                    className="input"
                    placeholder="e.g. warm sand, deep forest green"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="dimensions">Basic Dimensions *</label>
                <input
                  id="dimensions"
                  className="input"
                  placeholder="e.g. neck 34 cm / width 2.5 cm, or 40 × 30 × 12 cm"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                />
              </div>

              <div>
                <label className="label" htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  rows={5}
                  className="input resize-y"
                  placeholder="Describe your idea — style, hardware, personalisation, anything we should know."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FieldError error={emailError}>
                  <label className="label" htmlFor="email">Contact Email *</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </FieldError>
                <div>
                  <label className="label" htmlFor="phone">Phone (optional)</label>
                  <input
                    id="phone"
                    type="tel"
                    className="input"
                    placeholder="+1 555 000 0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* 附件上传 */}
              <div>
                <label className="label">Reference Files (optional)</label>
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    onPickFiles(e.dataTransfer.files);
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-ink/25 py-10 text-center transition-colors hover:border-ink hover:bg-sand/40"
                >
                  {uploading ? (
                    <Loader2 size={22} strokeWidth={1.6} className="animate-spin text-ink/70" />
                  ) : (
                    <Upload size={22} strokeWidth={1.5} className="text-ink/65" />
                  )}
                  <span className="text-sm text-ink/78">
                    {uploading ? "Uploading…" : "Click to upload or drag files here"}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-ink/65">
                    Image · PDF · Word · up to 10 MB each
                  </span>
                  <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => onPickFiles(e.target.files)}
                  />
                </div>

                {files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {files.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 border border-ink/10 bg-white px-4 py-3 text-sm"
                      >
                        <FileText size={15} strokeWidth={1.6} className="shrink-0 text-ink/65" />
                        <span className="min-w-0 flex-1 truncate">{f.name}</span>
                        <span className="shrink-0 text-xs text-ink/65">
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${f.name}`}
                          onClick={() => setFiles(files.filter((_, j) => j !== i))}
                          className="shrink-0 text-ink/65 transition-colors hover:text-ink"
                        >
                          <X size={14} strokeWidth={2} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {error && (
                <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              {/* 灰色备注 */}
              <p className="border-l-2 border-ink/15 pl-4 text-xs leading-relaxed text-ink/65">
                We will quote according to your custom requirements. Please keep an eye on your email
                or the order updates in your account — you will hear from us within 48 hours at the
                latest.
              </p>

              <SpinnerButton loading={submitting} onClick={submit} className="btn-primary w-full sm:w-auto">
                {submitting ? "Sending…" : "Submit Custom Request"}
              </SpinnerButton>
            </div>
          </div>

          {/* 侧边：商品信息 */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="border border-ink/10 bg-sand/40 p-6">
              <div className="relative aspect-[4/5] overflow-hidden bg-white">
                {product.image && (
                  <Image src={product.image} alt={product.title} fill sizes="360px" className="object-cover" />
                )}
              </div>
              <div className="mt-5">
                <span className="eyebrow">{product.category}</span>
                <h2 className="mt-2 font-serif text-xl leading-snug">{product.title}</h2>
                <p className="mt-3 text-sm text-ink/75">
                  This piece is made to order. Your quote will reflect the materials, dimensions and
                  detailing you specify.
                </p>
              </div>
              <Link
                href={`/products/${product.slug}`}
                className="mt-5 flex items-center gap-2 text-[11px] uppercase text-ink/70 transition-colors hover:text-ink"
                style={{ letterSpacing: "0.16em" }}
              >
                <ArrowLeft size={13} strokeWidth={1.8} />
                Back to product
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
