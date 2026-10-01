import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureDefaultRoles, hasPermission } from "@/lib/permissions";
import { RolesManagementView } from "@/components/admin/RolesManagementView";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const canManageRoles = await hasPermission(session.role, "CAN_MANAGE_ROLES");
  if (!canManageRoles) {
    redirect("/admin");
  }

  await ensureDefaultRoles();

  const rawRoles = await prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });

  const roles = rawRoles.map((r) => ({
    id: r.id,
    name: r.name,
    displayName: r.displayName,
    description: r.description,
    permissions: JSON.parse(r.permissions || "[]"),
    isSystem: r.isSystem,
  }));

  return (
    <div className="space-y-6">
      <RolesManagementView initialRoles={roles} />
    </div>
  );
}
