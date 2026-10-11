"use client";

// 极简购物车（localStorage），生产可换成 Context/Zustand
export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
  /** 定制文字（刻字/图案说明） */
  customText?: string;
  /** 款式变量（可选，在结算页选择） */
  style?: string;
  /** 尺码变量（可选，在结算页选择） */
  size?: string;
}

const KEY = "paw-craft-cart";

/** 结算页可选的 Style / Size 取值（真实选项后续可在后台配置） */
export const STYLE_OPTIONS = ["Classic", "Modern", "Vintage", "Custom"] as const;
export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"] as const;

/** 定做触发值：Color 或 Size 选中它时，进入定做询价流程 */
export const CUSTOM_VALUE = "Custom";

/** 定做颜色的展示色块：显示为白色，变量名仍为 Custom */
export const CUSTOM_SWATCH = { name: CUSTOM_VALUE, hex: "#ffffff" };

/**
 * 变体唯一键：同一商品的不同「款式 + 尺码 + 定制文字」视为不同行，
 * 避免用户选了不同规格却被合并成一条、丢失所选规格。
 */
export function variantKey(i: Pick<CartItem, "id" | "style" | "size" | "customText">): string {
  return [i.id, i.style ?? "", i.size ?? "", i.customText ?? ""].join("::");
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw;
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

/**
 * 结算页「空车状态」下预先选择的 Style / Size。
 * 空车时没有具体商品可挂载，先把选择存成偏好；
 * 客户之后从商品页加购时，自动套用到新加入的行上。
 */
const PENDING_KEY = "paw-craft-pending-variant";

export interface PendingVariant {
  style?: string;
  size?: string;
}

export function getPendingVariant(): PendingVariant {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(PENDING_KEY) || "{}");
    if (!raw || typeof raw !== "object") return {};
    return {
      style: typeof raw.style === "string" && raw.style ? raw.style : undefined,
      size: typeof raw.size === "string" && raw.size ? raw.size : undefined
    };
  } catch {
    return {};
  }
}

export function setPendingVariant(v: PendingVariant) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_KEY, JSON.stringify(v));
}

export function clearPendingVariant() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_KEY);
}

export function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
  const cart = getCart();
  const key = variantKey(item);
  const existing = cart.find((c) => variantKey(c) === key);
  if (existing) {
    existing.quantity += item.quantity ?? 1;
  } else {
    cart.push({ ...item, quantity: item.quantity ?? 1 });
  }
  setCart(cart);
}

/** 就地更新某一行（改规格 / 改数量），会派发 cart-updated 让所有订阅者刷新 */
export function updateCartItem(
  key: string,
  patch: Partial<Pick<CartItem, "quantity" | "style" | "size" | "customText">>
) {
  const cart = getCart();
  const next = cart.map((c) => (variantKey(c) === key ? { ...c, ...patch } : c));
  setCart(next);
}

export function clearCart() {
  setCart([]);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.price * i.quantity, 0);
}

/** 购物车商品件数（用于角标） */
export function cartCount(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.quantity, 0);
}
