import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission, isFullAdminRole } from "@/lib/permissions";
import { getComplianceCalendar } from "@/lib/compliance-engine";
import { ImportantDatesManager } from "@/components/admin/ImportantDatesManager";

export const dynamic = "force-dynamic";

export default async function AdminImportantDatesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const isSuperAdmin = isFullAdminRole(session.role);
  const allowed =
    isSuperAdmin ||
    (await hasPermission(session.role, "CAN_VIEW_FINANCES")) ||
    (await hasPermission(session.role, "CAN_MANAGE_SETTINGS"));

  if (!allowed) redirect("/admin");

  const calendar = await getComplianceCalendar();

  return (
    <ImportantDatesManager initialData={calendar} isSuperAdmin={isSuperAdmin} />
  );
}
