import prisma from "@/lib/prisma";
import { DEMO_SETTINGS, isDemoMode } from "@/lib/demo-data";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let initial: { key: string; value: string; group: string }[];

  if (isDemoMode()) {
    initial = Object.entries(DEMO_SETTINGS).map(([key, value]) => ({
      key,
      value,
      group: key.split(".")[0]
    }));
  } else {
    const items = await prisma.pageSetting.findMany({ orderBy: { key: "asc" } });
    initial = items.map((i) => ({ key: i.key, value: i.value, group: i.group }));
  }

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl">Site Settings</h1>
      <p className="mb-8 text-sm text-ink/78">Edit the copy and images shown on the storefront. Changes take effect immediately.</p>
      <SettingsForm initial={initial} />
    </div>
  );
}
