import Link from "next/link";
import Image from "next/image";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts } from "@/lib/content";

export const dynamic = "force-dynamic";

/** 列表页页头配图（手工 + 宠物主题） */
const HEADER_IMAGE = "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=1600";

export default async function ProductsPage() {
  const products = await getAllProducts();
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <>
      <SiteHeader />

      {/* 页头：左文右图（编辑式布局，不再只有文字） */}
      <section className="border-b border-ink/10">
        <div className="container-content grid items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20">
          {/* 左：文案 */}
          <div className="text-center md:text-left">
            <span className="eyebrow">The Collection</span>
            <h1 className="h-section mt-5">Handmade pieces, made to be kept.</h1>
            <p className="body-lg mt-6 max-w-xl md:mx-0 mx-auto">
              Small-batch essentials in natural materials — designed for the everyday, made personal
              to you.
            </p>
            <p className="mt-6 text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.18em" }}>
              {products.length} pieces · Made to order
            </p>
          </div>

          {/* 右：配图 */}
          <div className="relative aspect-[5/4] w-full overflow-hidden bg-sand md:aspect-[4/5]">
            <Image
              src={HEADER_IMAGE}
              alt="Handmade pet essentials in the workshop"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="img-zoom object-cover"
            />
          </div>
        </div>
      </section>

      {/* 筛选条 */}
      <div className="sticky top-16 z-30 border-b border-ink/10 bg-white/85 backdrop-blur md:top-20">
        <div className="container-content flex h-14 items-center gap-8 overflow-x-auto no-scrollbar">
          <span className="shrink-0 text-[11px] uppercase tracking-widest text-ink">All</span>
          {categories.map((c) => (
            <span key={c} className="shrink-0 text-[11px] uppercase tracking-widest text-ink/65 hover:text-ink">
              {c}
            </span>
          ))}
          <span className="ml-auto hidden shrink-0 text-[11px] uppercase tracking-widest text-ink/65 md:block">
            {products.length} Items
          </span>
        </div>
      </div>

      {/* 商品网格 */}
      <section className="container-content section-sm">
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 3} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

