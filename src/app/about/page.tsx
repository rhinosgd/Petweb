import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

const IMG = {
  hero: "https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=2400",
  s1: "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=1400",
  s2: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1400",
  s3: "https://images.unsplash.com/photo-1494947665470-20322015e3a8?w=1400"
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <SiteHeader />

      {/* 页头大图 */}
      <section className="relative h-[70vh] min-h-[460px] w-full overflow-hidden bg-bone">
        <Image src={IMG.hero} alt="Our workshop" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="container-content absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <span className="eyebrow !text-white/70">Our Story</span>
          <h1 className="h-hero mt-6 max-w-3xl">Made slowly, kept for years.</h1>
        </div>
      </section>

      {/* 理念 */}
      <section className="container-narrow section text-center">
        <p className="font-serif text-2xl font-light leading-relaxed text-ink/85 md:text-3xl">
          {settings["about.story"]}
        </p>
      </section>

      {/* 三栏价值 */}
      <section className="border-y border-ink/10 bg-sand">
        <div className="container-content grid gap-10 py-20 md:grid-cols-3 md:gap-16">
          {[
            { t: "Handmade", d: "Every piece is cut, stitched and finished by hand — never mass produced." },
            { t: "Personal", d: "Add a name, a colour, a detail. Made to order, and made yours." },
            { t: "Give Back", d: "With every order, we donate a meal to an animal shelter." }
          ].map((c, i) => (
            <div key={c.t}>
              <div className="eyebrow">0{i + 1}</div>
              <h2 className="h-card mt-5">{c.t}</h2>
              <p className="body-sm mt-3">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 制作过程 */}
      <section className="section">
        <div className="container-content">
          <div className="mb-16 text-center">
            <span className="eyebrow">How It's Made</span>
            <h2 className="h-section mx-auto mt-5 max-w-2xl">From raw material to finished piece.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              { img: IMG.s1, n: "01", t: "Sourcing", d: "We choose natural, responsibly sourced materials — leather, cotton, wool and wood." },
              { img: IMG.s2, n: "02", t: "Making", d: "Each piece is cut and assembled by hand in our workshop, one at a time." },
              { img: IMG.s3, n: "03", t: "Finishing", d: "Personalized, inspected and wrapped by hand before it's sent to you." }
            ].map((s) => (
              <div key={s.n} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                  <Image src={s.img} alt={s.t} fill className="img-zoom object-cover" />
                </div>
                <div className="eyebrow mt-6">{s.n}</div>
                <h3 className="h-card mt-3">{s.t}</h3>
                <p className="body-sm mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-white">
        <div className="container-content section-sm text-center">
          <h2 className="h-section mx-auto max-w-2xl">Ready to find something made just for them?</h2>
          <Link href="/products" className="btn-light mt-10">Shop the Collection</Link>
        </div>
      </section>

      <SiteFooter copyright={settings["footer.copyright"]} />
    </>
  );
}
