"use client";

import { useState } from "react";
import { SpinnerButton } from "@/components/SpinnerButton";
import { useToast } from "@/components/toast/ToastProvider";
import { RichTextField } from "@/components/admin/RichTextField";
import { ImageSpecHint, IMAGE_SPECS } from "@/components/admin/ImageSpecHint";

type Item = { key: string; value: string; group: string };

/** 走富文本编辑的键（文案类，含预设格式与局部格式化） */
const RICH_KEYS = new Set([
  "home.hero.title",
  "home.hero.subtitle",
  "about.story"
]);

/** 走图片规格提示的键 */
function specFor(key: string): keyof typeof IMAGE_SPECS | null {
  if (key.endsWith(".image")) {
    if (key.includes("hero")) return "hero";
    return "banner";
  }
  return null;
}

export function SettingsForm({ initial }: { initial: Item[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>(initial);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const groups = Array.from(new Set(items.map((i) => i.group)));

  function update(key: string, value: string) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, value } : i)));
  }

  async function save() {
    setSaving(true);
    setSuccess(false);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(({ key, value }) => ({ key, value })) })
    });
    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      toast("Settings saved", "success");
    } else {
      toast("Save failed — please try again", "error");
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-ink/10 bg-white/60 px-4 py-3 text-xs text-ink/75">
        Text fields use the storefront's preset formats. Select any part to emphasise it, and the toolbar shows the
        format at the cursor. Images follow a fixed preset spec so uploads stay consistent.
      </div>

      {groups.map((g) => (
        <div key={g} className="card">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink/70">{g}</div>
          <div className="space-y-5">
            {items
              .filter((i) => i.group === g)
              .map((i) => {
                const spec = specFor(i.key);
                return (
                  <div key={i.key}>
                    {RICH_KEYS.has(i.key) ? (
                      <RichTextField
                        label={i.key}
                        value={i.value}
                        onChange={(html) => update(i.key, html)}
                        minHeight={i.key === "about.story" ? 140 : 90}
                      />
                    ) : (
                      <>
                        <label className="label">{i.key}</label>
                        <input className="input" value={i.value} onChange={(e) => update(i.key, e.target.value)} />
                      </>
                    )}
                    {spec && <ImageSpecHint spec={spec} />}
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <SpinnerButton onClick={save} loading={saving} success={success} className="btn-primary">
          {saving ? "Saving…" : "Save All"}
        </SpinnerButton>
      </div>
    </div>
  );
}
