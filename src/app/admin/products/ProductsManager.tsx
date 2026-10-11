"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/toast/ToastProvider";
import { ImageSpecHint } from "@/components/admin/ImageSpecHint";

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  stock: number;
  customizable: boolean;
  customNote: string | null;
  featured: boolean;
  active: boolean;
};

const empty = {
  slug: "",
  title: "",
  description: "",
  price: 0,
  images: [] as string[],
  category: "accessories",
  stock: 0,
  customizable: false,
  customNote: "",
  featured: false
};

export function ProductsManager({ initial }: { initial: Product[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...empty });
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  async function create() {
    if (!form.title || !form.slug) return alert("Please fill in the slug and title");
    setBusy(true);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images: form.images.filter(Boolean) })
    });
    setBusy(false);
    setForm({ ...empty });
    router.refresh();
  }

  async function saveEdit() {
    if (!editing) return;
    setBusy(true);
    await fetch(`/api/products/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing)
    });
    setBusy(false);
    setEditing(null);
    toast("Changes saved", "success");
    router.refresh();
  }

  async function confirmRemove() {
    if (!pendingDelete) return;
    const name = pendingDelete.title;
    await fetch(`/api/products/${pendingDelete.id}`, { method: "DELETE" });
    setPendingDelete(null);
    toast(`Deleted “${name}”`, "success");
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Create form */}
      <div className="card">
        <h2 className="mb-4 font-serif text-xl">Add Product</h2>
        <div className="space-y-3">
          <div><label className="label">Slug</label><input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Price (cents)</label><input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div><label className="label">Stock</label><input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
          </div>
          <div><label className="label">Image URLs (comma-separated)</label><input className="input" onChange={(e) => setForm({ ...form, images: e.target.value.split(",").map((s) => s.trim()) })} /><ImageSpecHint spec="card" /></div>
          <div><label className="label">Category</label><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.customizable} onChange={(e) => setForm({ ...form, customizable: e.target.checked })} />Supports customization</label>
          <div><label className="label">Customization note</label><input className="input" value={form.customNote} onChange={(e) => setForm({ ...form, customNote: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />Featured on homepage</label>
          <button onClick={create} disabled={busy} className="btn-primary w-full">Create Product</button>
        </div>
      </div>

      {/* Product list */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl">All Products ({initial.length})</h2>
        {initial.map((p) => (
          <div key={p.id} className="card">
            {editing?.id === p.id ? (
              <div className="space-y-3">
                <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                <textarea className="input" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                  <input className="input" type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="btn-primary !py-2">Save</button>
                  <button onClick={() => setEditing(null)} className="btn-outline !py-2">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-ink/70">{p.slug} · {p.category}</div>
                  <div className="mt-1 text-sm">{formatPrice(p.price, p.currency)} · Stock {p.stock}</div>
                  <div className="mt-1 flex gap-2 text-xs">
                    {p.customizable && <span className="rounded bg-sage/20 px-2 py-0.5 text-sage">Customizable</span>}
                    {p.featured && <span className="rounded bg-clay/20 px-2 py-0.5 text-clay">Featured</span>}
                    {!p.active && <span className="rounded bg-gray-200 px-2 py-0.5">Unlisted</span>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 text-sm">
                  <button onClick={() => setEditing(p)} className="text-clay hover:underline">Edit</button>
                  <button onClick={() => setPendingDelete(p)} className="text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 删除确认弹窗 */}
      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete this product?"
        footer={
          <>
            <button className="btn-outline !py-2.5" onClick={() => setPendingDelete(null)}>
              Cancel
            </button>
            <button
              className="btn bg-red-600 px-6 !py-2.5 text-white transition-colors hover:bg-red-700"
              onClick={confirmRemove}
            >
              Delete
            </button>
          </>
        }
      >
        <p>
          “{pendingDelete?.title}” will be permanently removed from the store. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
