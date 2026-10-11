import { notFound } from "next/navigation";
import { CustomRequestForm } from "@/components/CustomRequestForm";
import { getProductBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function CustomRequestPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product || !product.active) notFound();

  return (
    <CustomRequestForm
      product={{
        id: product.id,
        slug: product.slug,
        title: product.title,
        image: product.images[0] ?? "",
        category: product.category
      }}
    />
  );
}
