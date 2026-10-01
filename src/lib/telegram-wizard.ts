import { prisma } from "@/lib/prisma";
import { escapeHtml, sendTelegramReply, answerTelegramCallback } from "@/lib/telegram";
import {
  PERMISSIONS,
  PermissionCode,
  ALL_PERMISSIONS,
  ensureDefaultRoles,
  hasPermission,
} from "@/lib/permissions";
import { getCompanySettings, updateCompanySettings } from "@/lib/settings";
import { computeGst } from "@/lib/gst";
import bcrypt from "bcryptjs";

const SITE_URL =
  process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://garvix.in";

// Helper to get active session
export async function getActiveSession(chatId: string | number) {
  try {
    return await prisma.telegramSession.findUnique({
      where: { chatId: String(chatId) },
    });
  } catch (err) {
    console.error("Failed to read telegram session:", err);
    return null;
  }
}

// Helper to clear session
export async function clearSession(chatId: string | number) {
  try {
    await prisma.telegramSession.deleteMany({
      where: { chatId: String(chatId) },
    });
  } catch (err) {
    console.error("Failed to delete telegram session:", err);
  }
}

// Helper to set session
export async function setSession(
  chatId: string | number,
  flow: string,
  step: number,
  stateData: Record<string, any>
) {
  try {
    await prisma.telegramSession.upsert({
      where: { chatId: String(chatId) },
      create: {
        chatId: String(chatId),
        flow,
        step,
        stateData: JSON.stringify(stateData),
      },
      update: {
        flow,
        step,
        stateData: JSON.stringify(stateData),
      },
    });
  } catch (err) {
    console.error("Failed to upsert telegram session:", err);
  }
}

// ----------------------------------------------------
// 1. DYNAMIC MAIN MENU GENERATOR BASED ON PERMISSIONS
// ----------------------------------------------------
export async function buildDynamicMenu(role: string) {
  const keyboard: any[][] = [];

  // 1. Primary Action Row: Quotes & Clients
  const row1: any[] = [];
  if (await hasPermission(role, PERMISSIONS.CAN_CREATE_QUOTATION)) {
    row1.push({ text: "➕ New Quote", callback_data: "flow_new_quote" });
  }
  if (await hasPermission(role, PERMISSIONS.CAN_CREATE_CLIENT)) {
    row1.push({ text: "➕ New Client", callback_data: "flow_new_client" });
  }
  if (row1.length > 0) keyboard.push(row1);

  // 2. Secondary Action Row: Products & Staff
  const row2: any[] = [];
  if (await hasPermission(role, PERMISSIONS.CAN_CREATE_PRODUCT)) {
    row2.push({ text: "➕ New Product", callback_data: "flow_new_product" });
  }
  if (await hasPermission(role, PERMISSIONS.CAN_MANAGE_TEAM)) {
    row2.push({ text: "➕ Add Staff", callback_data: "flow_new_employee" });
  }
  if (row2.length > 0) keyboard.push(row2);

  // 3. Settings & Roles Management Row
  const row3: any[] = [];
  if (await hasPermission(role, PERMISSIONS.CAN_MANAGE_SETTINGS)) {
    row3.push({ text: "⚙️ Company Settings", callback_data: "flow_settings" });
  }
  if (await hasPermission(role, PERMISSIONS.CAN_MANAGE_ROLES)) {
    row3.push({ text: "🛡️ Roles & Perms", callback_data: "flow_roles" });
  }
  if (row3.length > 0) keyboard.push(row3);

  // 4. View Queries (Quotations, Invoices, Leads, Turnover, Tickets, Stock, Team)
  const viewRow1: any[] = [];
  if (await hasPermission(role, PERMISSIONS.CAN_CREATE_QUOTATION)) {
    viewRow1.push({ text: "📋 Recent Quotes", callback_data: "cmd_quotes" });
  }
  if (await hasPermission(role, PERMISSIONS.CAN_MANAGE_INVOICES)) {
    viewRow1.push({ text: "🧾 Invoices & Dues", callback_data: "cmd_invoices" });
  }
  if (viewRow1.length > 0) keyboard.push(viewRow1);

  const viewRow2: any[] = [];
  if (await hasPermission(role, PERMISSIONS.CAN_VIEW_LEADS)) {
    viewRow2.push({ text: "👥 Website Leads", callback_data: "cmd_leads" });
  }
  if (await hasPermission(role, PERMISSIONS.CAN_VIEW_FINANCES)) {
    viewRow2.push({ text: "📊 Turnover Report", callback_data: "cmd_summary" });
  }
  if (viewRow2.length > 0) keyboard.push(viewRow2);

  const viewRow3: any[] = [];
  if (await hasPermission(role, PERMISSIONS.CAN_VIEW_SERVICE)) {
    viewRow3.push({ text: "🛠️ Service Desk", callback_data: "cmd_tickets" });
  }
  viewRow3.push({ text: "📦 Hardware Stock", callback_data: "cmd_stock" });
  keyboard.push(viewRow3);

  // 5. Team link & Web portal
  const botRow: any[] = [];
  if (await hasPermission(role, PERMISSIONS.CAN_MANAGE_TEAM)) {
    botRow.push({ text: "👥 Staff List", callback_data: "cmd_team" });
  }
  botRow.push({ text: "🌐 Open Web ERP", url: `${SITE_URL}/admin` });
  keyboard.push(botRow);

  return { inline_keyboard: keyboard };
}

