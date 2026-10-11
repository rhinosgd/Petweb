import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getPostBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post || !post.published) notFound();

  return (
    <>
      <SiteHeader />
      <article className="container-narrow py-20 md:py-28">
        <div className="text-center">
          <span className="eyebrow">Journal</span>
          <h1 className="h-section mx-auto mt-6 max-w-2xl">{post.title}</h1>
          <div className="mt-6 text-[11px] uppercase tracking-widest text-ink/65">
            {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {post.cover && (
          <div className="relative mt-14 aspect-[16/10] overflow-hidden bg-sand">
            <Image src={post.cover} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        <div className="mx-auto mt-14 max-w-2xl space-y-6 text-lg leading-relaxed text-ink/75">
          {post.content.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl border-t border-ink/10 pt-10 text-center">
          <Link href="/blog" className="btn-link">← Back to the Journal</Link>
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
