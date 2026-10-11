/** 商品卡配色 */
export type ProductColor = { name: string; hex: string };

/**
 * 商品卡渲染所需的「最小可见字段」。
 * Prisma 返回的 Product 与 demo 数据都能满足（colors 为 JsonValue，需归一化）。
 */
export type CardProduct = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  customizable?: boolean;
  featured?: boolean;
  colors?: unknown;
};

/**
 * 把 Prisma 的 JsonValue（可能为 null / 非法结构）归一化为 ProductColor[]。
 * 非数组、或元素缺少 name/hex 的项会被安全丢弃。
 */
export function normalizeColors(raw: unknown): ProductColor[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (c): c is ProductColor =>
      typeof c === "object" &&
      c !== null &&
      typeof (c as ProductColor).name === "string" &&
      typeof (c as ProductColor).hex === "string"
  );
}

/** 安全取出字符串数组字段（features / sizes / images 等） */
export function toStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
}