// ----------------------------------------------------
// 2. DISPATCH WIZARD FLOW INITIATION
// ----------------------------------------------------
export async function startWizard(
  chatId: string | number,
  flowName: string,
  user: any,
  initialData: Record<string, any> = {}
): Promise<boolean> {
  // Cancel previous active session if any
  await clearSession(chatId);

  // Check permissions
  if (flowName === "NEW_CLIENT") {
    if (!(await hasPermission(user.role, PERMISSIONS.CAN_CREATE_CLIENT))) {
      await sendTelegramReply(
        chatId,
        "🔒 <b>Permission Denied:</b> You do not have permission to create clients (`CAN_CREATE_CLIENT`)."
      );
      return false;
    }
    await setSession(chatId, "NEW_CLIENT", 1, initialData);
    const text = `
🏢 <b>Step 1/4: New Client Creation</b>
━━━━━━━━━━━━━━━━━━━━
Kripya client ki <b>Company ya Business ka Naam</b> bhejein:
<i>(Udaharan: Krishna Jewellers Pvt Ltd)</i>
    `.trim();
    await sendTelegramReply(chatId, text, {
      inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
    });
    return true;
  }

  if (flowName === "NEW_EMPLOYEE") {
    if (!(await hasPermission(user.role, PERMISSIONS.CAN_MANAGE_TEAM))) {
      await sendTelegramReply(
        chatId,
        "🔒 <b>Permission Denied:</b> You do not have permission to manage team & staff (`CAN_MANAGE_TEAM`)."
      );
      return false;
    }
    await setSession(chatId, "NEW_EMPLOYEE", 1, initialData);
    const text = `
👤 <b>Step 1/4: Add New Staff Member</b>
━━━━━━━━━━━━━━━━━━━━
Naye team member ka <b>Pura Naam (Full Name)</b> bhejein:
<i>(Udaharan: Rahul Sharma)</i>
    `.trim();
    await sendTelegramReply(chatId, text, {
      inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
    });
    return true;
  }

  if (flowName === "NEW_PRODUCT") {
    if (!(await hasPermission(user.role, PERMISSIONS.CAN_CREATE_PRODUCT))) {
      await sendTelegramReply(
        chatId,
        "🔒 <b>Permission Denied:</b> You do not have permission to add products (`CAN_CREATE_PRODUCT`)."
      );
      return false;
    }
    await setSession(chatId, "NEW_PRODUCT", 1, initialData);
    const text = `
📦 <b>Step 1/4: Add New Product / Service</b>
━━━━━━━━━━━━━━━━━━━━
Naye product ya hardware item ka <b>Name & Model</b> bhejein:
<i>(Udaharan: GX-900 4-Port Fixed RFID Reader)</i>
    `.trim();
    await sendTelegramReply(chatId, text, {
      inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
    });
    return true;
  }

  if (flowName === "NEW_QUOTATION") {
    if (!(await hasPermission(user.role, PERMISSIONS.CAN_CREATE_QUOTATION))) {
      await sendTelegramReply(
        chatId,
        "🔒 <b>Permission Denied:</b> You do not have permission to generate quotations (`CAN_CREATE_QUOTATION`)."
      );
      return false;
    }

    // If client ID was already passed
    if (initialData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: initialData.customerId },
      });
      if (customer) {
        initialData.customerName = customer.companyName;
        initialData.customerStateCode = customer.stateCode;
        await setSession(chatId, "NEW_QUOTATION", 2, initialData);
        return showProductSelectionStep(chatId, customer.companyName);
      }
    }

    // Otherwise, show client picker
    const recentClients = await prisma.customer.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      select: { id: true, companyName: true, state: true },
    });

    if (recentClients.length === 0) {
      await sendTelegramReply(
        chatId,
        "⚠️ Pehle kam se kam ek Client register karein. Main menu se <b>➕ New Client</b> chunein."
      );
      return false;
    }

    await setSession(chatId, "NEW_QUOTATION", 1, initialData);

    const keyboard: any[][] = recentClients.map((c) => [
      {
        text: `🏢 ${c.companyName.slice(0, 28)} (${c.state || "HR"})`,
        callback_data: `q_sel_client_${c.id}`,
      },
    ]);
    keyboard.push([{ text: "❌ Cancel", callback_data: "wizard_cancel" }]);

    const text = `
📄 <b>Step 1/3: Select Client for Quotation</b>
━━━━━━━━━━━━━━━━━━━━
Quotation kis client ke liye generate karni hai? Neeche diye gaye client par tap karein ya unka naam search karein:
    `.trim();

    await sendTelegramReply(chatId, text, { inline_keyboard: keyboard });
    return true;
  }

  if (flowName === "EDIT_SETTINGS") {
    if (!(await hasPermission(user.role, PERMISSIONS.CAN_MANAGE_SETTINGS))) {
      await sendTelegramReply(
        chatId,
        "🔒 <b>Permission Denied:</b> You do not have permission to modify company settings (`CAN_MANAGE_SETTINGS`)."
      );
      return false;
    }
    return showSettingsMenu(chatId);
  }

  if (flowName === "MANAGE_ROLES") {
    if (!(await hasPermission(user.role, PERMISSIONS.CAN_MANAGE_ROLES))) {
      await sendTelegramReply(
        chatId,
        "🔒 <b>Permission Denied:</b> You do not have permission to configure roles & permissions (`CAN_MANAGE_ROLES`)."
      );
      return false;
    }
    return showRolesList(chatId);
  }

  return false;
}

