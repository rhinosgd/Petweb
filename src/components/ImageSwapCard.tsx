"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 图片交换卡：
 * - hover 显示第 2 张图，移开恢复第 1 张
 * - 触屏设备改为点击切换（无 hover）
 * - protruding=true 时，点击图片播放「向前凸出」动画（banner 图请设 false）
 */
export function ImageSwapCard({
  images,
  alt,
  className,
  imageClassName,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  protruding = false,
  overlay = false,
  children
}: {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  protruding?: boolean;
  overlay?: boolean;
  children?: React.ReactNode;
}) {
  const [idx, setIdx] = useState(0);
  const [pop, setPop] = useState(false);
  const hasTwo = images.length > 1;

  function handleClick() {
    if (!protruding) return;
    setPop(false);
    // 重排以重放动画
    requestAnimationFrame(() => setPop(true));
    window.setTimeout(() => setPop(false), 380);
  }

  return (
    <div
      className={cn("relative overflow-hidden bg-sand", className)}
      onMouseEnter={() => hasTwo && setIdx(1)}
      onMouseLeave={() => setIdx(0)}
      onClick={handleClick}
    >
      {/* 第一张 */}
      {images[0] && (
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover transition-opacity duration-200",
            hasTwo && idx === 1 ? "opacity-0" : "opacity-100",
            pop && "img-pop",
            imageClassName
          )}
        />
      )}
      {/* 第二张（hover 显示） */}
      {hasTwo && (
        <Image
          src={images[1]}
          alt={`${alt} — alternate view`}
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-opacity duration-200",
            idx === 1 ? "opacity-100" : "opacity-0",
            pop && "img-pop",
            imageClassName
          )}
        />
      )}
      {/* 可选：hover 半透明遮罩（由父级 .card-lift 触发） */}
      {overlay && <span className="card-overlay" />}
      {children}
    </div>
  );
}
