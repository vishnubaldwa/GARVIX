import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/api/portal/"],
      },
    ],
    sitemap: "https://garvix.in/sitemap.xml",
  };
}
