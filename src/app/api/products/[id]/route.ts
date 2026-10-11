import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session;
}

// 更新商品
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      price: body.price !== undefined ? Number(body.price) : undefined,
      images: body.images,
      category: body.category,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      customizable: body.customizable,
      customNote: body.customNote,
      featured: body.featured,
      active: body.active
    }
  });
  return NextResponse.json(product);
}

// 删除商品
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
