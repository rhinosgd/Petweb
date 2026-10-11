import Link from "next/link";
import Image from "next/image";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getPosts } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPosts();
  const [feature, ...rest] = posts;

  return (
    <>
      <SiteHeader />

      <section className="border-b border-ink/10">
        <div className="container-content py-20 text-center md:py-28">
          <span className="eyebrow">The Journal</span>
          <h1 className="h-section mx-auto mt-6 max-w-3xl">Stories from the workshop.</h1>
        </div>
      </section>

      {/* 主推文章 */}
      {feature && (
        <section className="container-content section-sm">
          <Link href={`/blog/${feature.slug}`} className="group grid gap-10 md:grid-cols-2 md:items-center">
            <div className="relative aspect-[5/4] overflow-hidden bg-sand">
              {feature.cover && (
                <Image src={feature.cover} alt={feature.title} fill className="img-zoom object-cover" />
              )}
            </div>
            <div>
              <span className="eyebrow">Featured</span>
              <h2 className="h-section mt-5">{feature.title}</h2>
              <p className="body-lg mt-5">{feature.excerpt}</p>
              <span className="btn-link mt-7">Read the Story</span>
            </div>
          </Link>
        </section>
      )}

      {/* 其余文章 */}
      <section className="container-content pb-24">
        <div className="grid gap-x-6 gap-y-14 md:grid-cols-3">
          {rest.map((p) => (
            <article key={p.id}>
              <Link href={`/blog/${p.slug}`} className="group block">
                {p.cover && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                    <Image src={p.cover} alt={p.title} fill className="img-zoom object-cover" />
                  </div>
                )}
                <h2 className="h-card mt-5 group-hover:text-clay">{p.title}</h2>
                <p className="body-sm mt-2">{p.excerpt}</p>
              </Link>
            </article>
          ))}
          {posts.length === 0 && <p className="text-ink/65">No stories yet.</p>}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
