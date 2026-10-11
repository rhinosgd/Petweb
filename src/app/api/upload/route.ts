import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

/** 允许的附件类型（图片 / PDF / Word） */
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * 附件上传（本地存储）。
 * 保存到 public/uploads/custom/，返回可直接访问的 url。
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "uploads", "custom");
    await mkdir(dir, { recursive: true });

    const saved: { name: string; size: number; type: string; url: string }[] = [];

    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.name}. Please upload an image, PDF or Word document.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `${file.name} is larger than 10 MB.` },
          { status: 400 }
        );
      }

      const ext = path.extname(file.name) || "";
      const base = path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .slice(0, 40);
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}_${base}${ext}`;

      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, fileName), buf);

      saved.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/custom/${fileName}`
      });
    }

    return NextResponse.json({ files: saved });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
