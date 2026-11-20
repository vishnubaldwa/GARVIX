import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import { WebsiteClientsManager } from "@/components/admin/WebsiteClientsManager";

export const dynamic = "force-dynamic";

export default async function AdminWebsiteClientsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const isSuperAdmin = isFullAdminRole(session.role);
  const allowed =
    isSuperAdmin ||
    (await hasPermission(session.role, "CAN_MANAGE_SETTINGS")) ||
    (await hasPermission(session.role, "CAN_CREATE_CLIENT"));

  if (!allowed) redirect("/admin");

  const rawClients = await prisma.websiteClient.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  const clients = rawClients.map((c) => ({
    id: c.id,
    name: c.name,
    industry: c.industry,
    websiteUrl: c.websiteUrl,
    hasLogo: Boolean(c.logoFile),
    logoUrl: c.logoFile
      ? `/api/public/client-logo/${c.id}?v=${c.updatedAt.getTime()}`
      : null,
    displayOrder: c.displayOrder,
    isVisible: c.isVisible,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Website Clients Showcase
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control which client logos &amp; brand names appear in the &ldquo;Our Clients&rdquo; section on the public garvix.in homepage.
          </p>
        </div>

        <Link
          href="/#our-clients"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition self-start sm:self-auto"
        >
          <span>View Live on garvix.in</span>
          <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
        </Link>
      </div>

      <WebsiteClientsManager initialClients={clients} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