// ----------------------------------------------------
// 3. STEP HANDLERS (TEXT & CALLBACKS)
// ----------------------------------------------------
export async function handleWizardStep(
  chatId: string | number,
  session: any,
  userText: string,
  callbackData: string,
  user: any
): Promise<boolean> {
  const { flow, step } = session;
  let data: Record<string, any> = {};
  try {
    data = JSON.parse(session.stateData || "{}");
  } catch {}

  // Global Cancel
  if (
    userText.trim().toLowerCase() === "/cancel" ||
    callbackData === "wizard_cancel"
  ) {
    await clearSession(chatId);
    const menu = await buildDynamicMenu(user.role);
    await sendTelegramReply(
      chatId,
      "❌ <b>Operation Cancelled.</b> Main menu par waapas aa gaye hain.",
      menu
    );
    return true;
  }

  // --------------------------------------------------
  // FLOW: NEW_CLIENT
  // --------------------------------------------------
  if (flow === "NEW_CLIENT") {
    if (step === 1) {
      if (!userText.trim()) {
        await sendTelegramReply(chatId, "Kripya company ka naam text me bhejein:");
        return true;
      }
      data.companyName = userText.trim();
      await setSession(chatId, "NEW_CLIENT", 2, data);

      const text = `
📞 <b>Step 2/4: Contact Person & Phone Number</b>
━━━━━━━━━━━━━━━━━━━━
Client ke contact person ka naam aur unka 10-digit mobile number bhejein:
<i>(Udaharan: Rajesh Gupta, 9811223344)</i>
      `.trim();
      await sendTelegramReply(chatId, text, {
        inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
      });
      return true;
    }

    if (step === 2) {
      const parts = userText.split(/,|\n/);
      let contactPerson = parts[0]?.trim() || "";
      let phone = "";
      const phoneMatch = userText.match(/\b\d{10}\b/);
      if (phoneMatch) {
        phone = phoneMatch[0];
        if (parts.length > 1) {
          contactPerson = userText.replace(phone, "").replace(/,/g, "").trim();
        }
      } else {
        phone = userText.replace(/\D/g, "");
      }

      if (phone.length < 10) {
        await sendTelegramReply(
          chatId,
          "⚠️ Kripya valid 10-digit mobile number zaroor include karein (e.g. Rahul, 9876543210):"
        );
        return true;
      }

      data.contactPerson = contactPerson || data.companyName;
      data.phone = phone.slice(-10);
      await setSession(chatId, "NEW_CLIENT", 3, data);

      const text = `
🏛️ <b>Step 3/4: GSTIN (Optional)</b>
━━━━━━━━━━━━━━━━━━━━
Client ka 15-digit GSTIN number bhejein ya <b>Skip</b> button dabayein:
<i>(Udaharan: 06AAACG1234F1Z5)</i>
      `.trim();
      await sendTelegramReply(chatId, text, {
        inline_keyboard: [
          [{ text: "⏩ Skip GSTIN (Unregistered)", callback_data: "client_skip_gst" }],
          [{ text: "❌ Cancel", callback_data: "wizard_cancel" }],
        ],
      });
      return true;
    }

    if (step === 3) {
      if (callbackData === "client_skip_gst") {
        data.gstin = null;
        data.stateCode = "06";
        data.state = "Haryana";
      } else {
        const cleanedGstin = userText.trim().toUpperCase();
        data.gstin = cleanedGstin;
        const code = cleanedGstin.slice(0, 2);
        if (/^\d{2}$/.test(code)) {
          data.stateCode = code;
          data.state = code === "06" ? "Haryana" : "Other State";
        } else {
          data.stateCode = "06";
          data.state = "Haryana";
        }
      }

      await setSession(chatId, "NEW_CLIENT", 4, data);

      const text = `
📍 <b>Step 4/4: Registered Address / City</b>
━━━━━━━━━━━━━━━━━━━━
Client ka business address ya city name bhejein ya <b>Skip</b> dabayein:
<i>(Udaharan: Sector 29, Gurugram, Haryana)</i>
      `.trim();
      await sendTelegramReply(chatId, text, {
        inline_keyboard: [
          [{ text: "⏩ Skip Address", callback_data: "client_skip_address" }],
          [{ text: "❌ Cancel", callback_data: "wizard_cancel" }],
        ],
      });
      return true;
    }

    if (step === 4) {
      if (callbackData !== "client_skip_address") {
        data.billingAddress = userText.trim();
      }

      // Create Customer in DB
      const customer = await prisma.customer.create({
        data: {
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          phone: data.phone,
          gstin: data.gstin,
          state: data.state || "Haryana",
          stateCode: data.stateCode || "06",
          billingAddress: data.billingAddress || null,
          isB2B: !!data.gstin,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          username: user.name,
          action: "CREATE",
          entityType: "CUSTOMER",
          entityId: customer.id,
          details: `Client ${customer.companyName} created via Telegram Bot by ${user.name}`,
        },
      });

      await clearSession(chatId);

      const confText = `
🎉 <b>NEW CLIENT REGISTERED!</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Company:</b> ${escapeHtml(customer.companyName)}
👤 <b>Contact:</b> ${escapeHtml(customer.contactPerson || "N/A")}
📞 <b>Phone:</b> <code>${escapeHtml(customer.phone)}</code>
🏛️ <b>GSTIN:</b> ${customer.gstin ? `<code>${escapeHtml(customer.gstin)}</code>` : "<i>Unregistered</i>"}
📍 <b>State:</b> ${customer.state} (${customer.stateCode})
━━━━━━━━━━━━━━━━━━━━
Ab aap is client ke liye turant Quotation bana sakte hain!
      `.trim();

      await sendTelegramReply(chatId, confText, {
        inline_keyboard: [
          [{ text: "➕ Create Quotation for this Client", callback_data: `q_sel_client_${customer.id}` }],
          [{ text: "🔙 Main Menu", callback_data: "cmd_menu" }],
        ],
      });
      return true;
    }
  }

  // --------------------------------------------------
  // FLOW: NEW_EMPLOYEE
  // --------------------------------------------------
  if (flow === "NEW_EMPLOYEE") {
    if (step === 1) {
      if (!userText.trim()) {
        await sendTelegramReply(chatId, "Kripya staff member ka pura naam bhejein:");
        return true;
      }
      data.name = userText.trim();
      await setSession(chatId, "NEW_EMPLOYEE", 2, data);

      await ensureDefaultRoles();
      const roles = await prisma.role.findMany({
        orderBy: { createdAt: "asc" },
      });

      const keyboard: any[][] = [];
      for (let i = 0; i < roles.length; i += 2) {
        const row = [
          {
            text: roles[i].displayName || roles[i].name,
            callback_data: `emp_sel_role_${roles[i].name}`,
          },
        ];
        if (roles[i + 1]) {
          row.push({
            text: roles[i + 1].displayName || roles[i + 1].name,
            callback_data: `emp_sel_role_${roles[i + 1].name}`,
          });
        }
        keyboard.push(row);
      }
      keyboard.push([{ text: "❌ Cancel", callback_data: "wizard_cancel" }]);

      const text = `
💼 <b>Step 2/4: Select Role for ${escapeHtml(data.name)}</b>
━━━━━━━━━━━━━━━━━━━━
Inke liye department / role chunein:
      `.trim();

      await sendTelegramReply(chatId, text, { inline_keyboard: keyboard });
      return true;
    }

    if (step === 2) {
      let selectedRole = "";
      if (callbackData.startsWith("emp_sel_role_")) {
        selectedRole = callbackData.replace("emp_sel_role_", "");
      } else {
        selectedRole = userText.trim().toUpperCase();
      }

      data.role = selectedRole;
      await setSession(chatId, "NEW_EMPLOYEE", 3, data);

      const text = `
📞 <b>Step 3/4: Official Mobile Number</b>
━━━━━━━━━━━━━━━━━━━━
${escapeHtml(data.name)} ji ka <b>10-digit mobile number</b> bhejein.
<i>(Jab wo Telegram par bot se connect karenge to isi number se inka account auto-verify hoga)</i>:
      `.trim();

      await sendTelegramReply(chatId, text, {
        inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
      });
      return true;
    }

    if (step === 3) {
      const cleanPhone = userText.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        await sendTelegramReply(
          chatId,
          "⚠️ Kripya 10-digit valid mobile number bhejein:"
        );
        return true;
      }
      const last10 = cleanPhone.slice(-10);

      // Check if phone already registered
      const existingUser = await prisma.user.findFirst({
        where: { phone: { contains: last10 } },
      });
      if (existingUser) {
        await sendTelegramReply(
          chatId,
          `⚠️ Ye mobile number already <b>${escapeHtml(existingUser.name)}</b> (${existingUser.role}) ke paas registered hai.\nKripya koi doosra number bhejein:`
        );
        return true;
      }

      data.phone = last10;
      await setSession(chatId, "NEW_EMPLOYEE", 4, data);

      const text = `
🔐 <b>Step 4/4: Portal Password</b>
━━━━━━━━━━━━━━━━━━━━
Web ERP login ke liye password set karein (min 6 characters), ya <b>🎲 Auto Generate</b> button dabayein:
      `.trim();

      await sendTelegramReply(chatId, text, {
        inline_keyboard: [
          [{ text: "🎲 Auto Generate Strong Password", callback_data: "emp_auto_pw" }],
          [{ text: "❌ Cancel", callback_data: "wizard_cancel" }],
        ],
      });
      return true;
    }

    if (step === 4) {
      let password = "";
      if (callbackData === "emp_auto_pw") {
        password = "Garvix@" + Math.floor(1000 + Math.random() * 9000);
      } else {
        password = userText.trim();
        if (password.length < 6) {
          await sendTelegramReply(
            chatId,
            "⚠️ Password kam se kam 6 characters ka hona chahiye. Dobara bhejein ya Auto Generate dabayein:"
          );
          return true;
        }
      }

      // Generate unique username
      let baseUsername = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (!baseUsername) baseUsername = "staff";
      let username = baseUsername;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const email = `${username}@garvix.in`;
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          username,
          email,
          passwordHash,
          role: data.role,
          phone: data.phone,
          isActive: true,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          username: user.name,
          action: "CREATE",
          entityType: "USER",
          entityId: newUser.id,
          details: `Staff ${newUser.name} (${newUser.role}) created via Telegram Bot by ${user.name}`,
        },
      });

      await clearSession(chatId);

      const confText = `
🎉 <b>STAFF ACCOUNT CREATED!</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Name:</b> ${escapeHtml(newUser.name)}
💼 <b>Role:</b> <code>${newUser.role}</code>
📞 <b>Registered Phone:</b> <code>${newUser.phone}</code>
🔑 <b>Username:</b> <code>${newUser.username}</code>
🔐 <b>Password:</b> <code>${escapeHtml(password)}</code>
🌐 <b>Portal URL:</b> ${SITE_URL}/admin
━━━━━━━━━━━━━━━━━━━━
💡 <i>Ye details apne employee ko share kar dein. Jab wo Telegram Bot par aakar apna number share karenge, to inka bot menu automatically unlock ho jayega!</i>
      `.trim();

      const menu = await buildDynamicMenu(user.role);
      await sendTelegramReply(chatId, confText, menu);
      return true;
    }
  }

  // --------------------------------------------------
  // FLOW: NEW_PRODUCT
  // --------------------------------------------------
  if (flow === "NEW_PRODUCT") {
    if (step === 1) {
      if (!userText.trim()) {
        await sendTelegramReply(chatId, "Kripya product ka naam bhejein:");
        return true;
      }
      data.name = userText.trim();
      await setSession(chatId, "NEW_PRODUCT", 2, data);

      const text = `
🏷️ <b>Step 2/4: Category Chunein</b>
━━━━━━━━━━━━━━━━━━━━
Product ke category type par tap karein:
      `.trim();

      await sendTelegramReply(chatId, text, {
        inline_keyboard: [
          [
            { text: "📡 RFID Reader", callback_data: "prod_cat_HARDWARE_READER" },
            { text: "📶 RFID Antenna", callback_data: "prod_cat_HARDWARE_ANTENNA" },
          ],
          [
            { text: "🏷️ RFID Tags / Cards", callback_data: "prod_cat_HARDWARE_TAG" },
            { text: "💻 Software / AMC", callback_data: "prod_cat_SOFTWARE_SERVICE" },
          ],
          [{ text: "❌ Cancel", callback_data: "wizard_cancel" }],
        ],
      });
      return true;
    }

    if (step === 2) {
      let category = "HARDWARE_READER";
      let hsn = "8471";
      if (callbackData.startsWith("prod_cat_")) {
        category = callbackData.replace("prod_cat_", "");
      }

      if (category === "HARDWARE_ANTENNA" || category === "HARDWARE_TAG") {
        hsn = "8523";
      } else if (category === "SOFTWARE_SERVICE") {
        hsn = "998314";
      }

      data.category = category;
      data.hsnCode = hsn;
      await setSession(chatId, "NEW_PRODUCT", 3, data);

      const text = `
💰 <b>Step 3/4: Selling Price (INR)</b>
━━━━━━━━━━━━━━━━━━━━
Is product ka <b>Selling Price (Taxable ₹)</b> bhejein:
<i>(Udaharan: 28500)</i>
      `.trim();

      await sendTelegramReply(chatId, text, {
        inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
      });
      return true;
    }

    if (step === 3) {
      const price = parseFloat(userText.replace(/[^0-9.]/g, ""));
      if (isNaN(price) || price <= 0) {
        await sendTelegramReply(
          chatId,
          "⚠️ Kripya valid number enter karein (e.g. 15000):"
        );
        return true;
      }

      data.sellingPrice = price;
      await setSession(chatId, "NEW_PRODUCT", 4, data);

      const text = `
📊 <b>Step 4/4: Opening Stock Quantity</b>
━━━━━━━━━━━━━━━━━━━━
Current stock quantity (PCS) bhejein:
<i>(Udaharan: 10)</i>
      `.trim();

      await sendTelegramReply(chatId, text, {
        inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
      });
      return true;
    }

    if (step === 4) {
      const stock = parseInt(userText.replace(/\D/g, ""), 10) || 0;
      data.currentStock = stock;

      // Generate SKU code
      const count = await prisma.product.count();
      const prefix =
        data.category === "HARDWARE_READER"
          ? "GX-RDR"
          : data.category === "HARDWARE_ANTENNA"
          ? "GX-ANT"
          : data.category === "HARDWARE_TAG"
          ? "GX-TAG"
          : "GX-SFT";
      const sku = `${prefix}-${String(count + 1).padStart(3, "0")}`;

      const product = await prisma.product.create({
        data: {
          name: data.name,
          sku,
          category: data.category,
          hsnCode: data.hsnCode,
          purchasePrice: Math.round(data.sellingPrice * 0.7),
          sellingPrice: data.sellingPrice,
          unit: data.category === "SOFTWARE_SERVICE" ? "YEAR" : "PCS",
          currentStock: data.currentStock,
          minStockAlert: 5,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          username: user.name,
          action: "CREATE",
          entityType: "PRODUCT",
          entityId: product.id,
          details: `Product ${product.name} (SKU: ${product.sku}) created via Telegram Bot by ${user.name}`,
        },
      });

      await clearSession(chatId);

      const confText = `
🎉 <b>PRODUCT CREATED SUCCESSFULLY!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Name:</b> ${escapeHtml(product.name)}
🔖 <b>SKU:</b> <code>${product.sku}</code>
🏷️ <b>Category:</b> ${product.category}
🏛️ <b>HSN Code:</b> ${product.hsnCode}
💰 <b>Price:</b> ₹${product.sellingPrice.toLocaleString("en-IN")}
📊 <b>Stock:</b> ${product.currentStock} ${product.unit}
━━━━━━━━━━━━━━━━━━━━
Ab ye product Quotation aur Invoice creation me automatically available hai!
      `.trim();

      const menu = await buildDynamicMenu(user.role);
      await sendTelegramReply(chatId, confText, menu);
      return true;
    }
  }

  // --------------------------------------------------
  // FLOW: NEW_QUOTATION
  // --------------------------------------------------
  if (flow === "NEW_QUOTATION") {
    if (step === 1) {
      let customerId = "";
      if (callbackData.startsWith("q_sel_client_")) {
        customerId = callbackData.replace("q_sel_client_", "");
      } else {
        const found = await prisma.customer.findFirst({
          where: {
            OR: [
              { companyName: { contains: userText.trim() } },
              { contactPerson: { contains: userText.trim() } },
              { phone: { contains: userText.trim() } },
            ],
          },
        });
        if (found) customerId = found.id;
      }

      if (!customerId) {
        await sendTelegramReply(
          chatId,
          "⚠️ Client nahi mila. Kripya list me se button dabayein ya sahi company name search karein:"
        );
        return true;
      }

      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) return false;

      data.customerId = customer.id;
      data.customerName = customer.companyName;
      data.customerStateCode = customer.stateCode;
      await setSession(chatId, "NEW_QUOTATION", 2, data);

      return showProductSelectionStep(chatId, customer.companyName);
    }

    if (step === 2) {
      let productId = "";
      if (callbackData.startsWith("q_sel_prod_")) {
        productId = callbackData.replace("q_sel_prod_", "");
      } else {
        const found = await prisma.product.findFirst({
          where: {
            OR: [
              { name: { contains: userText.trim() } },
              { sku: { contains: userText.trim() } },
            ],
          },
        });
        if (found) productId = found.id;
      }

      if (!productId) {
        await sendTelegramReply(
          chatId,
          "⚠️ Product nahi mila. Neeche diye gaye button par tap karein ya product name search karein:"
        );
        return true;
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) return false;

      data.productId = product.id;
      data.productName = product.name;
      data.productPrice = product.sellingPrice;
      data.productHsn = product.hsnCode;

      await setSession(chatId, "NEW_QUOTATION", 3, data);

      const text = `
🔢 <b>Step 3/3: Enter Quantity</b>
━━━━━━━━━━━━━━━━━━━━
🏢 Client: <b>${escapeHtml(data.customerName)}</b>
📦 Item: <b>${escapeHtml(product.name)}</b> (₹${product.sellingPrice.toLocaleString("en-IN")})

Kitni quantity quote karni hai? Button dabayein ya number type karein:
      `.trim();

      await sendTelegramReply(chatId, text, {
        inline_keyboard: [
          [
            { text: "1 Unit", callback_data: "q_qty_1" },
            { text: "2 Units", callback_data: "q_qty_2" },
            { text: "5 Units", callback_data: "q_qty_5" },
            { text: "10 Units", callback_data: "q_qty_10" },
          ],
          [{ text: "❌ Cancel", callback_data: "wizard_cancel" }],
        ],
      });
      return true;
    }

    if (step === 3) {
      let qty = 1;
      if (callbackData.startsWith("q_qty_")) {
        qty = parseInt(callbackData.replace("q_qty_", ""), 10);
      } else {
        qty = parseInt(userText.replace(/\D/g, ""), 10) || 1;
      }

      const subtotal = data.productPrice * qty;
      const taxDetails = computeGst(subtotal, data.customerStateCode || "06", 18);
      const grandTotal = subtotal + taxDetails.totalTax;

      // Sequence
      const count = await prisma.quotation.count();
      const nextSeq = String(count + 1).padStart(3, "0");
      const quoteNumber = `GARVIX/QT/26-27/${nextSeq}`;

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 15);

      const quotation = await prisma.quotation.create({
        data: {
          quoteNumber,
          customerId: data.customerId,
          subtotal,
          taxType: taxDetails.taxType,
          cgstAmount: taxDetails.cgstAmount,
          sgstAmount: taxDetails.sgstAmount,
          igstAmount: taxDetails.igstAmount,
          totalAmount: grandTotal,
          status: "SENT",
          validUntil,
          items: {
            create: [
              {
                productId: data.productId,
                description: data.productName,
                hsnCode: data.productHsn || "8471",
                quantity: qty,
                unitPrice: data.productPrice,
                taxRate: 18,
                taxAmount: taxDetails.totalTax,
                totalAmount: grandTotal,
              },
            ],
          },
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          username: user.name,
          action: "CREATE",
          entityType: "QUOTATION",
          entityId: quotation.id,
          details: `Quotation ${quoteNumber} (INR ${grandTotal}) created via Telegram Bot by ${user.name}`,
        },
      });

      await clearSession(chatId);

      const portalUrl = `${SITE_URL}/portal/quotation/${quotation.token}`;
      const waMessage = encodeURIComponent(
        `Hello ${data.customerName}, please find your official GARVIX Quotation ${quoteNumber} for INR ${grandTotal.toLocaleString("en-IN")}: ${portalUrl}`
      );
      const waLink = `https://api.whatsapp.com/send?text=${waMessage}`;

      const confText = `
📄 <b>QUOTATION GENERATED VIA BOT!</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>Quote #:</b> <code>${quoteNumber}</code>
🏢 <b>Client:</b> ${escapeHtml(data.customerName)}
📦 <b>Item:</b> ${escapeHtml(data.productName)} x ${qty}
💵 <b>Taxable Subtotal:</b> ₹${subtotal.toLocaleString("en-IN")}
🏛️ <b>GST (${taxDetails.taxType === "INTRA_STATE" ? "9% CGST + 9% SGST" : "18% IGST"}):</b> ₹${taxDetails.totalTax.toLocaleString("en-IN")}
💰 <b>Grand Total:</b> <b>₹${grandTotal.toLocaleString("en-IN")}</b>
📅 <b>Valid For:</b> 15 Days
━━━━━━━━━━━━━━━━━━━━
🔗 <b>Client Digital Portal:</b>
<a href="${portalUrl}">${portalUrl}</a>
      `.trim();

      await sendTelegramReply(chatId, confText, {
        inline_keyboard: [
          [{ text: "🌐 Open Quotation Portal", url: portalUrl }],
          [{ text: "💬 Share on WhatsApp", url: waLink }],
          [{ text: "🧾 Convert to Tax Invoice", callback_data: `q_conv_${quotation.id}` }],
          [{ text: "🔙 Main Menu", callback_data: "cmd_menu" }],
        ],
      });
      return true;
    }
  }

  // --------------------------------------------------
  // FLOW: EDIT_SETTINGS
  // --------------------------------------------------
  if (flow === "EDIT_SETTINGS") {
    const field = data.field;
    if (!field) {
      await clearSession(chatId);
      return showSettingsMenu(chatId);
    }

    const value = userText.trim();
    if (!value) {
      await sendTelegramReply(chatId, "Kripya nayi value text me bhejein:");
      return true;
    }

    const updatePayload: Record<string, string> = {};
    updatePayload[field] = value;

    if (field === "gstin") {
      const code = value.slice(0, 2);
      if (/^\d{2}$/.test(code)) {
        updatePayload.stateCode = code;
        updatePayload.state = code === "06" ? "Haryana" : "Other State";
      }
    }

    await updateCompanySettings(updatePayload);
    await clearSession(chatId);

    const confText = `
✅ <b>COMPANY SETTINGS UPDATED!</b>
━━━━━━━━━━━━━━━━━━━━
Field <b>${field}</b> has been updated to:
<code>${escapeHtml(value)}</code>

Ye change system ke sabhi Dynamic QR codes, Quotations, aur Tax Invoices par instantly apply ho gaya hai!
    `.trim();

    await sendTelegramReply(chatId, confText, {
      inline_keyboard: [
        [{ text: "⚙️ Back to Settings", callback_data: "flow_settings" }],
        [{ text: "🔙 Main Menu", callback_data: "cmd_menu" }],
      ],
    });
    return true;
  }

  // --------------------------------------------------
  // FLOW: ADD_ROLE
  // --------------------------------------------------
  if (flow === "ADD_ROLE") {
    if (step === 1) {
      const roleCode = userText.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "");
      if (!roleCode || roleCode.length < 3) {
        await sendTelegramReply(
          chatId,
          "⚠️ Valid Role Code bhejein (Capital letters, e.g. MANAGER, DISPATCH_HEAD):"
        );
        return true;
      }

      // Check unique
      const existing = await prisma.role.findUnique({ where: { name: roleCode } });
      if (existing) {
        await sendTelegramReply(
          chatId,
          `⚠️ Role code '${roleCode}' pehle se exist karta hai. Dusra code bhejein:`
        );
        return true;
      }

      data.roleName = roleCode;
      await setSession(chatId, "ADD_ROLE", 2, data);

      const text = `
🏷️ <b>Step 2/2: Display Name & Icon</b>
━━━━━━━━━━━━━━━━━━━━
Is role ke liye display title bhejein:
<i>(Udaharan: 👨‍💼 Operations Manager)</i>
      `.trim();

      await sendTelegramReply(chatId, text, {
        inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
      });
      return true;
    }

    if (step === 2) {
      const displayName = userText.trim();
      const defaultPerms: PermissionCode[] = [
        "CAN_VIEW_LEADS",
        "CAN_CREATE_CLIENT",
        "CAN_CREATE_QUOTATION",
      ];

      const newRole = await prisma.role.create({
        data: {
          name: data.roleName,
          displayName,
          description: `Custom role created via Telegram Bot by ${user.name}`,
          permissions: JSON.stringify(defaultPerms),
          isSystem: false,
        },
      });

      await clearSession(chatId);

      const confText = `
🎉 <b>CUSTOM ROLE CREATED!</b>
━━━━━━━━━━━━━━━━━━━━
Role: <b>${escapeHtml(newRole.displayName)}</b> (<code>${newRole.name}</code>)
Ab aap neeche is role ki permissions ko toggle kar sakte hain:
      `.trim();

      await sendTelegramReply(chatId, confText);
      return showRolePermissionsEditor(chatId, newRole.id);
    }
  }

  return false;
}

