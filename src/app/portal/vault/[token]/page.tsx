import { VaultSharePortalView } from "@/components/portal/VaultSharePortalView";

export const dynamic = "force-dynamic";

export default async function VaultSharePortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <VaultSharePortalView token={token} />;
}
