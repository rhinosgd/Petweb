"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Drawer } from "./Drawer";
import { getCart, setCart, cartTotal, cartCount, variantKey, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

interface CartApi {
  items: CartItem[];
  count: number;
  openCart: () => void;
  closeCart: () => void;
  refresh: () => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
}

const CartContext = createContext<CartApi | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** 全局购物车状态 + 右侧抽屉。复用 localStorage 数据层，仍派发 cart-updated 兼容结算页。 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(() => setItems(getCart()), []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("cart-updated", onUpdate);
    return () => window.removeEventListener("cart-updated", onUpdate);
  }, [refresh]);

  const count = cartCount(items);

  function removeItem(key: string) {
    setCart(items.filter((i) => variantKey(i) !== key));
  }
  function updateQty(key: string, qty: number) {
    setCart(items.map((i) => (variantKey(i) === key ? { ...i, quantity: Math.max(1, qty) } : i)));
  }

  return (
    <CartContext.Provider
      value={{ items, count, openCart: () => setOpen(true), closeCart: () => setOpen(false), refresh, removeItem, updateQty }}
    >
      {children}
      <CartDrawer open={open} onClose={() => setOpen(false)} items={items} onRemove={removeItem} onQty={updateQty} />
    </CartContext.Provider>
  );
}

function CartDrawer({
  open,
  onClose,
  items,
  onRemove,
  onQty
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (key: string) => void;
  onQty: (key: string, qty: number) => void;
}) {
  const router = useRouter();
  const total = cartTotal(items);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Your Cart (${cartCount(items)})`}
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow !mb-0">Total</span>
              <span className="text-lg">{formatPrice(total)}</span>
            </div>
            <button
              className="btn-primary w-full"
              onClick={() => {
                onClose();
                router.push("/checkout");
              }}
            >
              Checkout
            </button>
            <button className="btn-outline w-full" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink/70">Your cart is empty.</p>
      ) : (
        <ul className="space-y-6">
          {items.map((it) => {
            const key = variantKey(it);
            const specs = [
              it.style ? `Style: ${it.style}` : null,
              it.size ? `Size: ${it.size}` : null
            ].filter(Boolean) as string[];
            return (
            <li key={key} className="flex gap-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-sand">
                {it.image && <Image src={it.image} alt={it.title} fill sizes="80px" className="object-cover" />}
              </div>
              <div className="flex-1">
                <div className="text-sm">{it.title}</div>
                {specs.length > 0 && (
                  <div className="mt-0.5 text-xs text-ink/70">{specs.join(" · ")}</div>
                )}
                {it.customText && <div className="mt-0.5 text-xs text-ink/65">“{it.customText}”</div>}
                <div className="mt-0.5 text-sm text-ink/78">{formatPrice(it.price, it.currency)}</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-ink/20">
                    <button
                      className="px-3 py-1 text-sm transition-colors hover:bg-sand"
                      aria-label="Decrease quantity"
                      onClick={() => onQty(key, it.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{it.quantity}</span>
                    <button
                      className="px-3 py-1 text-sm transition-colors hover:bg-sand"
                      aria-label="Increase quantity"
                      onClick={() => onQty(key, it.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-[11px] uppercase tracking-widest text-ink/65 transition-colors hover:text-ink"
                    onClick={() => onRemove(key)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