// ----------------------------------------------------
// 4. MODULAR VIEWS (SETTINGS, ROLES, PRODUCTS)
// ----------------------------------------------------
async function showProductSelectionStep(chatId: string | number, clientName: string) {
  const topProducts = await prisma.product.findMany({
    take: 6,
    orderBy: { currentStock: "desc" },
    select: { id: true, name: true, sellingPrice: true },
  });

  const keyboard: any[][] = topProducts.map((p) => [
    {
      text: `📦 ${p.name.slice(0, 26)} (₹${p.sellingPrice.toLocaleString("en-IN")})`,
      callback_data: `q_sel_prod_${p.id}`,
    },
  ]);
  keyboard.push([{ text: "❌ Cancel", callback_data: "wizard_cancel" }]);

  const text = `
📦 <b>Step 2/3: Select Item for ${escapeHtml(clientName)}</b>
━━━━━━━━━━━━━━━━━━━━
Quotation me kaunsa product add karna hai? Neeche diye gaye product par tap karein ya product name search karein:
  `.trim();

  await sendTelegramReply(chatId, text, { inline_keyboard: keyboard });
  return true;
}

export async function showSettingsMenu(chatId: string | number) {
  const settings = await getCompanySettings();

  const text = `
⚙️ <b>GARVIX Business & System Settings</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Company:</b> ${escapeHtml(settings.name)}
🏷️ <b>Tagline:</b> ${escapeHtml(settings.tagline)}
🏛️ <b>GSTIN:</b> <code>${escapeHtml(settings.gstin)}</code> (${settings.state} - ${settings.stateCode})
📞 <b>Official Phone:</b> <code>${escapeHtml(settings.phone)}</code>
✉️ <b>Email:</b> ${escapeHtml(settings.email)}
📍 <b>Address:</b> ${escapeHtml(settings.address)}
💳 <b>Dynamic UPI ID:</b> <code>${escapeHtml(settings.upiId)}</code>
👤 <b>UPI Payee Name:</b> ${escapeHtml(settings.upiName)}
━━━━━━━━━━━━━━━━━━━━
Kisi bhi field ko edit karne ke liye neeche button dabayein:
  `.trim();

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🏢 Edit Company Name", callback_data: "set_field_name" },
        { text: "💳 Edit Dynamic UPI ID", callback_data: "set_field_upiId" },
      ],
      [
        { text: "📞 Edit Phone", callback_data: "set_field_phone" },
        { text: "✉️ Edit Email", callback_data: "set_field_email" },
      ],
      [
        { text: "🏛️ Edit GSTIN", callback_data: "set_field_gstin" },
        { text: "📍 Edit Address", callback_data: "set_field_address" },
      ],
      [{ text: "🔙 Main Menu", callback_data: "cmd_menu" }],
    ],
  };

  await sendTelegramReply(chatId, text, keyboard);
  return true;
}

