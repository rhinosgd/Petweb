import Link from "next/link";
import Image from "next/image";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ProductCard } from "@/components/ProductCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import { formatPrice } from "@/lib/utils";
import { getAllProducts } from "@/lib/content";

export const dynamic = "force-dynamic";

const FAQ = [
  {
    q: "How long does an order take to make?",
    a: "Every piece is handmade to order in our small workshop. Personalised items take 5–7 days to make, plus shipping time. You'll receive a confirmation email when your order is on its way."
  },
  {
    q: "Can I personalise my pet's collar or bandana?",
    a: "Yes. Most accessories can be hand-embroidered with up to 12 characters. Just add your pet's name in the personalisation box before adding to cart — our makers will match the thread to your chosen colour."
  },
  {
    q: "What materials do you use?",
    a: "We work with full-grain leather, organic cotton, natural wool blends and solid wood — all responsibly sourced. We avoid synthetic fillers and plastic fastenings wherever a natural alternative exists."
  },
  {
    q: "Do you ship worldwide?",
    a: "We ship to most countries. Orders over $75 ship free. Standard delivery takes 7–14 days depending on your location, and every parcel is tracked end to end."
  },
  {
    q: "What is your returns policy?",
    a: "Unworn, unpersonalised pieces can be returned within 30 days for a full refund. Personalised items are made just for you, so they're final sale — but if anything is wrong, we'll always make it right."
  },
  {
    q: "How should I care for my handmade pieces?",
    a: "Spot-clean leather with a soft damp cloth and condition it occasionally. Cotton and wool items are machine washable on a gentle cycle — always use a laundry bag to protect the stitching."
  }
];

const IMG = {
  hero: "https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=2400",
  collar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1600",
  bed: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1600",
  cat: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=1600",
  walk: "https://images.unsplash.com/photo-1494947665470-20322015e3a8?w=1600",
  collab: "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=1600",
  blanket: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=1600",
  workshop: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1600"
};

const PRESS = ["VOGUE", "GQ", "Kinfolk", "Monocle", "Cereal", "Wallpaper*"];

