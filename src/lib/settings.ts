import { prisma } from "@/lib/prisma";

export interface CompanySettingsData {
  name: string;
  tagline: string;
  state: string;
  stateCode: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  upiId: string;
  upiName: string;
  bankName?: string | null;
  accountNo?: string | null;
  ifscCode?: string | null;
}

export async function getCompanySettings(): Promise<CompanySettingsData> {
  try {
    let settings = await prisma.companySetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      const defaultData = {
        name: process.env.NEXT_PUBLIC_COMPANY_NAME || "GARVIX TECHNOLOGIES",
        tagline: process.env.NEXT_PUBLIC_COMPANY_TAGLINE || "Next-Gen RFID Ecosystems & Bespoke Software",
        state: process.env.NEXT_PUBLIC_COMPANY_STATE || "Haryana",
        stateCode: process.env.NEXT_PUBLIC_COMPANY_STATE_CODE || "06",
        gstin: process.env.NEXT_PUBLIC_COMPANY_GSTIN || "06AAACG1234F1Z5",
        email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "contact@garvix.in",
        phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+91 98765 43210",
        address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Cyber Hub, Sector 24, Gurugram, Haryana - 122002",
        upiId: process.env.NEXT_PUBLIC_UPI_ID || "garvix@upi",
        upiName: process.env.NEXT_PUBLIC_UPI_NAME || "GARVIX TECHNOLOGIES",
      };

      try {
        settings = await prisma.companySetting.upsert({
          where: { id: "default" },
          update: {},
          create: {
            id: "default",
            ...defaultData,
          },
        });
      } catch {
        settings = await prisma.companySetting.findUnique({
          where: { id: "default" },
        });
      }
    }

    if (!settings) {
      return {
        name: process.env.NEXT_PUBLIC_COMPANY_NAME || "GARVIX TECHNOLOGIES",
        tagline: process.env.NEXT_PUBLIC_COMPANY_TAGLINE || "Next-Gen RFID Ecosystems & Bespoke Software",
        state: process.env.NEXT_PUBLIC_COMPANY_STATE || "Haryana",
        stateCode: process.env.NEXT_PUBLIC_COMPANY_STATE_CODE || "06",
        gstin: process.env.NEXT_PUBLIC_COMPANY_GSTIN || "06AAACG1234F1Z5",
        email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "contact@garvix.in",
        phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+91 98765 43210",
        address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Cyber Hub, Sector 24, Gurugram, Haryana - 122002",
        upiId: process.env.NEXT_PUBLIC_UPI_ID || "garvix@upi",
        upiName: process.env.NEXT_PUBLIC_UPI_NAME || "GARVIX TECHNOLOGIES",
      };
    }

    return {
      name: settings.name,
      tagline: settings.tagline,
      state: settings.state,
      stateCode: settings.stateCode,
      gstin: settings.gstin,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      upiId: settings.upiId,
      upiName: settings.upiName,
      bankName: settings.bankName,
      accountNo: settings.accountNo,
      ifscCode: settings.ifscCode,
    };
  } catch (err) {
    console.error("Failed to read CompanySettings from DB, falling back to env:", err);
    return {
      name: process.env.NEXT_PUBLIC_COMPANY_NAME || "GARVIX TECHNOLOGIES",
      tagline: process.env.NEXT_PUBLIC_COMPANY_TAGLINE || "Next-Gen RFID Ecosystems & Bespoke Software",
      state: process.env.NEXT_PUBLIC_COMPANY_STATE || "Haryana",
      stateCode: process.env.NEXT_PUBLIC_COMPANY_STATE_CODE || "06",
      gstin: process.env.NEXT_PUBLIC_COMPANY_GSTIN || "06AAACG1234F1Z5",
      email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "contact@garvix.in",
      phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+91 98765 43210",
      address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Cyber Hub, Sector 24, Gurugram, Haryana - 122002",
      upiId: process.env.NEXT_PUBLIC_UPI_ID || "garvix@upi",
      upiName: process.env.NEXT_PUBLIC_UPI_NAME || "GARVIX TECHNOLOGIES",
    };
  }
}

export async function updateCompanySettings(
  data: Partial<CompanySettingsData>
): Promise<CompanySettingsData> {
  const updated = await prisma.companySetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      name: data.name || "GARVIX TECHNOLOGIES",
      tagline: data.tagline || "Next-Gen RFID Ecosystems & Bespoke Software",
      state: data.state || "Haryana",
      stateCode: data.stateCode || "06",
      gstin: data.gstin || "06AAACG1234F1Z5",
      email: data.email || "contact@garvix.in",
      phone: data.phone || "+91 98765 43210",
      address: data.address || "Cyber Hub, Sector 24, Gurugram, Haryana - 122002",
      upiId: data.upiId || "garvix@upi",
      upiName: data.upiName || "GARVIX TECHNOLOGIES",
      bankName: data.bankName,
      accountNo: data.accountNo,
      ifscCode: data.ifscCode,
    },
    update: {
      ...data,
    },
  });

  return {
    name: updated.name,
    tagline: updated.tagline,
    state: updated.state,
    stateCode: updated.stateCode,
    gstin: updated.gstin,
    email: updated.email,
    phone: updated.phone,
    address: updated.address,
    upiId: updated.upiId,
    upiName: updated.upiName,
    bankName: updated.bankName,
    accountNo: updated.accountNo,
    ifscCode: updated.ifscCode,
  };
}