export async function promptEditField(
  chatId: string | number,
  field: string,
  user: any
) {
  const settings = await getCompanySettings();
  const currentVal = (settings as any)[field] || "None";

  await setSession(chatId, "EDIT_SETTINGS", 1, { field });

  const labelMap: Record<string, string> = {
    name: "Company Registered Name",
    upiId: "Business UPI ID (for Dynamic QR)",
    phone: "Official Phone Number",
    email: "Official Email Address",
    gstin: "15-Digit GSTIN Number",
    address: "Registered Business Address",
  };

  const text = `
✏️ <b>Edit ${labelMap[field] || field}</b>
━━━━━━━━━━━━━━━━━━━━
Current Value: <code>${escapeHtml(currentVal)}</code>

Kripya is field ke liye <b>Nayi Value (New Text)</b> bhejein:
  `.trim();

  await sendTelegramReply(chatId, text, {
    inline_keyboard: [[{ text: "❌ Cancel", callback_data: "wizard_cancel" }]],
  });
  return true;
}

export async function showRolesList(chatId: string | number) {
  await ensureDefaultRoles();
  const roles = await prisma.role.findMany({
    orderBy: { createdAt: "asc" },
  });

  const keyboard: any[][] = [];
  for (let i = 0; i < roles.length; i += 2) {
    const row = [
      {
        text: roles[i].displayName || roles[i].name,
        callback_data: `role_view_${roles[i].id}`,
      },
    ];
    if (roles[i + 1]) {
      row.push({
        text: roles[i + 1].displayName || roles[i + 1].name,
        callback_data: `role_view_${roles[i + 1].id}`,
      });
    }
    keyboard.push(row);
  }

  keyboard.push([
    { text: "➕ Add New Custom Role", callback_data: "flow_add_role" },
    { text: "🔙 Main Menu", callback_data: "cmd_menu" },
  ]);

  const text = `
🛡️ <b>GARVIX Roles & Permissions Matrix</b>
━━━━━━━━━━━━━━━━━━━━
System me defined roles neeche diye gaye hain. Kisi bhi role par tap karke uski granular permissions ko <b>Allow (✅)</b> ya <b>Revoke (❌)</b> karein:
  `.trim();

  await sendTelegramReply(chatId, text, { inline_keyboard: keyboard });
  return true;
}

