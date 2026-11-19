import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPermissionsForRole, isFullAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = await getPermissionsForRole(session.role);

  return NextResponse.json({
    user: {
      id: session.userId,
      username: session.username,
      email: session.email,
      name: session.name,
      role: session.role,
      isFullAdmin: isFullAdminRole(session.role),
      permissions,
    },
  });
}
