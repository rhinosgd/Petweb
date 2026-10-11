"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ImageSwapCard } from "./ImageSwapCard";
import { formatPrice } from "@/lib/utils";
import { normalizeColors, type CardProduct } from "@/lib/product";

/**
 * 判断色值是否为浅色（用于给浅色块加深描边，保证可辨识）。
 * 采用 sRGB 相对亮度近似公式，阈值 0.72。
 */
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  if (full.length !== 6) return false;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.72;
}

/**
 * 商品卡：
 * - 悬停/键盘聚焦时整卡抬升、封面半透明遮罩
 * - 底部展示可选配色圆点（互斥单选，点击切换当前色）+ More Info 按钮
 * - 触屏无 hover，信息始终可见
 */
export function ProductCard({
  product,
  priority = false,
  badge,
  aspect = "aspect-[4/5]",
  showCategory = true
}: {
  product: CardProduct;
  priority?: boolean;
  badge?: string;
  aspect?: string;
  showCategory?: boolean;
}) {
  const label =
    badge ?? (product.featured ? "Best Seller" : product.customizable ? "Personalized" : undefined);

  const colors = normalizeColors(product.colors);
  const [activeColor, setActiveColor] = useState(0);

  return (
    <div className="card-lift group">
      {/* 图片区：点击进入详情 */}
      <Link href={`/products/${product.slug}`} aria-label={product.title} className="block">
        <ImageSwapCard
          images={product.images}
          alt={product.title}
          className={`w-full ${aspect}`}
          imageClassName="img-zoom"
          priority={priority}
          protruding
          overlay
        >
          {label && (
            <span className="absolute left-4 top-4 z-10 bg-white px-3 py-1.5 text-[10px] uppercase tracking-widest">
              {label}
            </span>
          )}
        </ImageSwapCard>
      </Link>

      <div className="mt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="h-card">
              <Link href={`/products/${product.slug}`} className="transition-opacity hover:opacity-70">
                {product.title}
              </Link>
            </h3>
            {showCategory && (
              <span className="mt-1 block text-sm capitalize text-ink/70">{product.category}</span>
            )}
          </div>
          <span className="shrink-0 text-sm">{formatPrice(product.price, product.currency)}</span>
        </div>

        {/* 配色色块：互斥单选 */}
        {colors.length > 0 && (
          <div className="mt-4 flex items-center gap-2.5" role="radiogroup" aria-label={`${product.title} colours`}>
            {colors.map((c, i) => {
              const active = i === activeColor;
              return (
                <button
                  key={`${c.name}-${i}`}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={c.name}
                  title={c.name}
                  data-light={isLight(c.hex) ? "true" : undefined}
                  onClick={() => setActiveColor(i)}
                  className={`swatch relative h-5 w-5 rounded-full transition-transform duration-200 ${
                    active ? "scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {/* 选中态：外圈描边，保证浅色也能看清 */}
                  <span
                    className={`pointer-events-none absolute -inset-[3px] rounded-full border transition-opacity duration-200 ${
                      active ? "border-ink/70 opacity-100" : "border-transparent opacity-0"
                    }`}
                  />
                </button>
              );
            })}
            <span className="ml-1 text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.12em" }}>
              {colors[activeColor]?.name}
            </span>
          </div>
        )}

        {/* More Info 按钮 */}
        <Link
          href={`/products/${product.slug}`}
          className="more-info mt-4 inline-flex w-full items-center justify-center gap-2 border border-ink/20 px-5 py-3 text-[11px] font-medium uppercase text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white"
          style={{ letterSpacing: "0.18em" }}
        >
          More Info
          <ArrowUpRight size={14} strokeWidth={1.6} />
        </Link>
      </div>
    </div>
  );
}
