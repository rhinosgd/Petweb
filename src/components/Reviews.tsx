"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { DemoReview } from "@/lib/demo-data";

/**
 * 商品评价区（maxbone 式）：
 * - 顶部平均分 + 星级分布
 * - 横向滑块展示评论卡（每卡含星级、标题、正文、作者、尺码反馈）
 * - 纯 CSS scroll-snap，按钮做翻页
 */
export function Reviews({ reviews }: { reviews: DemoReview[] }) {
  const [index, setIndex] = useState(0);

  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length
  }));

  function scrollTo(i: number) {
    const next = Math.max(0, Math.min(reviews.length - 1, i));
    setIndex(next);
    const el = document.getElementById("review-scroller");
    if (el) {
      const card = el.children[next] as HTMLElement | undefined;
      if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
    }
  }

  return (
    <section className="border-t border-ink/10 bg-white py-16 md:py-24">
      <div className="container-content">
        <div className="grid gap-10 md:grid-cols-[280px_minmax(0,1fr)] md:gap-16">
          {/* 评分汇总 */}
          <div className="md:pt-1">
            <span className="eyebrow">Reviews</span>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-5xl leading-none">{avg.toFixed(1)}</span>
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={15}
                    strokeWidth={1.4}
                    className={s <= Math.round(avg) ? "fill-ink text-ink" : "text-ink/55"}
                  />
                ))}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/65">Based on {reviews.length} verified reviews</p>

            <ul className="mt-6 space-y-2">
              {dist.map((d) => (
                <li key={d.star} className="flex items-center gap-3 text-xs text-ink/70">
                  <span className="w-8 shrink-0">{d.star} ★</span>
                  <span className="h-1 flex-1 overflow-hidden bg-ink/10">
                    <span
                      className="block h-full bg-ink"
                      style={{ width: `${(d.count / reviews.length) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 评论滑块 */}
          <div className="min-w-0">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-2xl">What our customers say</h3>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  aria-label="Previous review"
                  disabled={index === 0}
                  onClick={() => scrollTo(index - 1)}
                  className="flex h-9 w-9 items-center justify-center border border-ink/20 transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-ink/20"
                >
                  <ChevronLeft size={16} strokeWidth={1.6} />
                </button>
                <button
                  type="button"
                  aria-label="Next review"
                  disabled={index === reviews.length - 1}
                  onClick={() => scrollTo(index + 1)}
                  className="flex h-9 w-9 items-center justify-center border border-ink/20 transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-ink/20"
                >
                  <ChevronRight size={16} strokeWidth={1.6} />
                </button>
              </div>
            </div>

            <div
              id="review-scroller"
              className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
            >
              {reviews.map((r, i) => (
                <article
                  key={i}
                  className="w-[85%] shrink-0 snap-start border border-ink/10 bg-sand/50 p-6 sm:w-[46%] lg:w-[38%]"
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        strokeWidth={1.4}
                        className={s <= r.rating ? "fill-ink text-ink" : "text-ink/50"}
                      />
                    ))}
                  </div>
                  <h4 className="mt-4 font-serif text-lg leading-snug">{r.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-ink/78">{r.body}</p>
                  <div className="mt-5 border-t border-ink/10 pt-4 text-xs text-ink/65">
                    <div className="font-medium text-ink/85">{r.author}</div>
                    {r.meta && <div className="mt-0.5">{r.meta}</div>}
                    {r.sizing && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="uppercase" style={{ letterSpacing: "0.14em" }}>
                          Sizing
                        </span>
                        <span className="border border-ink/15 px-2 py-0.5">{r.sizing}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
