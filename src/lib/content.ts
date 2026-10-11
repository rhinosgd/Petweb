import prisma from "@/lib/prisma";
import { DEMO_PRODUCTS, DEMO_SETTINGS, DEMO_POSTS, isDemoMode } from "@/lib/demo-data";

/** 统一的站点内容读取（演示模式走内置数据） */
export async function getSettings(): Promise<Record<string, string>> {
  if (isDemoMode()) return { ...DEMO_SETTINGS };
  const rows = await prisma.pageSetting.findMany();
  const map: Record<string, string> = {};
  rows.forEach((r) => (map[r.key] = r.value));
  return map;
}

export async function getFeaturedProducts(take = 3) {
  if (isDemoMode()) return DEMO_PRODUCTS.filter((p) => p.featured).slice(0, take);
  return prisma.product.findMany({ where: { featured: true, active: true }, take });
}

export async function getAllProducts() {
  if (isDemoMode()) return DEMO_PRODUCTS;
  return prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } });
}

export async function getProductBySlug(slug: string) {
  if (isDemoMode()) return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  return prisma.product.findUnique({ where: { slug } });
}

export async function getPosts() {
  if (isDemoMode()) return DEMO_POSTS;
  return prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
}

export async function getPostBySlug(slug: string) {
  if (isDemoMode()) return DEMO_POSTS.find((p) => p.slug === slug) ?? null;
  return prisma.post.findUnique({ where: { slug } });
}
