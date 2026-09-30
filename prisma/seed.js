const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding GARVIX Database...");

  // Clean existing data
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
  await prisma.user.deleteMany();

  // 1. Users
  const passwordHash = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@garvix.in",
      passwordHash: passwordHash,
      name: "Vishnu Baldwa",
      role: "SUPER_ADMIN",
      phone: "9876543210",
      telegramChatId: "8543269562",
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      username: "sales",
      email: "sales@garvix.in",
      passwordHash: await bcrypt.hash("sales123", 10),
      name: "Rohan Sharma",
      role: "SALES",
      phone: "9812345678",
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      username: "accounts",
      email: "accounts@garvix.in",
      passwordHash: await bcrypt.hash("accounts123", 10),
      name: "Pooja Gupta",
      role: "ACCOUNTS",
      phone: "9823456789",
    },
  });

  const serviceUser = await prisma.user.create({
    data: {
      username: "service",
      email: "service@garvix.in",
      passwordHash: await bcrypt.hash("service123", 10),
      name: "Vikram Singh",
      role: "SERVICE",
      phone: "9834567890",
    },
  });

  console.log("Users created:", adminUser.email, salesUser.email, accountsUser.email, serviceUser.email);

  // 2. Customers
  const customerHaryana = await prisma.customer.create({
    data: {
      companyName: "Apex Retail Solutions Pvt Ltd",
      contactPerson: "Rajeev Singhania",
      email: "rajeev@apexretail.com",
      phone: "+91 98112 34567",
      gstin: "06AAACA1111A1Z1",
      state: "Haryana",
      stateCode: "06",
      billingAddress: "Plot 45, Udyog Vihar Phase 4, Gurugram, Haryana - 122016",
      shippingAddress: "Plot 45, Udyog Vihar Phase 4, Gurugram, Haryana - 122016",
      isB2B: true,
    },
  });

  const customerRajasthan = await prisma.customer.create({
    data: {
      companyName: "Royal Jewels & Diamond Co.",
      contactPerson: "Vikram Rathore",
      email: "vikram@royaljewels.in",
      phone: "+91 98290 88776",
      gstin: "08BBBCB2222B2Z2",
      state: "Rajasthan",
      stateCode: "08",
      billingAddress: "M.I. Road, Near Panch Batti, Jaipur, Rajasthan - 302001",
      shippingAddress: "Showroom 12, Johari Bazar, Jaipur, Rajasthan - 302003",
      isB2B: true,
    },
  });

  const customerDelhi = await prisma.customer.create({
    data: {
      companyName: "Modern Logistics & Warehousing Corp",
      contactPerson: "Deepak Mehra",
      email: "operations@modernlogistics.com",
      phone: "+91 99100 55443",
      gstin: "07CCCC3333C1Z3",
      state: "Delhi",
      stateCode: "07",
      billingAddress: "Kapashera Border, NH-8, New Delhi - 110037",
      shippingAddress: "Warehouse 4, Bijwasan, New Delhi - 110061",
      isB2B: true,
    },
  });

  // 3. Products
  const pReader = await prisma.product.create({
    data: {
      name: "Garvix GX-400 4-Port UHF Fixed RFID Reader",
      sku: "GX-RDR-400",
      category: "HARDWARE_READER",
      hsnCode: "8471",
      description: "High-performance Impinj E710 chip, 4 TNC antenna ports, Ethernet & RS232, 33dBm output power.",
      purchasePrice: 28000,
      sellingPrice: 42000,
      unit: "PCS",
      currentStock: 14,
      minStockAlert: 4,
    },
  });

  const pScanner = await prisma.product.create({
    data: {
      name: "Garvix GX-HH90 Android Handheld RFID Gun",
      sku: "GX-HH-90",
      category: "HARDWARE_READER",
      hsnCode: "8471",
      description: "5.5 inch Android 13 RFID terminal, read rate >900 tags/sec, 9000mAh battery, 2D barcode imager.",
      purchasePrice: 38000,
      sellingPrice: 58000,
      unit: "PCS",
      currentStock: 7,
      minStockAlert: 3,
    },
  });

  const pAntenna = await prisma.product.create({
    data: {
      name: "Garvix 9dBi Circular Polarized UHF Antenna",
      sku: "GX-ANT-9DBI",
      category: "HARDWARE_ANTENNA",
      hsnCode: "8523",
      description: "IP67 weatherproof RFID antenna, 865-868 MHz Indian frequency compliant.",
      purchasePrice: 4500,
      sellingPrice: 7500,
      unit: "PCS",
      currentStock: 25,
      minStockAlert: 6,
    },
  });

  const pJewelTags = await prisma.product.create({
    data: {
      name: "UHF Printable Jewellery RFID Tags (Roll of 1000)",
      sku: "TAG-UHF-JEWEL-1K",
      category: "HARDWARE_TAG",
      hsnCode: "8523",
      description: "Durable non-tearable polypropylene tail tags, Impinj Monza R6-P chip, tailored for jewellery items.",
      purchasePrice: 3200,
      sellingPrice: 5500,
      unit: "ROLL",
      currentStock: 20,
      minStockAlert: 5,
    },
  });

  const pSoftware = await prisma.product.create({
    data: {
      name: "Garvix Cloud RFID Warehouse & Stock Audit Suite",
      sku: "SFT-RFID-CORE",
      category: "SOFTWARE_SERVICE",
      hsnCode: "998314",
      description: "Enterprise multi-location web application, real-time reader middleware, discrepancy reports, ERP API bridge.",
      purchasePrice: 0,
      sellingPrice: 125000,
      unit: "YEAR",
      currentStock: 999,
      minStockAlert: 0,
    },
  });

  const pAMC = await prisma.product.create({
    data: {
      name: "Comprehensive Annual Maintenance & Hardware SLA",
      sku: "SVC-AMC-ANNUAL",
      category: "AMC_SUPPORT",
      hsnCode: "998315",
      description: "24/7 Remote software support, quarterly preventive hardware visits, firmware updates.",
      purchasePrice: 0,
      sellingPrice: 45000,
      unit: "YEAR",
      currentStock: 999,
      minStockAlert: 0,
    },
  });

  // 4. Serial Numbers
  await prisma.serialNumber.createMany({
    data: [
      { productId: pReader.id, serialNumber: "GX400-26-00101", imei: "867123049102911", status: "IN_STOCK" },
      { productId: pReader.id, serialNumber: "GX400-26-00102", imei: "867123049102912", status: "IN_STOCK" },
      { productId: pReader.id, serialNumber: "GX400-26-00103", imei: "867123049102913", status: "IN_STOCK" },
      { productId: pScanner.id, serialNumber: "GXHH90-26-0881", imei: "354128092837190", status: "IN_STOCK" },
      { productId: pScanner.id, serialNumber: "GXHH90-26-0882", imei: "354128092837191", status: "IN_STOCK" },
    ],
  });

  // 5. Quotation
  const quote1 = await prisma.quotation.create({
    data: {
      quoteNumber: "GARVIX/QT/26-27/001",
      token: "qt-royal-jewels-token-2026",
      customerId: customerRajasthan.id,
      subtotal: 194000,
      taxType: "INTER_STATE",
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 34920,
      totalAmount: 228920,
      status: "SENT",
      terms: "1. 50% advance along with Purchase Order.\n2. Delivery within 7 business days.\n3. 1 Year comprehensive hardware warranty included.",
      notes: "Quotation prepared for 2 Showroom Jewellery RFID Stock Audit System.",
      items: {
        create: [
          {
            productId: pScanner.id,
            description: "Garvix GX-HH90 Handheld RFID Scanner (for trays scanning)",
            hsnCode: "8471",
            quantity: 2,
            unitPrice: 58000,
            taxRate: 18,
            taxAmount: 20880,
            totalAmount: 136880,
          },
          {
            productId: pJewelTags.id,
            description: "UHF Printable Jewellery RFID Tags (10 Rolls = 10,000 tags)",
            hsnCode: "8523",
            quantity: 10,
            unitPrice: 5000,
            taxRate: 18,
            taxAmount: 9000,
            totalAmount: 59000,
          },
          {
            productId: pAMC.id,
            description: "Software setup & On-site staff training",
            hsnCode: "998315",
            quantity: 1,
            unitPrice: 28000,
            taxRate: 18,
            taxAmount: 5040,
            totalAmount: 33040,
          },
        ],
      },
    },
  });

  // 6. Delivery Challan (Returnable Demo Kit)
  await prisma.deliveryChallan.create({
    data: {
      challanNumber: "GARVIX/DC/26-27/001",
      customerId: customerRajasthan.id,
      challanType: "RETURNABLE",
      reason: "DEMO_TESTING",
      transporterName: "BlueDart Express",
      vehicleNumber: "HR-26-BR-9912",
      status: "OPEN",
      notes: "Demo kit dispatched for trial run at M.I. Road Showroom.",
      items: {
        create: [
          {
            productId: pScanner.id,
            description: "Demo Handheld RFID Reader with demo tags",
            hsnCode: "8471",
            quantity: 1,
            serialNumbersList: "GXHH90-26-0881",
          },
        ],
      },
    },
  });

  // 7. Invoice (Haryana to Haryana: Intra-state CGST + SGST)
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "GARVIX/26-27/001",
      token: "inv-apex-token-2026",
      invoiceType: "TAX_INVOICE",
      customerId: customerHaryana.id,
      subtotal: 184500,
      taxType: "INTRA_STATE",
      cgstRate: 9,
      cgstAmount: 16605,
      sgstRate: 9,
      sgstAmount: 16605,
      igstRate: 0,
      igstAmount: 0,
      totalAmount: 217710,
      amountPaid: 100000,
      balanceDue: 117710,
      paymentStatus: "PARTIAL",
      upiQrString: "upi://pay?pa=garvix@upi&pn=GARVIX%20TECHNOLOGIES&am=117710&tr=INV2627001",
      ewayBillNo: "241829019283",
      transporterId: "06AAACT0001T1Z0",
      transporterName: "Delhivery Logistics Ltd",
      vehicleNo: "HR-55-AJ-1234",
      lrNo: "DEL-849204",
      lrDate: new Date(),
      terms: "1. Warranty covers manufacturing defects.\n2. Goods once sold will not be taken back without prior authorization.\n3. Subject to Gurugram Jurisdiction.",
      items: {
        create: [
          {
            productId: pReader.id,
            description: "Garvix GX-400 4-Port UHF Fixed RFID Reader",
            hsnCode: "8471",
            quantity: 2,
            unitPrice: 42000,
            taxRate: 18,
            taxAmount: 15120,
            totalAmount: 99120,
            serialNumbersList: "GX400-26-00101, GX400-26-00102",
          },
          {
            productId: pAntenna.id,
            description: "Garvix 9dBi Circular Polarized UHF Antenna",
            hsnCode: "8523",
            quantity: 4,
            unitPrice: 7500,
            taxRate: 18,
            taxAmount: 5400,
            totalAmount: 35400,
            serialNumbersList: "ANT-01, ANT-02, ANT-03, ANT-04",
          },
          {
            productId: pSoftware.id,
            description: "Garvix RFID Middleware & Portal License (Warehouse Portal)",
            hsnCode: "998314",
            quantity: 1,
            unitPrice: 70500,
            taxRate: 18,
            taxAmount: 12690,
            totalAmount: 83190,
          },
        ],
      },
    },
  });

  // Payment for invoice1
  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 100000,
      paymentMode: "NEFT_RTGS",
      referenceNumber: "HDFC8849201948",
      notes: "Advance 50% payment received against dispatch",
    },
  });

  // 8. Purchase (Vendor bill for hardware stock)
  await prisma.purchase.create({
    data: {
      billNumber: "SILICON/2026/092",
      vendorName: "Silicon RFID Components India Pvt Ltd",
      vendorGstin: "27AABCS1234S1Z9",
      vendorState: "Maharashtra",
      subtotal: 120000,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 21600,
      totalAmount: 141600,
      itcEligible: true,
      itcStatus: "CLAIMED",
      paymentStatus: "PAID",
      notes: "Batch import of UHF reader chipsets and antennas",
      items: {
        create: [
          {
            productId: pReader.id,
            description: "GX-400 Core Processing Modules",
            hsnCode: "8471",
            quantity: 3,
            unitPrice: 28000,
            taxRate: 18,
            taxAmount: 15120,
            totalAmount: 99120,
          },
          {
            productId: pAntenna.id,
            description: "9dBi Antenna Panels",
            hsnCode: "8523",
            quantity: 8,
            unitPrice: 4500,
            taxRate: 18,
            taxAmount: 6480,
            totalAmount: 42480,
          },
        ],
      },
    },
  });

  // 9. Expenses
  await prisma.expense.createMany({
    data: [
      {
        category: "CLOUD_SERVER",
        amount: 8500,
        description: "AWS Cloud & Vercel Enterprise Deployment for client portals",
        paymentMode: "UPI",
        isTaxDeductible: true,
      },
      {
        category: "TRAVEL",
        amount: 4200,
        description: "Client on-site site survey & antenna mapping visit to Jaipur",
        paymentMode: "UPI",
        isTaxDeductible: true,
      },
      {
        category: "HARDWARE_RND",
        amount: 12400,
        description: "Custom metallic mounting brackets & SMA cable testing tools",
        paymentMode: "NEFT_RTGS",
        isTaxDeductible: true,
      },
    ],
  });

  // 10. AMC Contract
  const amc1 = await prisma.aMCContract.create({
    data: {
      contractNumber: "GARVIX/AMC/26-27/001",
      customerId: customerHaryana.id,
      title: "Warehouse RFID System & Reader Maintenance (Year 1)",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      contractValue: 45000,
      visitFrequency: "QUARTERLY",
      status: "ACTIVE",
      notes: "Includes 4 quarterly health checks and 2 emergency visits.",
    },
  });

  // Service ticket
  await prisma.serviceTicket.create({
    data: {
      ticketNumber: "TCK-2026-001",
      customerId: customerHaryana.id,
      amcId: amc1.id,
      issueTitle: "Gate 2 Antenna signal attenuation check",
      description: "Client reported tags on pallet top layer occasionally reading with lower RSSI.",
      priority: "HIGH",
      status: "RESOLVED",
      assignedTo: "Eng. Suresh Kumar",
      resolutionNotes: "Re-aligned antenna bracket tilt angle by 12 degrees. RSSI stabilized at -52 dBm.",
      resolvedAt: new Date(),
    },
  });

  // 11. Leads (Captured from website)
  await prisma.lead.createMany({
    data: [
      {
        name: "Vikram Rathore",
        company: "Royal Jewels & Diamond Co.",
        email: "vikram@royaljewels.in",
        phone: "+91 98290 88776",
        solution: "RFID_JEWELLERY",
        message: "Need RFID scanning trays and handheld readers for stock count in 2 stores.",
        status: "PROPOSAL_SENT",
        telegramNotified: true,
      },
      {
        name: "Arun Mehra",
        company: "Karnal Cold Chain Logistics",
        email: "arun@karnalcold.in",
        phone: "+91 98960 12345",
        solution: "RFID_WAREHOUSE",
        message: "Automated pallet dispatch detection at -20 degree freezer gates.",
        status: "NEW",
        telegramNotified: true,
      },
      {
        name: "Dr. Sunita Kapoor",
        company: "Medivault Diagnostics Gurugram",
        email: "sunita@medivault.com",
        phone: "+91 98110 99887",
        solution: "RFID_ASSET",
        message: "Track diagnostic equipment and medical assets across 3 floors.",
        status: "CONTACTED",
        telegramNotified: false,
      },
    ],
  });

  // 12. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        username: "admin@garvix.in",
        action: "CREATE",
        entityType: "INVOICE",
        entityId: invoice1.id,
        details: "Generated Tax Invoice GARVIX/26-27/001 for Apex Retail Solutions (INR 2,17,710)",
      },
      {
        username: "sales@garvix.in",
        action: "CREATE",
        entityType: "QUOTATION",
        entityId: quote1.id,
        details: "Sent Quotation GARVIX/QT/26-27/001 to Royal Jewels (INR 2,28,920)",
      },
    ],
  });

  console.log("Database seeded successfully with rich production-grade records!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
