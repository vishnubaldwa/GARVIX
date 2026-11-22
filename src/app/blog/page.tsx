import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { buildBreadcrumbSchema, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Guides & Insights | Retail POS, Restaurant Software, ERP & RFID India",
  description:
    "Practical guides for Indian businesses on Jewellery UHF RFID stock audits, Retail GST POS billing, Café QR table self-ordering & KDS, industrial RFID tags, and Custom Business ERP + Mobile Apps.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "GARVIX Guides & Insights — RFID, Retail POS, Restaurant OS & Business ERP",
    description:
      "In-depth Indian B2B technology guides from GARVIX Software Solutions Private Limited.",
    url: `${SITE_URL}/blog`,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1280, height: 720, alt: "GARVIX Guides & Blog" }],
  },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] selection:bg-[#0071e3] selection:text-white antialiased">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides & Insights", path: "/blog" },
        ])}
      />
      <Navbar />

      <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 bg-[#fbfbfd] border-b border-black/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0071e3]">
              <BookOpen className="h-3.5 w-3.5" />
              <span>GARVIX Knowledge Hub</span>
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f]">
              Guides &amp; <span className="text-[#0071e3]">Insights.</span>
            </h1>
            <p className="mt-3.5 text-sm sm:text-base text-[#6e6e73] leading-relaxed">
              Practical playbooks on UHF RFID automation, GST Retail POS, Caf&eacute; QR Ordering &amp; KDS, and Custom Business ERP engineered for Indian businesses.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-3xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-[16/10] bg-[#f5f5f7] overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.coverAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[#0071e3]">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#86868b]">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-[#1d1d1f] tracking-tight leading-snug group-hover:text-[#0071e3] transition">
                    {post.title}
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed line-clamp-3 flex-1">
                    {post.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 text-[#86868b] font-medium">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#0071e3]">
                      Read Guide
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