export async function showRolePermissionsEditor(
  chatId: string | number,
  roleId: string
) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    await sendTelegramReply(chatId, "⚠️ Role nahi mila.");
    return false;
  }

  let granted: PermissionCode[] = [];
  try {
    granted = JSON.parse(role.permissions || "[]");
  } catch {}

  const keyboard: any[][] = [];

  ALL_PERMISSIONS.forEach((perm) => {
    const isGranted = role.name === "SUPER_ADMIN" || granted.includes(perm.code);
    const icon = isGranted ? "✅" : "❌";
    keyboard.push([
      {
        text: `${icon} ${perm.label}`,
        callback_data: `rtog_${role.id}_${perm.code}`,
      },
    ]);
  });

  keyboard.push([
    { text: "🔙 All Roles", callback_data: "flow_roles" },
    { text: "🏠 Main Menu", callback_data: "cmd_menu" },
  ]);

  const text = `
🛡️ <b>Permission Matrix: ${escapeHtml(role.displayName)}</b>
Role Code: <code>${role.name}</code>
${role.description ? `<i>${escapeHtml(role.description)}</i>\n` : ""}━━━━━━━━━━━━━━━━━━━━
Kisi bhi permission ko enable ya disable karne ke liye us button par tap karein:
  `.trim();

  await sendTelegramReply(chatId, text, { inline_keyboard: keyboard });
  return true;
}

