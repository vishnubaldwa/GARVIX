import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureDefaultRoles, hasPermission, isFullAdminRole } from "@/lib/permissions";
import { EmployeeListView } from "@/components/admin/EmployeeListView";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const canManageTeam =
    isFullAdminRole(session.role) ||
    (await hasPermission(session.role, "CAN_MANAGE_TEAM"));

  if (!canManageTeam) {
    redirect("/admin");
  }

  await ensureDefaultRoles();

  const [rawEmployees, rawRoles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.role.findMany({
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
      select: { name: true, displayName: true },
    }),
  ]);

  const employees = rawEmployees.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <EmployeeListView
        initialEmployees={employees}
        initialRoles={rawRoles}
        currentUserEmail={session.email}
      />
    </div>
  );
}
