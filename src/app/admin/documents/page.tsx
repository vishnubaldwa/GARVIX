import { getSession } from "@/lib/auth";
import { isFullAdminRole } from "@/lib/permissions";
import { getVaultAccessContext } from "@/lib/vault";
import { redirect } from "next/navigation";
import { DocumentVaultView } from "@/components/admin/DocumentVaultView";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsVaultPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const access = await getVaultAccessContext(session);
  if (!access.canView) {
    redirect("/admin");
  }

  return <DocumentVaultView isSuperAdmin={isFullAdminRole(session.role)} />;
}
