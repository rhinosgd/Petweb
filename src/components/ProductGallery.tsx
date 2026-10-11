"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

/**
 * 商品详情图库：
 * - 主图 hover 轻微放大（.img-zoom）；点击 → 全屏 Lightbox
 * - 点击缩略图切换主图，主图播放「向前凸出」动画
 */
export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [popKey, setPopKey] = useState(0);

  function select(i: number) {
    setActive(i);
    setPopKey((k) => k + 1); // 触发重放 img-pop
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Enlarge image"
        className="group relative block aspect-[4/5] w-full overflow-hidden bg-sand"
      >
        {images[active] && (
          <Image
            key={popKey}
            src={images[active]}
            alt={title}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="img-zoom cursor-zoom-in object-cover"
            style={popKey > 0 ? { animation: "img-pop 320ms cubic-bezier(0.2,0.8,0.2,1)" } : undefined}
          />
        )}
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => select(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "group relative aspect-square overflow-hidden bg-sand transition-opacity",
                active === i ? "opacity-100 ring-1 ring-ink" : "opacity-70 hover:opacity-100"
              )}
            >
              <Image src={img} alt="" fill sizes="12vw" className="img-zoom object-cover" />
            </button>
          ))}
        </div>
      )}

      {images[active] && (
        <Lightbox src={images[active]} alt={title} open={open} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
