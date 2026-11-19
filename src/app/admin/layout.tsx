import { getSession } from "@/lib/auth";
import { getPermissionsForRole, PermissionCode } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const permissions: PermissionCode[] = session
    ? await getPermissionsForRole(session.role)
    : [];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col md:flex-row antialiased">
      <AdminSidebar session={session} permissions={permissions} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader session={session} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f5f5f7]">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
