import { prisma } from "@/lib/prisma";

export const PERMISSIONS = {
  CAN_MANAGE_TEAM: "CAN_MANAGE_TEAM",
  CAN_MANAGE_ROLES: "CAN_MANAGE_ROLES",
  CAN_CREATE_CLIENT: "CAN_CREATE_CLIENT",
  CAN_CREATE_PRODUCT: "CAN_CREATE_PRODUCT",
  CAN_CREATE_QUOTATION: "CAN_CREATE_QUOTATION",
  CAN_MANAGE_INVOICES: "CAN_MANAGE_INVOICES",
  CAN_VIEW_FINANCES: "CAN_VIEW_FINANCES",
  CAN_MANAGE_SETTINGS: "CAN_MANAGE_SETTINGS",
  CAN_VIEW_LEADS: "CAN_VIEW_LEADS",
  CAN_VIEW_SERVICE: "CAN_VIEW_SERVICE",
} as const;

export type PermissionCode = keyof typeof PERMISSIONS;

export interface PermissionDefinition {
  code: PermissionCode;
  label: string;
  category: "TEAM" | "SALES" | "FINANCE" | "OPERATIONS" | "SETTINGS";
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  {
    code: "CAN_MANAGE_TEAM",
    label: "Manage Team & Staff",
    category: "TEAM",
    description: "Add, edit, activate/deactivate staff accounts and reset passwords.",
  },
  {
    code: "CAN_MANAGE_ROLES",
    label: "Manage Roles & Permissions",
    category: "SETTINGS",
    description: "Create custom roles and customize granular permissions.",
  },
  {
    code: "CAN_CREATE_CLIENT",
    label: "Create & Edit Clients",
    category: "SALES",
    description: "Add new corporate or individual client accounts and update GSTIN details.",
  },
  {
    code: "CAN_CREATE_PRODUCT",
    label: "Create Products & Inventory",
    category: "OPERATIONS",
    description: "Add RFID hardware items, tags, antennas, and custom software/AMC services.",
  },
  {
    code: "CAN_CREATE_QUOTATION",
    label: "Generate Quotations",
    category: "SALES",
    description: "Create sales quotations with automatic Haryana and Interstate GST calculation.",
  },
  {
    code: "CAN_MANAGE_INVOICES",
    label: "Manage Invoices & Payments",
    category: "FINANCE",
    description: "Issue tax invoices, record customer payments, and track balances due.",
  },
  {
    code: "CAN_VIEW_FINANCES",
    label: "View Turnover & P&L",
    category: "FINANCE",
    description: "Access executive financial dashboard, collection metrics, and CA GST return exports.",
  },
  {
    code: "CAN_MANAGE_SETTINGS",
    label: "Manage Company Settings",
    category: "SETTINGS",
    description: "Edit company legal profile, registered address, GSTIN, and Dynamic UPI ID.",
  },
  {
    code: "CAN_VIEW_LEADS",
    label: "View Website Leads",
    category: "SALES",
    description: "View inbound website demo requests, RFPs, and contact enquiries.",
  },
  {
    code: "CAN_VIEW_SERVICE",
    label: "View & Manage Service RMA",
    category: "OPERATIONS",
    description: "View and update hardware complaint tickets, warranty audits, and RMA dispatch.",
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  SUPER_ADMIN: [
    "CAN_MANAGE_TEAM",
    "CAN_MANAGE_ROLES",
    "CAN_CREATE_CLIENT",
    "CAN_CREATE_PRODUCT",
    "CAN_CREATE_QUOTATION",
    "CAN_MANAGE_INVOICES",
    "CAN_VIEW_FINANCES",
    "CAN_MANAGE_SETTINGS",
    "CAN_VIEW_LEADS",
    "CAN_VIEW_SERVICE",
  ],
  SALES: [
    "CAN_CREATE_CLIENT",
    "CAN_CREATE_QUOTATION",
    "CAN_VIEW_LEADS",
    "CAN_CREATE_PRODUCT",
  ],
  ACCOUNTS: [
    "CAN_MANAGE_INVOICES",
    "CAN_VIEW_FINANCES",
    "CAN_CREATE_CLIENT",
    "CAN_CREATE_QUOTATION",
  ],
  SERVICE: [
    "CAN_VIEW_SERVICE",
    "CAN_CREATE_PRODUCT",
  ],
};

const DEFAULT_ROLE_META: Record<string, { displayName: string; description: string }> = {
  SUPER_ADMIN: {
    displayName: "👑 Super Admin",
    description: "Full unrestricted platform access, financial turnover, and company settings.",
  },
  SALES: {
    displayName: "💼 Sales Executive",
    description: "Client acquisition, quotations generation, and website lead follow-ups.",
  },
  ACCOUNTS: {
    displayName: "🧾 Accounts Officer",
    description: "Tax invoicing, payment collections, ledger management, and CA GST exports.",
  },
  SERVICE: {
    displayName: "🛠️ Service Engineer",
    description: "On-site RFID reader installations, RMA repairs, and hardware maintenance.",
  },
};

/**
 * Ensures system default roles exist in the database with their base permissions.
 */
export async function ensureDefaultRoles() {
  for (const [roleName, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const meta = DEFAULT_ROLE_META[roleName] || {
      displayName: roleName,
      description: "Default role",
    };

    const existing = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!existing) {
      await prisma.role.create({
        data: {
          name: roleName,
          displayName: meta.displayName,
          description: meta.description,
          permissions: JSON.stringify(permissions),
          isSystem: true,
        },
      });
    }
  }
}

/**
 * Returns granted permission strings for a given role name.
 */
export async function getPermissionsForRole(roleName: string): Promise<PermissionCode[]> {
  if (roleName === "SUPER_ADMIN") {
    return Object.keys(PERMISSIONS) as PermissionCode[];
  }

  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    return DEFAULT_ROLE_PERMISSIONS[roleName] || [];
  }

  try {
    return JSON.parse(role.permissions) as PermissionCode[];
  } catch {
    return [];
  }
}

/**
 * Verifies if a role has a specific permission.
 */
export async function hasPermission(
  roleName: string,
  permission: PermissionCode
): Promise<boolean> {
  if (roleName === "SUPER_ADMIN") return true;
  const permissions = await getPermissionsForRole(roleName);
  return permissions.includes(permission);
}
