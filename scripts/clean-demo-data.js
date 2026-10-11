const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 =========================================================");
  console.log("🧹  GARVIX ERP - Safe Demo Data Cleanup Utility");
  console.log("🧹 =========================================================");

  // 1. Count records before deletion
  const invoiceCount = await prisma.invoice.count();
  const quoteCount = await prisma.quotation.count();
  const challanCount = await prisma.deliveryChallan.count();
  const customerCount = await prisma.customer.count();
  const productCount = await prisma.product.count();
  const leadCount = await prisma.lead.count();
  const expenseCount = await prisma.expense.count();
  const purchaseCount = await prisma.purchase.count();
  const ticketCount = await prisma.serviceTicket.count();
  const amcCount = await prisma.aMCContract.count();
  const userCount = await prisma.user.count();

  console.log(`📊 Found records before cleanup:`);
  console.log(`   - Invoices: ${invoiceCount}`);
  console.log(`   - Quotations: ${quoteCount}`);
  console.log(`   - Delivery Challans: ${challanCount}`);
  console.log(`   - Customers / Clients: ${customerCount}`);
  console.log(`   - Products / Inventory: ${productCount}`);
  console.log(`   - Leads: ${leadCount}`);
  console.log(`   - Expenses: ${expenseCount}`);
  console.log(`   - Purchases: ${purchaseCount}`);
  console.log(`   - Service Tickets: ${ticketCount}`);
  console.log(`   - AMC Contracts: ${amcCount}`);
  console.log(`   - Total Users: ${userCount}`);
  console.log("\n⏳ Cleaning demo operational records...");

  // 2. Clean operational & transactional tables in relational order
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.serialNumber.deleteMany();
  await prisma.deliveryChallan.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.serviceTicket.deleteMany();
  await prisma.aMCContract.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.telegramSession.deleteMany();

  // 3. Ensure primary Super Admin user is preserved
  const superAdmins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
  });

  if (superAdmins.length === 0) {
    console.log("⚠️ No SUPER_ADMIN found, creating default admin user...");
    const passwordHash = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@garvix.in",
        passwordHash: passwordHash,
        name: "Vishnu Baldwa",
        role: "SUPER_ADMIN",
        phone: "+91 98765 43210",
        telegramChatId: "8543269562",
      },
    });
  } else {
    // Delete non-superadmin demo accounts (e.g. demo sales, accounts, service)
    await prisma.user.deleteMany({
      where: {
        role: { not: "SUPER_ADMIN" },
      },
    });
  }

  // 4. Ensure Company Settings exist
  const existingSettings = await prisma.companySetting.findUnique({
    where: { id: "default" },
  });
  if (!existingSettings) {
    await prisma.companySetting.create({
      data: {
        id: "default",
        name: "GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED",
        tagline: "Software That Thinks. RFID That Connects. Automation That Works.",
        state: "Haryana",
        stateCode: "06",
        gstin: "06AAACG1234F1Z5",
        email: "contact@garvix.in",
        phone: "+91 98765 43210",
        address: "Cyber Hub, Sector 24, Gurugram, Haryana - 122002",
        upiId: "garvix@upi",
        upiName: "GARVIX SOFTWARE SOLUTIONS",
      },
    });
  }

  const remainingUsers = await prisma.user.findMany({
    select: { email: true, username: true, role: true },
  });

  console.log("\n✅ All demo transactional & operational data successfully cleaned!");
  console.log(`✅ Preserved Active Admin User(s):`, remainingUsers.map(u => `${u.username} (${u.email})`).join(", "));
  console.log("✅ Company Settings & Roles structure preserved.");
  console.log("✅ Database is now clean, fresh and production ready!\n");
}

main()
  .catch((e) => {
    console.error("❌ Demo data cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
