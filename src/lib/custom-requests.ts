/**
 * 定做询价工单的数据访问层。
 * - DEMO_MODE：使用进程内内存存储（模块级单例），支持完整流程演示
 * - 生产：走 Prisma CustomRequest
 *
 * 说明：内存存储随 dev server 重启清空，符合「预览演示」定位；
 * 生产切到 Prisma 后数据持久化。
 */

import prisma from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-data";

export type CustomStatus = "PENDING_QUOTE" | "QUOTED" | "ACCEPTED" | "DECLINED";

export type TimelineEvent = {
  at: string;
  actor: "customer" | "admin" | "system";
  event: string;
  note?: string;
};

export type CustomAttachment = {
  name: string;
  size: number;
  type: string;
  url: string;
};

export type CustomRequestRecord = {
  id: string;
  orderNo: string;
  productId?: string | null;
  productSlug: string;
  productTitle: string;
  material: string;
  color: string;
  dimensions: string;
  description: string;
  email: string;
  phone?: string | null;
  attachments: CustomAttachment[];
  quotedAmount?: number | null;
  quotedNote?: string | null;
  quotedAt?: string | null;
  status: CustomStatus;
  declineReason?: string | null;
  respondedAt?: string | null;
  linkedOrderNo?: string | null;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

/* -------------------- 内存存储（DEMO） -------------------- */

const globalForCustom = globalThis as unknown as {
  __customRequests?: CustomRequestRecord[];
};

function store(): CustomRequestRecord[] {
  if (!globalForCustom.__customRequests) {
    globalForCustom.__customRequests = [];
  }
  return globalForCustom.__customRequests;
}

/* -------------------- 统一读写 -------------------- */

type CreateInput = Omit<
  CustomRequestRecord,
  "id" | "status" | "timeline" | "createdAt" | "updatedAt" | "orderNo"
> & { orderNo?: string };

export function makeCustomOrderNo(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `CR${ts}${rand}`;
}

export async function createCustomRequest(input: CreateInput): Promise<CustomRequestRecord> {
  const now = new Date().toISOString();
  const orderNo = input.orderNo ?? makeCustomOrderNo();
  const timeline: TimelineEvent[] = [
    { at: now, actor: "customer", event: "Request submitted" },
    { at: now, actor: "system", event: "Confirmation email sent to customer" }
  ];

  if (isDemoMode()) {
    const rec: CustomRequestRecord = {
      ...input,
      id: `cr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderNo,
      status: "PENDING_QUOTE",
      timeline,
      createdAt: now,
      updatedAt: now
    };
    store().unshift(rec);
    return rec;
  }

  const row = await prisma.customRequest.create({
    data: {
      orderNo,
      productId: input.productId ?? null,
      productSlug: input.productSlug,
      productTitle: input.productTitle,
      material: input.material,
      color: input.color,
      dimensions: input.dimensions,
      description: input.description,
      email: input.email,
      phone: input.phone ?? null,
      attachments: input.attachments as unknown as object[],
      timeline: timeline as unknown as object[]
    }
  });
  return row as unknown as CustomRequestRecord;
}

export async function listCustomRequests(): Promise<CustomRequestRecord[]> {
  if (isDemoMode()) return [...store()];
  const rows = await prisma.customRequest.findMany({ orderBy: { createdAt: "desc" } });
  return rows as unknown as CustomRequestRecord[];
}

export async function getCustomRequest(id: string): Promise<CustomRequestRecord | null> {
  if (isDemoMode()) return store().find((r) => r.id === id) ?? null;
  const row = await prisma.customRequest.findUnique({ where: { id } });
  return (row as unknown as CustomRequestRecord) ?? null;
}

/** 客户查询：邮箱 + 单号（两者都匹配才返回，避免越权枚举） */
export async function findCustomRequest(
  email: string,
  orderNo: string
): Promise<CustomRequestRecord | null> {
  const e = email.trim().toLowerCase();
  const n = orderNo.trim().toUpperCase();
  if (isDemoMode()) {
    return store().find((r) => r.email.toLowerCase() === e && r.orderNo.toUpperCase() === n) ?? null;
  }
  const row = await prisma.customRequest.findFirst({ where: { orderNo: n } });
  if (!row) return null;
  return row.email.toLowerCase() === e ? (row as unknown as CustomRequestRecord) : null;
}

/** 更新工单（合并式），并追加时间线事件 */
export async function updateCustomRequest(
  id: string,
  patch: Partial<CustomRequestRecord>,
  event?: TimelineEvent
): Promise<CustomRequestRecord | null> {
  const now = new Date().toISOString();

  if (isDemoMode()) {
    const arr = store();
    const idx = arr.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    const next: CustomRequestRecord = {
      ...arr[idx],
      ...patch,
      timeline: event ? [...arr[idx].timeline, event] : arr[idx].timeline,
      updatedAt: now
    };
    arr[idx] = next;
    return next;
  }

  const current = await prisma.customRequest.findUnique({ where: { id } });
  if (!current) return null;
  const timeline = [
    ...((current.timeline as unknown as TimelineEvent[]) ?? []),
    ...(event ? [event] : [])
  ];
  const row = await prisma.customRequest.update({
    where: { id },
    data: { ...(patch as object), timeline: timeline as unknown as object[] }
  });
  return row as unknown as CustomRequestRecord;
}
