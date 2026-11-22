import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { BLOG_POSTS, getBlogPostBySlug } from "@/lib/blog-posts";
import { buildBreadcrumbSchema, COMPANY_LEGAL_NAME, SITE_URL } from "@/lib/seo";
import { getCompanySettings } from "@/lib/settings";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Clock } from "lucide-react";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.seoTitle,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: `${post.publishedAt}T09:00:00+05:30`,
      authors: [COMPANY_LEGAL_NAME],
      images: [
        {
          url: `${SITE_URL}${post.coverImage}`,
          width: 1280,
          height: 720,
          alt: post.coverAlt,
        },
      ],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const company = await getCompanySettings();
  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: [`${SITE_URL}${post.coverImage}`],
    datePublished: `${post.publishedAt}T09:00:00+05:30`,
    dateModified: `${post.publishedAt}T09:00:00+05:30`,
    author: {
      "@type": "Organization",
      name: COMPANY_LEGAL_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] selection:bg-[#0071e3] selection:text-white antialiased">
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides & Insights", path: "/blog" },
            { name: post.category, path: `/blog/${post.slug}` },
          ]),
          articleSchema,
        ]}
      />
      <Navbar />

      <article className="pt-8 pb-16 sm:pt-12 sm:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Guides</span>
          </Link>

          <header className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="rounded-full bg-blue-50 border border-blue-200/80 px-3 py-0.5 text-[#0071e3]">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[#86868b] font-medium">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-1 text-[#86868b] font-medium">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] leading-[1.15]">
              {post.title}
            </h1>

            <p className="text-sm sm:text-lg text-[#6e6e73] leading-relaxed">
              {post.description}
            </p>
          </header>

          {/* Cover Image */}
          <div className="mt-8 rounded-3xl overflow-hidden border border-black/[0.06] bg-[#f5f5f7] shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <img
              src={post.coverImage}
              alt={post.coverAlt}
              className="w-full h-auto max-h-[440px] object-cover block"
            />
          </div>

          {/* Key Takeaways Box */}
          <div className="mt-8 rounded-3xl border border-blue-200/70 bg-blue-50/40 p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0071e3]">
              Key Takeaways
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#1d1d1f]">
              {post.keyTakeaways.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#0071e3] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Article Body Sections */}
          <div className="mt-10 space-y-9">
            {post.sections.map((section) => (
              <section key={section.heading} className="space-y-3.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f]">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p) => (
                  <p
                    key={p.slice(0, 40)}
                    className="text-sm sm:text-base text-[#424245] leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="space-y-2 pt-1 pl-1">
                    {section.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-sm sm:text-base text-[#1d1d1f]"
                      >
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#0071e3] shrink-0" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Product CTA Banner */}
          <div className="mt-12 rounded-3xl bg-[#1d1d1f] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2997ff]">
                Built by GARVIX
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight">
                Want to see this live for your business?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[#a1a1a6]">
                Schedule a 15-minute live walkthrough with our engineering team.
              </p>
            </div>
            <Link
              href={post.relatedSolutionPath}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-5 py-3 text-xs font-semibold text-white shrink-0 transition"
            >
              <span>{post.relatedSolutionLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>

      {/* Related Guides */}
      <section className="py-14 bg-[#fbfbfd] border-y border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-[#1d1d1f] mb-6">
            More Guides from GARVIX
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {otherPosts.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="rounded-2xl border border-black/[0.06] bg-white p-5 hover:border-[#0071e3] transition space-y-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071e3]">
                  {rel.category}
                </span>
                <h3 className="text-sm font-bold text-[#1d1d1f] leading-snug">
                  {rel.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071e3] pt-1">
                  Read Guide <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Embedded Enquiry Form */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ContactForm
            defaultRequirement={post.defaultEnquiryRequirement}
            companyInfo={{
              phone: company.phone,
              email: company.email,
              state: company.state,
            }}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