export async function toggleRolePermission(
  chatId: string | number,
  roleId: string,
  permCode: string,
  callbackQueryId?: string
) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) return false;

  if (role.name === "SUPER_ADMIN") {
    if (callbackQueryId) {
      await answerTelegramCallback(
        callbackQueryId,
        "Super Admin permissions cannot be restricted."
      );
    }
    return false;
  }

  let permissions: string[] = [];
  try {
    permissions = JSON.parse(role.permissions || "[]");
  } catch {}

  const idx = permissions.indexOf(permCode);
  if (idx >= 0) {
    permissions.splice(idx, 1);
  } else {
    permissions.push(permCode);
  }

  await prisma.role.update({
    where: { id: roleId },
    data: { permissions: JSON.stringify(permissions) },
  });

  if (callbackQueryId) {
    await answerTelegramCallback(callbackQueryId, "Permission updated!");
  }

  return showRolePermissionsEditor(chatId, roleId);
}

// ----------------------------------------------------
// 5. CONVERT QUOTATION TO TAX INVOICE DIRECTLY
// ----------------------------------------------------
export async function convertQuotationFromTelegram(
  chatId: string | number,
  quotationId: string,
  user: any
) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { customer: true, items: true },
  });

  if (!quotation) {
    await sendTelegramReply(chatId, "⚠️ Quotation nahi mila.");
    return false;
  }

  if (quotation.status === "CONVERTED") {
    await sendTelegramReply(
      chatId,
      `⚠️ Quotation <code>${quotation.quoteNumber}</code> already Tax Invoice me convert ho chuki hai!`
    );
    return false;
  }

  const invoiceCount = await prisma.invoice.count();
  const nextSeq = String(invoiceCount + 1).padStart(3, "0");
  const invoiceNumber = `GARVIX/26-27/${nextSeq}`;

  const taxDetails = computeGst(
    quotation.subtotal,
    quotation.customer.stateCode,
    18
  );

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      invoiceType: "TAX_INVOICE",
      customerId: quotation.customerId,
      quotationId: quotation.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 86400000),
      subtotal: quotation.subtotal,
      taxType: taxDetails.taxType,
      cgstRate: taxDetails.cgstRate,
      cgstAmount: taxDetails.cgstAmount,
      sgstRate: taxDetails.sgstRate,
      sgstAmount: taxDetails.sgstAmount,
      igstRate: taxDetails.igstRate,
      igstAmount: taxDetails.igstAmount,
      totalAmount: quotation.totalAmount,
      balanceDue: quotation.totalAmount,
      paymentStatus: "UNPAID",
      items: {
        create: quotation.items.map((it) => ({
          productId: it.productId,
          description: it.description,
          hsnCode: it.hsnCode,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          taxRate: it.taxRate,
          taxAmount: it.taxAmount,
          totalAmount: it.totalAmount,
        })),
      },
    },
  });

  // Mark quote converted
  await prisma.quotation.update({
    where: { id: quotation.id },
    data: { status: "CONVERTED" },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      username: user.name,
      action: "CONVERT",
      entityType: "INVOICE",
      entityId: invoice.id,
      details: `Converted Quotation ${quotation.quoteNumber} to Tax Invoice ${invoiceNumber} via Telegram Bot by ${user.name}`,
    },
  });

  const invoicePortalUrl = `${SITE_URL}/portal/invoice/${invoice.token}`;
  const text = `
🎉 <b>TAX INVOICE ISSUED FROM TELEGRAM!</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>Invoice #:</b> <code>${invoiceNumber}</code>
🏢 <b>Client:</b> ${escapeHtml(quotation.customer.companyName)}
💰 <b>Total Bill:</b> ₹${invoice.totalAmount.toLocaleString("en-IN")}
🏛️ <b>GST Split:</b> ₹${taxDetails.totalTax.toLocaleString("en-IN")} (${taxDetails.taxType})
💳 <b>Status:</b> UNPAID (Dynamic UPI QR Active)
━━━━━━━━━━━━━━━━━━━━
🔗 <b>Invoice & Payment Portal:</b>
<a href="${invoicePortalUrl}">${invoicePortalUrl}</a>
  `.trim();

  await sendTelegramReply(chatId, text, {
    inline_keyboard: [
      [{ text: "💳 View Bill & Instant UPI QR", url: invoicePortalUrl }],
      [{ text: "🔙 Main Menu", callback_data: "cmd_menu" }],
    ],
  });
  return true;
}
