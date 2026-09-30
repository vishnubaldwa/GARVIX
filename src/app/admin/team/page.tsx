import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EmployeeListView } from "@/components/admin/EmployeeListView";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const rawEmployees = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      telegramChatId: true,
      isActive: true,
      createdAt: true,
    },
  });

  const employees = rawEmployees.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <EmployeeListView initialEmployees={employees} />
    </div>
  );
}
