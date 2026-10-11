"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ruler, Heart, Minus, Plus, Sparkles } from "lucide-react";
import { addToCart, CUSTOM_VALUE, CUSTOM_SWATCH, getPendingVariant, clearPendingVariant } from "@/lib/cart";
import { normalizeColors, type ProductColor } from "@/lib/product";
import { useCart } from "@/components/CartDrawer";
import { useToast } from "@/components/toast/ToastProvider";
import { Modal } from "@/components/Modal";

/**
 * 商品详情页购买区（对齐 maxbone 结构）：
 *   Color 色块选择器（末尾追加 Custom 白块）→ Size（末尾追加 Custom）→ 数量
 *   → 命中 Custom 时按钮变为 "Request Custom Quote" 并跳转定做表单
 */
export function AddToCart({
  product
}: {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    currency: string;
    image: string;
    customizable: boolean;
    inStock: boolean;
    colors?: unknown;
    sizes?: string[];
  };
}) {
  const router = useRouter();

  // 颜色 = 商品自带配色 + Custom（白色块，变量名 Custom）
  const baseColors = normalizeColors(product.colors);
  const colors: ProductColor[] = [...baseColors, CUSTOM_SWATCH];

  // 尺码 = 商品自带尺码 + Custom
  const sizes = [...(product.sizes ?? []), CUSTOM_VALUE];

  const [qty, setQty] = useState(1);
  const [customText, setCustomText] = useState("");
  const [color, setColor] = useState<ProductColor | null>(colors[0] ?? null);
  const [size, setSize] = useState<string>(sizes.length === 1 ? sizes[0] : "");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [wished, setWished] = useState(false);
  const { openCart } = useCart();
  const { toast } = useToast();

  /** 是否命中定做：Color 或 Size 选了 Custom */
  const isCustom = color?.name === CUSTOM_VALUE || size === CUSTOM_VALUE;

  function add() {
    if (isCustom) {
      // 进入定做询价流程（带上已选的颜色/尺码作为预填提示）
      router.push(`/custom/${product.slug}`);
      return;
    }

    // 若客户在「空车结算页」预先选过 Style / Size，这里自动补位
    const pending = getPendingVariant();
    const finalStyle = color?.name ?? pending.style ?? undefined;
    const finalSize = size || pending.size || undefined;

    addToCart({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image: product.image,
      quantity: qty,
      customText: customText || undefined,
      style: finalStyle,
      size: finalSize
    });
    if (pending.style || pending.size) clearPendingVariant();
    openCart();
    toast("Added to cart", "success");
  }

  function notify() {
    toast("We'll email you when it's back in stock", "success");
  }

  return (
    <div className="mt-8 space-y-6">
      {/* ===== Color ===== */}
      {colors.length > 0 && (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="label !mb-0">Color</span>
            <span className="flex items-center gap-1.5 text-xs text-ink/78">
              {color?.name === CUSTOM_VALUE && <Sparkles size={12} strokeWidth={1.8} />}
              {color?.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Color">
            {colors.map((c) => {
              const active = color?.name === c.name;
              const isCustomSwatch = c.name === CUSTOM_VALUE;
              return (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setColor(c)}
                  data-light={isLight(c.hex) ? "true" : undefined}
                  className={`swatch relative h-8 w-8 rounded-full transition-transform duration-200 ${
                    active ? "scale-105" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {/* Custom 白块：用斜纹边框区分「不是普通白色」 */}
                  {isCustomSwatch && (
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 5px)"
                      }}
                    />
                  )}
                  <span
                    className={`pointer-events-none absolute -inset-[3px] rounded-full border transition-opacity duration-200 ${
                      active ? "border-ink opacity-100" : "border-transparent opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {color?.name === CUSTOM_VALUE && (
            <p className="mt-2.5 text-[11px] text-ink/70">
              Custom colour — we&apos;ll make it to your exact shade. You&apos;ll tell us the details in the next step.
            </p>
          )}
        </div>
      )}

      {/* ===== Size + Size Guide ===== */}
      {sizes.length > 0 && (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="label !mb-0">Size</span>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="flex items-center gap-1.5 text-[11px] uppercase text-ink/70 transition-colors hover:text-ink"
              style={{ letterSpacing: "0.14em" }}
            >
              <Ruler size={13} strokeWidth={1.7} />
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {sizes.map((s) => {
              const active = size === s;
              const isCustomSize = s === CUSTOM_VALUE;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={isCustomSize ? "Custom" : s}
                  onClick={() => setSize(active && sizes.length > 1 ? "" : s)}
                  className={`min-w-[3.25rem] border px-4 py-2.5 text-xs uppercase transition-colors ${
                    active
                      ? "border-ink bg-ink text-white"
                      : "border-ink/20 text-ink/85 hover:border-ink hover:text-ink"
                  }`}
                  style={{ letterSpacing: "0.12em" }}
                >
                  {isCustomSize ? "Custom" : s}
                </button>
              );
            })}
          </div>
          {size === CUSTOM_VALUE && (
            <p className="mt-2.5 text-[11px] text-ink/70">
              Made to your measurements — share the sizing you need in the next step.
            </p>
          )}
        </div>
      )}

      {/* ===== Personalization ===== */}
      {product.customizable && !isCustom && (
        <div>
          <label className="label" htmlFor="personalization">
            Personalization (optional)
          </label>
          <input
            id="personalization"
            className="input"
            placeholder="e.g. your pet's name, colour preference"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
        </div>
      )}

      {/* ===== 数量 + 主按钮 + 收藏 ===== */}
      <div className="flex items-stretch gap-3">
        <div className="flex items-center border border-ink/20">
          <button
            aria-label="Decrease quantity"
            className="px-3.5 py-3 text-ink/78 transition-colors hover:bg-sand hover:text-ink"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus size={14} strokeWidth={1.8} />
          </button>
          <span className="w-9 text-center text-sm">{qty}</span>
          <button
            aria-label="Increase quantity"
            className="px-3.5 py-3 text-ink/78 transition-colors hover:bg-sand hover:text-ink"
            onClick={() => setQty((q) => q + 1)}
          >
            <Plus size={14} strokeWidth={1.8} />
          </button>
        </div>

        {isCustom ? (
          <button onClick={add} className="btn-primary flex-1 !py-3">
            Request Custom Quote
          </button>
        ) : product.inStock ? (
          <button onClick={add} className="btn-primary flex-1 !py-3">
            Add to Cart
          </button>
        ) : (
          <button onClick={notify} className="btn-outline flex-1 !py-3">
            Notify Me
          </button>
        )}

        <button
          type="button"
          aria-label="Add to wishlist"
          aria-pressed={wished}
          onClick={() => setWished((v) => !v)}
          className="flex w-12 shrink-0 items-center justify-center border border-ink/20 transition-colors hover:border-ink"
        >
          <Heart size={16} strokeWidth={1.6} className={wished ? "fill-ink text-ink" : "text-ink/78"} />
        </button>
      </div>

      {/* 已选规格回显 */}
      {(color || size) && (
        <p className="text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.14em" }}>
          Selected:{" "}
          {[color && `Color ${color.name}`, size && `Size ${size}`].filter(Boolean).join(" · ")}
        </p>
      )}

      {isCustom ? (
        <p className="flex items-start gap-2 text-[11px] text-ink/70">
          <Sparkles size={13} strokeWidth={1.7} className="mt-0.5 shrink-0" />
          You&apos;ve chosen a custom option. Tell us your material, colour, size and idea — we&apos;ll
          quote within 48 hours.
        </p>
      ) : (
        <p className="text-center text-[11px] uppercase tracking-widest text-ink/65">
          Free shipping over $75 · Made to order
        </p>
      )}

      {/* Size Guide 弹窗 */}
      <SizeGuide
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        sizes={product.sizes ?? []}
        hasColor={baseColors.length > 0}
      />
    </div>
  );
}

/** maxbone 式尺码对照表 */
function SizeGuide({
  open,
  onClose,
  sizes,
  hasColor
}: {
  open: boolean;
  onClose: () => void;
  sizes: string[];
  hasColor: boolean;
}) {
  const rows = sizes.length > 1 ? sizes : ["One Size"];
  const neck = ["8–10\"", "10–13\"", "13–17\"", "17–22\"", "22–27\""];
  const chest = ["10–13\"", "13–17\"", "17–22\"", "22–27\"", "27–32\""];

  return (
    <Modal open={open} onClose={onClose} title="Size Guide">
      <p className="mb-6 text-sm text-ink/78">
        Measure around the widest part of your pet&apos;s neck and chest. If your pet is between
        sizes, we recommend sizing up for comfort.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.14em" }}>
              <th className="py-3 pr-4 font-medium">Size</th>
              <th className="py-3 pr-4 font-medium">Neck</th>
              <th className="py-3 pr-4 font-medium">Chest</th>
              <th className="py-3 font-medium">Recommended Weight</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s} className="border-b border-ink/8">
                <td className="py-3 pr-4 font-medium">{s}</td>
                <td className="py-3 pr-4 text-ink/80">{neck[i] ?? neck[neck.length - 1]}</td>
                <td className="py-3 pr-4 text-ink/80">{chest[i] ?? chest[chest.length - 1]}</td>
                <td className="py-3 text-ink/80">
                  {hasColor ? ["Up to 10 lb", "10–25 lb", "25–50 lb", "50–75 lb", "75–100 lb"][i] ?? "Over 100 lb" : "All sizes"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-5 text-[11px] text-ink/65">
        All measurements are approximate. Personalised and made-to-order pieces are final sale.
      </p>
    </Modal>
  );
}

/** 浅色判定（同 ProductCard），给浅色块加深描边 */
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  if (full.length !== 6) return false;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.72;
}
