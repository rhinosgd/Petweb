"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingBag, Menu, ArrowUpRight } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { Drawer } from "./Drawer";
import { useCart } from "@/components/CartDrawer";

/** Mega Menu 图片卡：右栏推荐位 */
type MegaCard = { title: string; caption: string; href: string; image: string };

type NavItem = {
  label: string;
  href: string;
  /** 左栏纵向子分类 */
  items?: string[];
  /** 右栏图文推荐卡 */
  cards?: MegaCard[];
};

const NAV: NavItem[] = [
  {
    label: "Dogs",
    href: "/products",
    items: ["Walk", "Carrier Bags", "Leash Sets", "Apparel", "Beds & Blankets", "Toys", "Bestsellers"],
    cards: [
      {
        title: "Freeze-dried Food",
        caption: "Slow-made nutrition",
        href: "/products",
        image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=900"
      },
      {
        title: "What's New",
        caption: "Fresh from the workshop",
        href: "/products",
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900"
      }
    ]
  },
  {
    label: "Cats",
    href: "/products",
    items: ["Walk", "Bags", "Wear", "Toys", "Beds", "Scratchers", "Bestsellers"],
    cards: [
      {
        title: "Scratchers",
        caption: "Solid wood & sisal",
        href: "/products",
        image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=900"
      },
      {
        title: "Bestsellers",
        caption: "Loved by the pack",
        href: "/products",
        image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=900"
      }
    ]
  },
  { label: "Handmade", href: "/products" },
  { label: "Journal", href: "/blog" },
  { label: "About", href: "/about" }
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  /** 当前展开 Mega Menu 的标签（null = 全部收起） */
  const [openMega, setOpenMega] = useState<string | null>(null);
  const { count, openCart } = useCart();

  const megaOpen = openMega !== null;

  return (
    <>
      {/* 公告条 */}
      <div className="bg-ink text-white">
        <div className="container-content flex h-9 items-center justify-center text-center text-[10px] uppercase tracking-widest md:text-[11px]">
          Complimentary shipping on orders over $75 · Handmade to order
        </div>
      </div>

      <header
        className="sticky top-0 z-40 border-b border-ink/10 bg-white/85 backdrop-blur-md"
        onMouseLeave={() => setOpenMega(null)}
      >
        <div className="container-content flex h-16 items-center justify-between md:h-20">
          {/* 左：移动端汉堡 + 桌面导航 */}
          <div className="flex items-center gap-1 lg:gap-2">
            <button
              type="button"
              aria-label="Open menu"
              className="mr-2 text-ink/85 transition-colors hover:text-ink md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} strokeWidth={1.6} />
            </button>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {NAV.map((n) => {
                const hasMega = Boolean(n.items || n.cards);
                return (
                  <div
                    key={n.label}
                    className="group relative"
                    onMouseEnter={() => hasMega && setOpenMega(n.label)}
                    onMouseLeave={() => hasMega && setOpenMega((cur) => (cur === n.label ? null : cur))}
                  >
                    <Link
                      href={n.href}
                      aria-expanded={hasMega ? openMega === n.label : undefined}
                      aria-haspopup={hasMega ? "true" : undefined}
                      onFocus={() => hasMega && setOpenMega(n.label)}
                      className="nav-pill text-[11px] font-medium uppercase text-ink/85"
                      style={{ letterSpacing: "0.18em" }}
                    >
                      {n.label}
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* 品牌名（居中） */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl font-medium tracking-tight transition-opacity hover:opacity-70 md:text-[28px]"
          >
            Paw &amp; Craft
          </Link>

          {/* 右：图标操作 */}
          <div className="ml-auto flex items-center gap-5 md:gap-6">
            <Tooltip label="Search">
              <button aria-label="Search" className="text-ink/85 transition-colors hover:text-ink">
                <Search size={18} strokeWidth={1.5} />
              </button>
            </Tooltip>
            <Tooltip label="Account">
              <button aria-label="Account" className="hidden text-ink/85 transition-colors hover:text-ink md:block">
                <User size={18} strokeWidth={1.5} />
              </button>
            </Tooltip>
            <button
              type="button"
              aria-label={`Cart, ${count} items`}
              onClick={openCart}
              className="relative flex items-center gap-2 text-ink/85 transition-colors hover:text-ink"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="hidden text-[11px] font-medium uppercase md:inline" style={{ letterSpacing: "0.18em" }}>
                Cart
              </span>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-semibold text-white md:-right-4">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ===== Mega Menu 全宽图文下拉 ===== */}
        {NAV.map((n) => {
          if (!n.items && !n.cards) return null;
          const isOpen = openMega === n.label;
          return (
            <div
              key={`mega-${n.label}`}
              className={`mega-panel ${isOpen ? "is-open" : ""}`}
              aria-hidden={!isOpen}
              onMouseEnter={() => setOpenMega(n.label)}
            >
              <div className="mega-panel-inner">
                <div className="container-content grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16 lg:py-14">
                  {/* 左栏：纵向子分类 */}
                  <div>
                    <div className="eyebrow mb-6">{n.label}</div>
                    <ul className="space-y-0.5">
                      {n.items?.map((it) => (
                        <li key={it}>
                          <Link
                            href={n.href}
                            className="mega-link group/link inline-flex items-center gap-2 py-2.5 text-[13px] uppercase text-ink/80 transition-colors hover:text-ink"
                            style={{ letterSpacing: "0.12em" }}
                          >
                            <span>{it}</span>
                            <ArrowUpRight
                              size={13}
                              strokeWidth={1.6}
                              className="opacity-0 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:opacity-100"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 右栏：图文推荐卡 */}
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {n.cards?.map((c) => (
                      <Link key={c.title} href={c.href} className="mega-card group/card block">
                        <div className="img-zoom-wrap relative aspect-[4/5] overflow-hidden bg-sand">
                          <Image
                            src={c.image}
                            alt={c.title}
                            fill
                            sizes="(min-width: 1024px) 25vw, 100vw"
                            className="img-zoom object-cover"
                          />
                        </div>
                        <div className="mt-4 flex items-start justify-between gap-3">
                          <div>
                            <div className="font-serif text-lg leading-tight">{c.title}</div>
                            <div className="mt-1 text-[11px] uppercase text-ink/65" style={{ letterSpacing: "0.14em" }}>
                              {c.caption}
                            </div>
                          </div>
                          <ArrowUpRight
                            size={16}
                            strokeWidth={1.5}
                            className="mt-1 shrink-0 text-ink/65 transition-all duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-ink"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              {/* 底部压暗线，强化「面板」感 */}
              <div className="h-px w-full bg-ink/10" />
            </div>
          );
        })}
      </header>

      {/* 页面内容遮罩：Mega Menu 展开时轻微压暗（提升面板层次） */}
      <div className={`mega-scrim ${megaOpen ? "is-open" : ""}`} aria-hidden />

      {/* 移动端导航抽屉 */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title="Menu">
        <nav className="space-y-1">
          {NAV.map((n) => (
            <MobileNavItem key={n.label} item={n} onNavigate={() => setMobileOpen(false)} />
          ))}
        </nav>
      </Drawer>
    </>
  );
}

function MobileNavItem({
  item,
  onNavigate
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-ink/5">
      <div className="flex items-center justify-between">
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex-1 py-4 font-serif text-xl transition-colors hover:text-clay"
        >
          {item.label}
        </Link>
        {item.items && (
          <button
            type="button"
            aria-label={expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="p-2 text-ink/70"
          >
            <span className="block text-lg leading-none">{expanded ? "−" : "+"}</span>
          </button>
        )}
      </div>
      {item.items && (
        <div className="accordion-item" data-open={expanded}>
          <div className="accordion-panel">
            <div>
              <div className="space-y-2 pb-4 pl-1">
                {item.items.map((it) => (
                  <Link
                    key={it}
                    href={item.href}
                    onClick={onNavigate}
                    className="block py-1.5 text-sm uppercase tracking-wider text-ink/75 transition-colors hover:text-ink"
                  >
                    {it}
                  </Link>
                ))}
              </div>

              {/* 移动端同样展示推荐图卡（两列小图） */}
              {item.cards && (
                <div className="grid grid-cols-2 gap-3 pb-6">
                  {item.cards.map((c) => (
                    <Link key={c.title} href={c.href} onClick={onNavigate} className="block">
                      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                        <Image src={c.image} alt={c.title} fill sizes="45vw" className="object-cover" />
                      </div>
                      <div className="mt-2 text-[12px] font-medium">{c.title}</div>
                      <div className="text-[10px] uppercase text-ink/65" style={{ letterSpacing: "0.14em" }}>
                        {c.caption}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteFooter({ copyright }: { copyright?: string }) {
  const cols = [
    { title: "Shop", links: ["Dogs", "Cats", "Handmade", "Gift Cards"] },
    { title: "Help", links: ["Shipping", "Returns", "Size Guide", "Contact"] },
    { title: "Company", links: ["Our Story", "Journal", "Sustainability", "Careers"] }
  ];

  return (
    <footer className="border-t border-ink/10 bg-white">
      {/* 订阅区 */}
      <div className="border-b border-ink/10">
        <div className="container-content grid gap-8 py-20 md:grid-cols-2 md:py-24">
          <div>
            <h3 className="font-serif text-3xl font-light md:text-4xl">Join the pack</h3>
            <p className="body-sm mt-4 max-w-md">
              Be first to know about new handmade drops, limited collaborations, and stories from the workshop.
            </p>
          </div>
          <SubscribeForm />
        </div>
      </div>

      {/* 链接区 */}
      <div className="container-content grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="font-serif text-xl">Paw &amp; Craft</div>
          <p className="body-sm mt-4 max-w-xs">
            Handcrafted pet essentials, designed with intention in small batches.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="eyebrow mb-5">{c.title}</div>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-ink/78 transition-colors hover:text-ink">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/10">
        <div className="container-content flex flex-col items-center justify-between gap-3 py-6 text-[11px] uppercase text-ink/65 md:flex-row" style={{ letterSpacing: "0.16em" }}>
          <span>{copyright || "© 2026 Paw & Craft. All rights reserved."}</span>
          <span>Privacy · Terms · Accessibility</span>
        </div>
      </div>
    </footer>
  );
}

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    // 演示：模拟异步提交
    window.setTimeout(() => setState("done"), 900);
  }

  return (
    <form onSubmit={submit} className="flex items-end">
      <div className="flex w-full items-center gap-4 border-b border-ink/25 pb-3">
        <input
          type="email"
          required
          value={email}
          disabled={state !== "idle"}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink/75"
        />
        <button
          type="submit"
          disabled={state !== "idle"}
          className="shrink-0 text-[11px] font-medium uppercase text-ink transition-opacity hover:opacity-60 disabled:opacity-60"
          style={{ letterSpacing: "0.18em" }}
        >
          {state === "loading" ? "…" : state === "done" ? "✓ Subscribed" : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
