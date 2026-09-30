# GARVIX | Next-Gen RFID Systems & Bespoke Software Lab

> Production-ready Enterprise RFID Infrastructure & Custom Software Engineering Platform with integrated ERP Admin Panel, Haryana GST Engine, Dynamic UPI QR Invoicing, and 1-Click CA Tax Return Export.

---

## 🚀 Key Highlights

*   **Public Tech Showcase (Futuristic Cyber Dark Aesthetic)**:
    *   Industrial RFID solutions for Jewellery, Warehouse Pallet Portals, Asset Tracking, and FASTag Parking.
    *   Bespoke Software, Cloud SaaS, and IoT Reader Middleware.
    *   **Interactive RFID ROI Calculator**: Live stock audit time & cost savings calculator.
    *   **Lead Capture + Real-Time Telegram Bot**: Instant notifications to Telegram channel/bot upon form submission.
*   **Enterprise Admin ERP Panel (`/admin`)**:
    *   **Custom Login**: Affixes `@garvix.in` domain badge automatically (`[ username ] @garvix.in`).
    *   **Role-Based Access Control (RBAC)**: Super Admin, Sales CRM, Accounts / CA, and Service Engineers.
    *   **Hardware Inventory & Serial / IMEI Tracker**: Tracks every RFID reader, antenna, and scanner across procurement, challans, and customer warranties.
    *   **Delivery Challans**: Returnable (Demo kits / trial runs) vs Non-Returnable (deployment) dispatch notes.
    *   **Quotation Engine**: Instant client proposal generator with 1-click conversion to Tax Invoice.
    *   **Tax Invoices with Dynamic UPI QR Code**: Embeds NPCI standard UPI QR for instant mobile app scanning (`upi://pay?pa=...`).
    *   **Haryana GST Engine (State Code: 06)**:
        *   Haryana clients: **CGST (9%) + SGST (9%)**
        *   Inter-state clients: **IGST (18%)**
    *   **1-Click CA Return Hub**: Generates multi-sheet **GSTR-1 Excel** (`b2b`, `b2cs`, `hsn`, `doc_issue`) and **GSTR-3B Summary Excel** with a single click.
    *   **Client Self-Service Portal**: `/portal/quotation/[token]` (view & digitally sign) and `/portal/invoice/[token]` (view & pay via UPI).
    *   **AMC & Service Desk**: Annual Maintenance Contracts with countdown reminders and support tickets.
    *   **Audit Trail**: Immutable event logs for security and regulatory compliance.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 15+ (App Router, React 19, TypeScript)
*   **Database & ORM**: SQLite (Local Dev) / PostgreSQL (Production) with Prisma ORM
*   **UI & Styling**: Tailwind CSS, Lucide React, Framer Motion
*   **PDF & Invoicing**: Dynamic NPCI UPI QR Generator (`qrcode`)
*   **Tax Engine**: ExcelJS / SheetJS (`xlsx`) for standard GSTR-1 and GSTR-3B workbooks
*   **Notifications**: Telegram Bot API

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/vishnubaldwa/GARVIX.git
cd GARVIX
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to activate live lead alerts.

### 3. Initialize Database & Seed Sample Records
```bash
npx prisma db push
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Admin Credentials

*   **Admin ERP Login**: `/admin/login`
*   **Username**: `admin` *(auto `@garvix.in`)*
*   **Password**: `admin123`

---

## 📄 License
Proprietary & Confidential © GARVIX Technologies. All rights reserved.
