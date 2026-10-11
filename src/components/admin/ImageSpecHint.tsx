import { ImageIcon } from "lucide-react";

/**
 * 图片规格提示：统一并简化各处的图片尺寸规格，方便按预设选取/上传。
 */
export const IMAGE_SPECS: Record<string, string> = {
  hero: "2400 × 1350 px · 16:9 · full-bleed",
  main: "1200 × 1500 px · 4:5 · product main",
  card: "1000 × 1250 px · 4:5 · card / grid",
  thumb: "800 × 800 px · 1:1 · thumbnail",
  banner: "2400 × 1200 px · 2:1 · banner"
};

export function ImageSpecHint({ spec }: { spec: keyof typeof IMAGE_SPECS }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink/65">
      <ImageIcon size={12} strokeWidth={1.6} />
      Preset: {IMAGE_SPECS[spec]}
    </p>
  );
}
