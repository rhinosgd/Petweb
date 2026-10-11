import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session;
}

// 新建商品
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      slug: body.slug,
      title: body.title,
      description: body.description ?? "",
      price: Number(body.price) || 0,
      images: body.images ?? [],
      category: body.category ?? "accessories",
      stock: Number(body.stock) || 0,
      customizable: !!body.customizable,
      customNote: body.customNote ?? null,
      featured: !!body.featured
    }
  });
  return NextResponse.json(product);
}
