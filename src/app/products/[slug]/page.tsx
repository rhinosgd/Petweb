import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, RotateCcw, ShieldCheck, Ruler } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { formatPrice } from "@/lib/utils";
import { AddToCart } from "@/components/AddToCart";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { SpecAccordion } from "@/components/SpecAccordion";
import { Reviews } from "@/components/Reviews";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getProductBySlug, getAllProducts } from "@/lib/content";
import { DEFAULT_REVIEWS, PRODUCT_FAQ } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

/** 从 Prisma/demo 数据里安全取多值字段 */
function asArray(v: unknown): string[] {
  return Array.isArray(v) ? (v.filter((x) => typeof x === "string") as string[]) : [];
}

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product || !product.active) notFound();

  const all = await getAllProducts();
  const related = all.filter((p) => p.id !== product.id).slice(0, 3);
  const alsoLike = all.filter((p) => p.id !== product.id).slice(3, 7);

  const features = asArray((product as { features?: unknown }).features);
  const sizes = asArray((product as { sizes?: unknown }).sizes);
  const whyMade = (product as { whyMade?: string | null }).whyMade;
  const care = (product as { care?: string | null }).care;
  const reviews = DEFAULT_REVIEWS;
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const inStock = product.stock > 0;

  return (
    <>
      <SiteHeader />

      {/* 面包屑 */}
      <div className="border-b border-ink/10">
        <div className="container-content flex h-12 items-center gap-3 text-[11px] uppercase tracking-widest text-ink/65">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-ink">
            Shop
          </Link>
          <span>/</span>
          <span className="text-ink/85 capitalize">{product.category}</span>
        </div>
      </div>

      {/* ===== 主区：图库 + 购买信息 ===== */}
      <section className="container-content py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <ProductGallery images={product.images} title={product.title} />

          <div className="md:pt-2">
            {product.featured && <span className="eyebrow">Best Seller</span>}
            <h1 className="display mt-3 text-4xl md:text-5xl">{product.title}</h1>

            {/* 价格 + 评分摘要 */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-lg">{formatPrice(product.price, product.currency)}</span>
              <a href="#reviews" className="flex items-center gap-2 text-xs text-ink/70 transition-colors hover:text-ink">
                <span className="flex items-center gap-0.5 text-ink">
                  {"★★★★★".split("").map((_, i) => (
                    <span key={i} className={i < Math.round(avgRating) ? "text-ink" : "text-ink/50"}>
                      ★
                    </span>
                  ))}
                </span>
                <span>
                  {avgRating.toFixed(1)} · {reviews.length} reviews
                </span>
              </a>
            </div>

            {/* 库存状态 */}
            <p className="mt-3 flex items-center gap-2 text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-sage" : "bg-clay"}`} />
              <span className="text-ink/75">
                {inStock ? `In Stock · ${product.stock} available` : "Sold Out — notify me when it returns"}
              </span>
            </p>

            <p className="body-lg mt-6">{product.description}</p>

            {/* 购买区：Color / Size / 数量 / 加购 */}
            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                currency: product.currency,
                image: product.images[0] ?? "",
                customizable: product.customizable,
                inStock,
                colors: (product as { colors?: unknown }).colors,
                sizes
              }}
            />

            {/* ===== 服务承诺（maxbone 式小图标行）===== */}
            <ul className="mt-8 grid grid-cols-1 gap-3 border-t border-ink/10 pt-6 sm:grid-cols-3">
              {[
                { icon: Truck, text: "Free shipping over $75" },
                { icon: RotateCcw, text: "14-day returns" },
                { icon: ShieldCheck, text: "1-year warranty" }
              ].map((s) => (
                <li key={s.text} className="flex items-center gap-2.5 text-xs text-ink/75">
                  <s.icon size={15} strokeWidth={1.6} className="shrink-0" />
                  {s.text}
                </li>
              ))}
            </ul>

            {/* ===== 详情折叠区：Features / Description / Why We Made This / Care ===== */}
            <div className="mt-10">
              <SpecAccordion
                items={[
                  ...(features.length > 0
                    ? [
                        {
                          title: "Features",
                          defaultOpen: true,
                          content: (
                            <ul className="space-y-2.5">
                              {features.map((f) => (
                                <li key={f} className="flex gap-3">
                                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/40" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          )
                        }
                      ]
                    : []),
                  {
                    title: "Description",
                    content: <p className="whitespace-pre-line">{product.description}</p>
                  },
                  ...(whyMade
                    ? [{ title: "Why We Made This", content: <p>{whyMade}</p> }]
                    : []),
                  ...(care ? [{ title: "Care Instructions", content: <p>{care}</p> }] : []),
                  {
                    title: "Shipping & Returns",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Made-to-order pieces ship within 2–5 business days. Standard US delivery
                          takes 3–7 business days; expedited 1–3 business days.
                        </p>
                        <p>
                          International shipping is available to 60+ countries (7–10 business days).
                          Import duties are the responsibility of the recipient.
                        </p>
                        <p>
                          Returns accepted within 14 days of delivery on unworn, undamaged items with
                          original tags. Personalised pieces are final sale.
                        </p>
                      </div>
                    )
                  }
                ]}
              />
            </div>

            {/* 尺码提示 */}
            {sizes.length > 0 && (
              <p className="mt-6 flex items-start gap-2.5 text-xs text-ink/70">
                <Ruler size={14} strokeWidth={1.6} className="mt-0.5 shrink-0" />
                Unsure on sizing? Open the Size Guide next to the Size selector for neck, chest and
                weight guidance.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== 评价区 ===== */}
      <div id="reviews">
        <Reviews reviews={reviews} />
      </div>

      {/* ===== 相关推荐（两组，maxbone 式）===== */}
      <section className="section-sm border-t border-ink/10">
        <div className="container-content">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="eyebrow">You May Also Like</span>
              <h2 className="h-section mt-4">Complete the set.</h2>
            </div>
            <Link href="/products" className="btn-link shrink-0">
              View All
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} showCategory={false} />
            ))}
          </div>
        </div>
      </section>

      {alsoLike.length > 0 && (
        <section className="section-sm border-t border-ink/10 bg-sand/40">
          <div className="container-content">
            <div className="mb-12">
              <span className="eyebrow">Bestsellers</span>
              <h2 className="h-section mt-4">Loved by the pack.</h2>
            </div>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {alsoLike.map((p) => (
                <ProductCard key={p.id} product={p} showCategory={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 商品 FAQ ===== */}
      <section className="section-sm border-t border-ink/10">
        <div className="container-content">
          <div className="mb-12 text-center">
            <span className="eyebrow">Good to Know</span>
            <h2 className="h-section mt-4">Questions, answered.</h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <FaqAccordion items={PRODUCT_FAQ} />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
