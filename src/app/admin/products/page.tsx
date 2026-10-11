import prisma from "@/lib/prisma";
import { DEMO_PRODUCTS, isDemoMode } from "@/lib/demo-data";
import { ProductsManager } from "./ProductsManager";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = isDemoMode()
    ? DEMO_PRODUCTS
    : await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl">Products</h1>
      <p className="mb-8 text-sm text-ink/78">Create, edit and remove products, with support for handmade customization fields.</p>
      <ProductsManager initial={products as never} />
    </div>
  );
}