export default async function HomePage() {
  const products = await getAllProducts();
  const hero = products.slice(0, 3);
  const accessories = products.filter((p) => p.category === "accessories" || p.category === "collars").slice(0, 2);
  const beds = products.filter((p) => p.category === "beds" || p.category === "cat").slice(0, 2);

  return (
    <>
      <SiteHeader />

      {/* ============ 1. HERO (Full-bleed, 90vh) ============ */}
      <section className="relative">
        <div className="relative h-[90vh] min-h-[560px] w-full overflow-hidden bg-sand">
          <Image src={IMG.hero} alt="Handcrafted pet essentials" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-black/5" />
          <div className="container-content absolute inset-x-0 bottom-0 flex flex-col justify-end pb-20 text-white md:pb-28">
            <span className="eyebrow !text-white/75">The Handmade Collection</span>
            <h1 className="h-hero mt-5 max-w-4xl">
              Pet essentials,
              <br />
              made by hand.
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/85 md:text-lg">
              We craft modern, thoughtfully designed pieces for the animals you love — small-batch, made to last,
              and personal to you.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/products" className="btn-light">View Work</Link>
              <Link href="/about" className="btn border border-white/40 text-white transition-colors hover:bg-white hover:text-ink">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. 明星产品（3列，含 #1 Seller 标签）============ */}
      <section className="section">
        <div className="container-content">
          <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="eyebrow">Most Loved</span>
              <h2 className="h-section mt-5">The pieces you keep coming back to.</h2>
            </div>
            <Link href="/products" className="btn-link shrink-0">View All</Link>
          </div>

          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {hero.map((p, i) => (
              <ProductCard key={p.id} product={p} badge={i === 0 ? "#1 Seller" : undefined} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3. 场景分类（编辑式大图 + 文案）============ */}
      <section className="section-sm bg-sand">
        <div className="container-content">
          <div className="mb-12 text-center">
            <span className="eyebrow">Shop by Ritual</span>
            <h2 className="h-section mx-auto mt-5 max-w-2xl">Everything for the everyday.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <CategoryCard
              href="/products"
              img={IMG.walk}
              overline="Walk"
              title="Daily walks, elevated."
              text="Leashes, harnesses and carriers built for miles and made to last."
            />
            <CategoryCard
              href="/products"
              img={IMG.bed}
              overline="Rest"
              title="A place to call their own."
              text="Hand-knit beds and blankets that soften any corner of the home."
            />
            <CategoryCard
              href="/products"
              img={IMG.collar}
              overline="Wear"
              title="Personal, down to the stitch."
              text="Collars and bandanas, embroidered with the name that matters."
            />
            <CategoryCard
              href="/products"
              img={IMG.cat}
              overline="Play"
              title="Designed for curiosity."
              text="Scratchers and toys in natural materials, made for the cats you love."
            />
          </div>
        </div>
      </section>

      {/* ============ 4. 联名 / 限定区 ============ */}
      <section className="relative">
        <div className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-bone">
          <Image src={IMG.collab} alt="Limited collaboration" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="container-content absolute inset-0 flex flex-col items-center justify-center text-center text-white">
            <span className="eyebrow !text-white/70">Limited Edition</span>
            <h2 className="h-section mt-5 max-w-3xl">Immersed in JOY. The Atelier x Paw &amp; Craft is here.</h2>
            <Link href="/products" className="btn-light mt-9">Explore the Collaboration</Link>
          </div>
        </div>
      </section>

      {/* ============ 5. 双产品横幅（Accessories / Beds）============ */}
      <section className="section">
        <div className="container-content grid gap-6 md:grid-cols-2">
          {[accessories[0] ?? hero[0], beds[0] ?? hero[1]].map((p, i) => (
            <Link key={p?.id ?? i} href={p ? `/products/${p.slug}` : "/products"} className="group">
              <div className="relative aspect-[5/4] overflow-hidden bg-sand">
                {p?.images[0] && <Image src={p.images[0]} alt={p.title} fill className="img-zoom object-cover" />}
              </div>
              <div className="mt-6">
                <span className="eyebrow">{i === 0 ? "Accessories" : "Beds & Blankets"}</span>
                <h3 className="h-section mt-4">
                  {i === 0 ? "Functional meets modern design." : "Softness, made to be lived in."}
                </h3>
                <span className="btn-link mt-5">Shop Now</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ 6. 用户评价 ============ */}
      <section className="section-sm bg-ink text-white">
        <div className="container-content text-center">
          <span className="eyebrow !text-white/50">Don't Just Take Our Word For It</span>
          <div className="mx-auto mt-14 max-w-3xl">
            <p className="font-serif text-2xl font-light leading-snug md:text-4xl">
              “The best decision, second to adopting my puppy, was choosing Paw &amp; Craft for everything he needs.
              The quality and the craftsmanship are simply outstanding.”
            </p>
            <div className="mt-8 text-[11px] uppercase tracking-widest text-white/50">Jeffrey C. · Verified Buyer</div>
          </div>
          <div className="mt-12 flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/25"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 7. 媒体背书 ============ */}
      <section className="section-sm">
        <div className="container-content text-center">
          <span className="eyebrow">In the Press</span>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
            {PRESS.map((p) => (
              <span key={p} className="font-serif text-2xl text-ink/60 md:text-3xl">{p}</span>
            ))}
          </div>
          <p className="body-sm mx-auto mt-12 max-w-2xl">
            “Paw &amp; Craft is quietly rewriting what handmade pet goods can look like — considered, modern, and
            built to last a lifetime.”
          </p>
        </div>
      </section>

      {/* ============ 8. 品牌理念 / 订阅式区块 ============ */}
      <section className="section-sm bg-sand">
        <div className="container-content grid items-center gap-12 md:grid-cols-2 md:gap-20">
          <div className="relative aspect-[5/4] overflow-hidden bg-bone">
            <Image src={IMG.workshop} alt="Our workshop" fill className="object-cover" />
          </div>
          <div>
            <span className="eyebrow">Made With Intention</span>
            <h2 className="h-section mt-5">Your pet's mind, body, and spirit.</h2>
            <p className="body-lg mt-6">
              Every piece begins in our small workshop — from choosing natural materials to the final hand-stitch.
              We make in tiny batches, so nothing is rushed and everything lasts.
            </p>
            <ul className="mt-8 space-y-4">
              {["Natural, responsibly sourced materials", "Personalized & made to order", "Every order gives back to shelters"].map((t) => (
                <li key={t} className="flex items-center gap-4 text-sm text-ink/85">
                  <span className="h-px w-8 bg-ink/30" />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/about" className="btn-outline mt-10">Learn More</Link>
          </div>
        </div>
      </section>

      {/* ============ 9. 手工系列横滑 ============ */}
      <section className="section">
        <div className="container-content">
          <div className="mb-14 flex items-end justify-between">
            <div>
              <span className="eyebrow">New This Season</span>
              <h2 className="h-section mt-5">Handmade, just added.</h2>
            </div>
            <Link href="/products" className="btn-link shrink-0">View All</Link>
          </div>
          <div className="no-scrollbar -mx-6 flex gap-6 overflow-x-auto px-6 md:mx-0 md:px-0">
            {(products.length ? products : hero).map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="card-lift group w-[240px] shrink-0 sm:w-[280px]">
                <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                  {p.images[0] && (
                    <Image src={p.images[0]} alt={p.title} fill sizes="280px" className="img-zoom object-cover" />
                  )}
                  <span className="card-overlay" />
                </div>
                <h3 className="h-card mt-4">{p.title}</h3>
                <span className="mt-1 block text-sm text-ink/70">{formatPrice(p.price, p.currency)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 10. FAQ ============ */}
      <section className="section-sm border-t border-ink/10">
        <div className="container-content grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
          <div className="md:sticky md:top-28 md:self-start">
            <span className="eyebrow">Good to Know</span>
            <h2 className="h-section mt-5">Questions, answered.</h2>
            <p className="body-sm mt-6 max-w-sm">
              Everything you might want to know before ordering — making times, personalisation, shipping and care.
              Still curious? Write to us at hello@pawandcraft.com.
            </p>
          </div>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function CategoryCard({
  href,
  img,
  overline,
  title,
  text
}: {
  href: string;
  img: string;
  overline: string;
  title: string;
  text: string;
}) {
  return (
    <Link href={href} className="group relative block overflow-hidden bg-bone">
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image src={img} alt={title} fill className="img-zoom object-cover" />
        <div className="absolute inset-0 bg-black/25" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
        <span className="eyebrow !text-white/70">{overline}</span>
        <h3 className="mt-4 font-serif text-2xl font-light md:text-3xl">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-white/75">{text}</p>
      </div>
    </Link>
  );
}
