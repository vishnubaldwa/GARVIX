import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If no session, we don't block here because /admin/login is under /admin,
  // but we pass session to AdminSidebar/AdminHeader which handles login view vs authenticated dashboard view.
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col md:flex-row">
      <AdminSidebar session={session} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader session={session} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#090d17]/50">
          {children}
        </main>
      </div>
    </div>
  );
}
