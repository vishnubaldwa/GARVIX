import { prisma } from "@/lib/prisma";
import { getCompanySettings } from "@/lib/settings";

export type ComplianceCategory =
  | "POST_INCORP"
  | "GST"
  | "MCA_ROC"
  | "INCOME_TAX"
  | "PF_ESIC"
  | "CUSTOM";

export type ComplianceStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "FILED"
  | "NOT_APPLICABLE";

export type ComplianceUrgency =
  | "OVERDUE"
  | "DUE_SOON"
  | "UPCOMING"
  | "FILED"
  | "NOT_APPLICABLE";

export interface ComplianceProfile {
  companyName: string;
  state: string;
  stateCode: string;
  gstin: string;
  incorporationDate: string | null; // YYYY-MM-DD
  companyType: string; // PVT_LTD | LLP | OPC | PROPRIETORSHIP
  gstFilingFrequency: string; // MONTHLY | QUARTERLY | NONE
  gstRegistrationDate: string | null; // YYYY-MM-DD
  pfEsicApplicable: boolean;
}

export interface ComplianceCalendarItem {
  key: string; // statutory complianceKey OR custom_<id>
  customId?: string;
  isCustom: boolean;
  title: string;
  shortCode: string;
  category: ComplianceCategory;
  periodLabel: string;
  dueDate: string; // YYYY-MM-DD
  daysRemaining: number;
  urgency: ComplianceUrgency;
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  portalName: string;
  portalUrl: string | null;
  internalRoute?: string | null;
  internalRouteLabel?: string | null;
  instructions: string;
  penaltyNote: string | null;
  recurrence?: string;
  status: ComplianceStatus;
  filedDate: string | null;
  referenceNo: string | null;
  notes: string | null;
  updatedBy: string | null;
}

export interface ComplianceSummaryCounts {
  total: number;
  overdue: number;
  dueSoon: number;
  upcoming: number;
  filed: number;
  notApplicable: number;
}

export interface ComplianceCalendarResponse {
  profile: ComplianceProfile;
  financialYear: string;
  currentFinancialYear: string;
  availableFYs: string[];
  summary: ComplianceSummaryCounts;
  items: ComplianceCalendarItem[];
}

export interface ComplianceDashboardAlert {
  incorporationDateSet: boolean;
  incorporationDate: string | null;
  gstFilingFrequency: string;
  overdueCount: number;
  dueSoonCount: number;
  pendingTotal: number;
  topItems: Array<{
    key: string;
    title: string;
    category: ComplianceCategory;
    dueDate: string;
    daysRemaining: number;
    urgency: ComplianceUrgency;
    portalName: string;
    priority: "CRITICAL" | "HIGH" | "NORMAL";
  }>;
}

// Group A states (QRMP GSTR-3B due on 22nd); Group B states like Haryana (06), Delhi (07), UP (09) are due on 24th.
const QRMP_GROUP_A_STATES = new Set([
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
]);

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Returns today's calendar date in IST (YYYY-MM-DD). */
export function getTodayIstIso(): string {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

/** Parses YYYY-MM-DD or ISO string into pure YYYY-MM-DD (UTC safe). */
export function toDateOnlyIso(input?: string | Date | null): string | null {
  if (!input) return null;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return input.toISOString().slice(0, 10);
  }
  const str = String(input).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function isoToUtcMs(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function makeIsoDate(year: number, month1To12: number, day: number): string {
  const d = new Date(Date.UTC(year, month1To12 - 1, day));
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function addDaysIso(iso: string, days: number): string {
  const ms = isoToUtcMs(iso) + days * 86400000;
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function daysDiff(dueIso: string, todayIso: string): number {
  return Math.round((isoToUtcMs(dueIso) - isoToUtcMs(todayIso)) / 86400000);
}

export function getFinancialYearStartYear(dateIso: string): number {
  const [y, m] = dateIso.split("-").map(Number);
  return m >= 4 ? y : y - 1;
}

export function formatFinancialYear(startYear: number): string {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export function parseFinancialYearStart(fy?: string | null): number {
  if (fy && /^\d{4}-\d{2}$/.test(fy.trim())) {
    const start = parseInt(fy.trim().slice(0, 4), 10);
    if (start >= 2000 && start <= 2100) return start;
  }
  return getFinancialYearStartYear(getTodayIstIso());
}

function computeUrgency(
  status: ComplianceStatus,
  daysRemaining: number
): ComplianceUrgency {
  if (status === "FILED") return "FILED";
  if (status === "NOT_APPLICABLE") return "NOT_APPLICABLE";
  if (daysRemaining < 0) return "OVERDUE";
  if (daysRemaining <= 15) return "DUE_SOON";
  return "UPCOMING";
}

interface RawStatutorySpec {
  key: string;
  title: string;
  shortCode: string;
  category: ComplianceCategory;
  periodLabel: string;
  dueDate: string;
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  portalName: string;
  portalUrl: string | null;
  internalRoute?: string | null;
  internalRouteLabel?: string | null;
  instructions: string;
  penaltyNote: string | null;
}

export function generateStatutoryItems(
  profile: ComplianceProfile,
  fyStartYear: number,
  todayIso: string,
  recordMap: Map<
    string,
    {
      status: string;
      filedDate: Date | null;
      referenceNo: string | null;
      notes: string | null;
      updatedBy: string | null;
    }
  >
): ComplianceCalendarItem[] {
  const specs: RawStatutorySpec[] = [];
  const fyLabel = formatFinancialYear(fyStartYear);
  const prevFyStart = fyStartYear - 1;
  const prevFyLabel = formatFinancialYear(prevFyStart);
  const fyEndYear = fyStartYear + 1;
  const fyStartIso = `${fyStartYear}-04-01`;
  const fyEndIso = `${fyEndYear}-03-31`;
  const prevFyEndIso = `${fyStartYear}-03-31`;
  const currentFyStart = getFinancialYearStartYear(todayIso);

  const incorpIso = profile.incorporationDate;
  const incorpFyStart = incorpIso ? getFinancialYearStartYear(incorpIso) : null;
  const gstEffectiveIso = profile.gstRegistrationDate || incorpIso;
  const companyType = (profile.companyType || "PVT_LTD").toUpperCase();
  const gstFreq = (profile.gstFilingFrequency || "MONTHLY").toUpperCase();
  const isPvtOrOpc = companyType === "PVT_LTD" || companyType === "OPC";
  const isLlp = companyType === "LLP";
  const qrmp3bDay = QRMP_GROUP_A_STATES.has(profile.stateCode) ? 22 : 24;

  // =========================================================================
  // 1. POST-INCORPORATION ONE-TIME STATUTORY MILESTONES (from DOI)
  // =========================================================================
  if (incorpIso) {
    const postSpecs: RawStatutorySpec[] = [];

    if (isPvtOrOpc) {
      postSpecs.push(
        {
          key: `POST_INC_FIRST_BM_${incorpIso}`,
          title: "First Board Meeting (Sec 173(1))",
          shortCode: "1st BM",
          category: "POST_INCORP",
          periodLabel: "Within 30 days of Incorporation",
          dueDate: addDaysIso(incorpIso, 30),
          priority: "CRITICAL",
          portalName: "Registered Office / Board Minutes Book",
          portalUrl: "https://www.mca.gov.in",
          instructions:
            "Hold First Board Meeting within 30 days of incorporation. Pass resolutions to: (1) Open Company Current Bank Account, (2) Appoint First Statutory Auditor, (3) Authorize bank & GST signatories, (4) Note Certificate of Incorporation & MOA/AOA, and sign Minutes.",
          penaltyNote: "₹25,000 on company + ₹5,000 on officer in default.",
        },
        {
          key: `POST_INC_FIRST_AUDITOR_${incorpIso}`,
          title: "Appoint First Statutory Auditor (Board Resolution)",
          shortCode: "AUDITOR",
          category: "POST_INCORP",
          periodLabel: "Within 30 days of Incorporation",
          dueDate: addDaysIso(incorpIso, 30),
          priority: "HIGH",
          portalName: "MCA V3 Portal & CA Engagement Letter",
          portalUrl: "https://www.mca.gov.in",
          instructions:
            "Appoint a practicing Chartered Accountant as First Statutory Auditor via Board Resolution within 30 days of DOI (Sec 139(6)). Collect written consent & Sec 141 eligibility letter from CA. (If Board fails, shareholders must appoint within 90 days in EGM).",
          penaltyNote: "Non-compliance attracts Sec 147 penalty (₹25,000 to ₹5,00,000).",
        },
        {
          key: `POST_INC_INC22_${incorpIso}`,
          title: "Registered Office Verification (Form INC-22)",
          shortCode: "INC-22",
          category: "POST_INCORP",
          periodLabel: "Within 30 days of Incorporation",
          dueDate: addDaysIso(incorpIso, 30),
          priority: "HIGH",
          portalName: "MCA V3 Portal (mca.gov.in)",
          portalUrl: "https://www.mca.gov.in",
          instructions:
            "File Form INC-22 with latest electricity/utility bill (<2 months old), rent agreement/ownership deed & owner NOC if Registered Office was NOT already verified in SPICe+ at incorporation. (Mark 'Not Applicable' if verified in SPICe+).",
          penaltyNote: "₹1,000/day up to ₹1,00,000 on company & every officer.",
        },
        {
          key: `POST_INC_SHARE_CERT_${incorpIso}`,
          title: "Share Certificates Issue (SH-1) & Stamp Duty",
          shortCode: "SH-1",
          category: "POST_INCORP",
          periodLabel: "Within 60 days of Incorporation",
          dueDate: addDaysIso(incorpIso, 60),
          priority: "HIGH",
          portalName: `${profile.state || "Haryana"} e-GRAS / Stamp Portal`,
          portalUrl: "https://egrashry.nic.in",
          instructions:
            "Receive subscribed share capital from founding directors into the Company Bank Account, pay Stamp Duty on share certificates via State e-GRAS portal, issue signed Form SH-1 certificates within 60 days, and record in Register of Members (MGT-1).",
          penaltyNote: "₹50,000 penalty on company + ₹50,000 on each officer in default.",
        },
        {
          key: `POST_INC_INC20A_${incorpIso}`,
          title: "Commencement of Business Declaration (Form INC-20A)",
          shortCode: "INC-20A",
          category: "POST_INCORP",
          periodLabel: "Within 180 days of Incorporation",
          dueDate: addDaysIso(incorpIso, 180),
          priority: "CRITICAL",
          portalName: "MCA V3 Portal (mca.gov.in)",
          portalUrl: "https://www.mca.gov.in",
          instructions:
            "MANDATORY before commencing business or borrowing! Ensure all subscribers deposit their share capital into Company Bank Account, attach Bank Statement showing capital receipt, get certified by practicing CA/CS, and file Form INC-20A on MCA V3.",
          penaltyNote:
            "₹50,000 on company + ₹1,000/day (max ₹1,00,000) on directors + ROC can strike off company!",
        }
      );
    } else if (isLlp) {
      postSpecs.push({
        key: `POST_INC_LLP_FORM3_${incorpIso}`,
        title: "LLP Agreement Filing (Form 3)",
        shortCode: "LLP-3",
        category: "POST_INCORP",
        periodLabel: "Within 30 days of Incorporation",
        dueDate: addDaysIso(incorpIso, 30),
        priority: "CRITICAL",
        portalName: "MCA V3 Portal (mca.gov.in)",
        portalUrl: "https://www.mca.gov.in",
        instructions:
          "Execute notarized LLP Agreement on appropriate stamp paper between all Designated Partners and file Form 3 on MCA V3 within 30 days of incorporation.",
        penaltyNote: "₹100/day additional fee with NO maximum cap!",
      });
    }

    for (const s of postSpecs) {
      const saved = recordMap.get(s.key);
      const savedStatus = (saved?.status || "PENDING") as ComplianceStatus;
      const dueInFy = s.dueDate >= fyStartIso && s.dueDate <= fyEndIso;
      const incorpInFy = incorpFyStart === fyStartYear;
      const carryForwardUnfiled =
        fyStartYear === currentFyStart &&
        fyStartYear >= (incorpFyStart ?? fyStartYear) &&
        savedStatus !== "FILED" &&
        savedStatus !== "NOT_APPLICABLE";

      if (dueInFy || incorpInFy || carryForwardUnfiled) {
        specs.push(s);
      }
    }
  }

  // =========================================================================
  // 2. GST RETURNS (Monthly or Quarterly QRMP + Annual GSTR-9)
  // =========================================================================
  if (gstFreq !== "NONE") {
    // 12 months of FY: Apr(Y) .. Dec(Y), Jan(Y+1) .. Mar(Y+1)
    const fyMonths: Array<{ year: number; month: number; label: string; endIso: string }> = [];
    for (let i = 0; i < 12; i++) {
      const m = ((3 + i) % 12) + 1; // 4..12, 1..3
      const y = m >= 4 ? fyStartYear : fyEndYear;
      const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
      fyMonths.push({
        year: y,
        month: m,
        label: `${MONTH_SHORT[m - 1]} ${y}`,
        endIso: makeIsoDate(y, m, lastDay),
      });
    }

    if (gstFreq === "MONTHLY") {
      for (const fm of fyMonths) {
        if (gstEffectiveIso && fm.endIso < gstEffectiveIso) continue;
        const nextMonth = fm.month === 12 ? 1 : fm.month + 1;
        const nextYear = fm.month === 12 ? fm.year + 1 : fm.year;
        const ymKey = `${fm.year}_${pad2(fm.month)}`;

        specs.push(
          {
            key: `GST_GSTR1_M_${ymKey}`,
            title: `GSTR-1 Monthly Return (${fm.label})`,
            shortCode: "GSTR-1",
            category: "GST",
            periodLabel: fm.label,
            dueDate: makeIsoDate(nextYear, nextMonth, 11),
            priority: "HIGH",
            portalName: "GST Portal (gst.gov.in)",
            portalUrl: "https://www.gst.gov.in",
            internalRoute: "/admin/gst-returns",
            internalRouteLabel: "1-Click CA Export",
            instructions: `Export GSTR-1 sales workbook for ${fm.label} from GARVIX → 1-Click CA Return, verify B2B GSTINs, B2C totals & HSN summary, and submit on gst.gov.in using DSC/EVC by 11th.`,
            penaltyNote: "Late fee ₹50/day (₹20/day for Nil return) + blocks buyer ITC.",
          },
          {
            key: `GST_GSTR3B_M_${ymKey}`,
            title: `GSTR-3B Monthly Return & Tax Payment (${fm.label})`,
            shortCode: "GSTR-3B",
            category: "GST",
            periodLabel: fm.label,
            dueDate: makeIsoDate(nextYear, nextMonth, 20),
            priority: "CRITICAL",
            portalName: "GST Portal (gst.gov.in)",
            portalUrl: "https://www.gst.gov.in",
            internalRoute: "/admin/gst-returns",
            internalRouteLabel: "1-Click CA Export",
            instructions: `Reconcile vendor purchases with GSTR-2B ITC on gst.gov.in, export GSTR-3B summary from GARVIX, offset CGST/SGST/IGST liability, pay net cash challan if due, and file GSTR-3B by 20th.`,
            penaltyNote:
              "Late fee ₹50/day (₹20/day Nil) + 18% p.a. interest on delayed net cash tax.",
          }
        );
      }
    } else if (gstFreq === "QUARTERLY") {
      const quarters = [
        {
          code: "Q1",
          label: `Q1 (Apr–Jun ${fyStartYear})`,
          m1: fyMonths[0],
          m2: fyMonths[1],
          m3: fyMonths[2],
          dueYear: fyStartYear,
          dueMonth: 7,
        },
        {
          code: "Q2",
          label: `Q2 (Jul–Sep ${fyStartYear})`,
          m1: fyMonths[3],
          m2: fyMonths[4],
          m3: fyMonths[5],
          dueYear: fyStartYear,
          dueMonth: 10,
        },
        {
          code: "Q3",
          label: `Q3 (Oct–Dec ${fyStartYear})`,
          m1: fyMonths[6],
          m2: fyMonths[7],
          m3: fyMonths[8],
          dueYear: fyEndYear,
          dueMonth: 1,
        },
        {
          code: "Q4",
          label: `Q4 (Jan–Mar ${fyEndYear})`,
          m1: fyMonths[9],
          m2: fyMonths[10],
          m3: fyMonths[11],
          dueYear: fyEndYear,
          dueMonth: 4,
        },
      ];

      for (const q of quarters) {
        if (gstEffectiveIso && q.m3.endIso < gstEffectiveIso) continue;

        // M1 & M2 IFF (13th) + PMT-06 (25th)
        for (const subM of [q.m1, q.m2]) {
          if (gstEffectiveIso && subM.endIso < gstEffectiveIso) continue;
          const nextMonth = subM.month === 12 ? 1 : subM.month + 1;
          const nextYear = subM.month === 12 ? subM.year + 1 : subM.year;
          const ymKey = `${subM.year}_${pad2(subM.month)}`;

          specs.push(
            {
              key: `GST_IFF_${ymKey}`,
              title: `QRMP IFF Optional B2B Upload (${subM.label})`,
              shortCode: "IFF",
              category: "GST",
              periodLabel: `${subM.label} • QRMP`,
              dueDate: makeIsoDate(nextYear, nextMonth, 13),
              priority: "NORMAL",
              portalName: "GST Portal (gst.gov.in)",
              portalUrl: "https://www.gst.gov.in",
              internalRoute: "/admin/gst-returns",
              internalRouteLabel: "1-Click CA Export",
              instructions: `Optional Invoice Furnishing Facility (IFF): upload ${subM.label} B2B invoices so your corporate clients receive instant ITC in GSTR-2B. (Mark Not Applicable if no B2B sales this month).`,
              penaltyNote: "Optional facility — no late fee if skipped; report in quarterly GSTR-1.",
            },
            {
              key: `GST_PMT06_${ymKey}`,
              title: `QRMP Monthly GST Payment — PMT-06 (${subM.label})`,
              shortCode: "PMT-06",
              category: "GST",
              periodLabel: `${subM.label} • QRMP`,
              dueDate: makeIsoDate(nextYear, nextMonth, 25),
              priority: "HIGH",
              portalName: "GST Portal (gst.gov.in)",
              portalUrl: "https://www.gst.gov.in",
              instructions: `Deposit monthly GST liability for ${subM.label} via Form PMT-06 (35% Fixed Sum or Self-Assessment method) by 25th. No challan needed if Electronic Credit Ledger covers full tax.`,
              penaltyNote: "18% p.a. interest applies on delayed cash tax deposit.",
            }
          );
        }

        // Quarterly GSTR-1 (13th) & GSTR-3B (24th for Haryana 06 / Group B, 22nd for Group A)
        specs.push(
          {
            key: `GST_GSTR1_Q_${fyLabel}_${q.code}`,
            title: `Quarterly GSTR-1 Return — ${q.label}`,
            shortCode: `GSTR-1 ${q.code}`,
            category: "GST",
            periodLabel: `${q.label} • QRMP`,
            dueDate: makeIsoDate(q.dueYear, q.dueMonth, 13),
            priority: "HIGH",
            portalName: "GST Portal (gst.gov.in)",
            portalUrl: "https://www.gst.gov.in",
            internalRoute: "/admin/gst-returns",
            internalRouteLabel: "1-Click CA Export",
            instructions: `Export complete ${q.label} outward invoices from GARVIX → 1-Click CA Return (excluding B2B invoices already uploaded in M1/M2 IFF) and file Quarterly GSTR-1 on gst.gov.in by 13th.`,
            penaltyNote: "Late fee ₹50/day (₹20/day for Nil return).",
          },
          {
            key: `GST_GSTR3B_Q_${fyLabel}_${q.code}`,
            title: `Quarterly GSTR-3B Return — ${q.label}`,
            shortCode: `GSTR-3B ${q.code}`,
            category: "GST",
            periodLabel: `${q.label} • State ${profile.stateCode}`,
            dueDate: makeIsoDate(q.dueYear, q.dueMonth, qrmp3bDay),
            priority: "CRITICAL",
            portalName: "GST Portal (gst.gov.in)",
            portalUrl: "https://www.gst.gov.in",
            internalRoute: "/admin/gst-returns",
            internalRouteLabel: "1-Click CA Export",
            instructions: `Reconcile quarterly GSTR-2B ITC, adjust PMT-06 monthly tax deposits, pay any balance tax challan, and file Quarterly GSTR-3B by ${qrmp3bDay}th (${profile.state || "Haryana"} ${qrmp3bDay === 24 ? "Group B" : "Group A"}).`,
            penaltyNote:
              "Late fee ₹50/day (₹20/day Nil) + 18% p.a. interest on net unpaid tax.",
          }
        );
      }
    }

    // Annual GSTR-9 (for Previous FY, due 31 Dec of selected FY)
    if (!gstEffectiveIso || gstEffectiveIso <= prevFyEndIso) {
      specs.push({
        key: `GST_GSTR9_FY_${prevFyLabel}`,
        title: `GSTR-9 Annual GST Return (for FY ${prevFyLabel})`,
        shortCode: "GSTR-9",
        category: "GST",
        periodLabel: `FY ${prevFyLabel} Annual`,
        dueDate: makeIsoDate(fyStartYear, 12, 31),
        priority: "NORMAL",
        portalName: "GST Portal (gst.gov.in)",
        portalUrl: "https://www.gst.gov.in",
        internalRoute: "/admin/gst-returns",
        internalRouteLabel: "GST Reports",
        instructions: `Reconcile full FY ${prevFyLabel} sales, ITC claimed vs GSTR-2B, and tax paid. Mandatory if annual aggregate turnover exceeds ₹2 Crore (mark 'Not Applicable' if turnover ≤ ₹2 Cr).`,
        penaltyNote: "Late fee ₹50–₹200/day capped at 0.04%–0.50% of state turnover.",
      });
    }
  }

  // =========================================================================
  // 3. MCA / ROC CORPORATE COMPLIANCES
  // =========================================================================
  if (isPvtOrOpc) {
    // Quarterly Board Meetings (or Half-Yearly for OPC)
    const bmSchedule =
      companyType === "OPC"
        ? [
            { code: "H1", label: `H1 (Apr–Sep ${fyStartYear})`, due: makeIsoDate(fyStartYear, 9, 30) },
            { code: "H2", label: `H2 (Oct ${fyStartYear}–Mar ${fyEndYear})`, due: makeIsoDate(fyEndYear, 3, 31) },
          ]
        : [
            { code: "Q1", label: `Q1 (Apr–Jun ${fyStartYear})`, due: makeIsoDate(fyStartYear, 6, 30) },
            { code: "Q2", label: `Q2 (Jul–Sep ${fyStartYear})`, due: makeIsoDate(fyStartYear, 9, 30) },
            { code: "Q3", label: `Q3 (Oct–Dec ${fyStartYear})`, due: makeIsoDate(fyStartYear, 12, 31) },
            { code: "Q4", label: `Q4 (Jan–Mar ${fyEndYear})`, due: makeIsoDate(fyEndYear, 3, 31) },
          ];

    for (const bm of bmSchedule) {
      if (incorpIso && bm.due < incorpIso) continue;
      specs.push({
        key: `MCA_BM_${fyLabel}_${bm.code}`,
        title: `Board Meeting — ${bm.label}`,
        shortCode: `BM ${bm.code}`,
        category: "MCA_ROC",
        periodLabel: bm.label,
        dueDate: bm.due,
        priority: "NORMAL",
        portalName: "Registered Office / Minutes Register",
        portalUrl: "https://www.mca.gov.in",
        instructions:
          companyType === "OPC"
            ? "OPC must hold at least 1 Board Meeting in each half of a calendar year with at least 90 days gap (if >1 Director)."
            : "Send 7-day prior Notice & Agenda to all Directors, review quarterly accounts/operations, sign attendance register & maintain signed Minutes (max 120-day gap between two Board Meetings).",
        penaltyNote: "₹25,000 penalty on company + ₹5,000 on officer for default.",
      });
    }

    // MSME-1 H2 (Oct-Mar of previous FY) due Apr 30
    if (!incorpIso || incorpIso <= prevFyEndIso) {
      specs.push({
        key: `MCA_MSME1_H2_${prevFyLabel}`,
        title: `Form MSME-1 Half-Yearly Return (Oct ${prevFyStart}–Mar ${fyStartYear})`,
        shortCode: "MSME-1",
        category: "MCA_ROC",
        periodLabel: `Oct ${prevFyStart}–Mar ${fyStartYear}`,
        dueDate: makeIsoDate(fyStartYear, 4, 30),
        priority: "NORMAL",
        portalName: "MCA V3 Portal (mca.gov.in)",
        portalUrl: "https://www.mca.gov.in",
        instructions:
          "Report pending vendor payments exceeding 45 days to Micro & Small Enterprises (Udyam registered suppliers). Mark 'Not Applicable' if all MSME vendors were paid within 45 days.",
        penaltyNote: "₹20,000 + ₹1,000/day continuing default (up to ₹3,00,000).",
      });
    }

    // DPT-3 (for Previous FY) due Jun 30
    if (!incorpIso || incorpIso <= prevFyEndIso) {
      specs.push({
        key: `MCA_DPT3_FY_${prevFyLabel}`,
        title: `Form DPT-3 — Return of Deposits / Loans (FY ${prevFyLabel})`,
        shortCode: "DPT-3",
        category: "MCA_ROC",
        periodLabel: `As on 31 Mar ${fyStartYear}`,
        dueDate: makeIsoDate(fyStartYear, 6, 30),
        priority: "HIGH",
        portalName: "MCA V3 Portal (mca.gov.in)",
        portalUrl: "https://www.mca.gov.in",
        instructions: `File Form DPT-3 reporting outstanding loans from Directors, unsecured advances, or exempted deposits as on 31 Mar ${fyStartYear}. Requires Statutory Auditor certificate if deposits/exempted receipts exist.`,
        penaltyNote: "₹5,000 penalty + ₹500/day for continuing default.",
      });
    }

    // DIR-3 KYC due Sep 30
    if (!incorpIso || incorpIso <= prevFyEndIso) {
      specs.push({
        key: `MCA_DIR3KYC_${fyStartYear}`,
        title: `DIR-3 KYC / KYC-WEB — All Directors DIN KYC (${fyStartYear})`,
        shortCode: "DIR-3 KYC",
        category: "MCA_ROC",
        periodLabel: `Annual KYC ${fyStartYear}`,
        dueDate: makeIsoDate(fyStartYear, 9, 30),
        priority: "CRITICAL",
        portalName: "MCA V3 Portal (mca.gov.in)",
        portalUrl: "https://www.mca.gov.in",
        instructions:
          "Complete mandatory annual DIN KYC for EVERY Director (who received DIN on/before 31 March) using email + mobile OTP on DIR-3 KYC-WEB (or Form DIR-3 KYC if first time / updating phone or email).",
        penaltyNote: "DIN gets DEACTIVATED + flat ₹5,000 late fee per Director!",
      });
    }

    // MSME-1 H1 (Apr-Sep of selected FY) due Oct 31
    if (!incorpIso || incorpIso <= makeIsoDate(fyStartYear, 9, 30)) {
      specs.push({
        key: `MCA_MSME1_H1_${fyLabel}`,
        title: `Form MSME-1 Half-Yearly Return (Apr–Sep ${fyStartYear})`,
        shortCode: "MSME-1",
        category: "MCA_ROC",
        periodLabel: `Apr–Sep ${fyStartYear}`,
        dueDate: makeIsoDate(fyStartYear, 10, 31),
        priority: "NORMAL",
        portalName: "MCA V3 Portal (mca.gov.in)",
        portalUrl: "https://www.mca.gov.in",
        instructions:
          "Report any overdue payments (>45 days) to Micro & Small Enterprise vendors for Apr–Sep half-year. Mark 'Not Applicable' if there are no overdue MSME payables.",
        penaltyNote: "₹20,000 + ₹1,000/day continuing default (up to ₹3,00,000).",
      });
    }

    // Annual ROC Filings for Previous FY (AGM, ADT-1, AOC-4, MGT-7A)
    if (!incorpIso || incorpIso <= prevFyEndIso) {
      const isFirstFyAudit = incorpFyStart !== null && incorpFyStart === prevFyStart;
      // First AGM is allowed up to 9 months from end of 1st FY (31 Dec); subsequent AGMs within 6 months (30 Sep).
      const agmDue = isFirstFyAudit
        ? makeIsoDate(fyStartYear, 12, 31)
        : makeIsoDate(fyStartYear, 9, 30);
      const adt1Due = addDaysIso(agmDue, 15);
      const aoc4Due = addDaysIso(agmDue, 30);
      const mgt7Due = addDaysIso(agmDue, 60);

      if (companyType !== "OPC") {
        specs.push(
          {
            key: `MCA_AGM_FY_${prevFyLabel}`,
            title: isFirstFyAudit
              ? `First Annual General Meeting — AGM (FY ${prevFyLabel})`
              : `Annual General Meeting — AGM (FY ${prevFyLabel})`,
            shortCode: isFirstFyAudit ? "1st AGM" : "AGM",
            category: "MCA_ROC",
            periodLabel: isFirstFyAudit
              ? `First FY ${prevFyLabel} (9-Month Window)`
              : `FY ${prevFyLabel} Annual`,
            dueDate: agmDue,
            priority: "CRITICAL",
            portalName: "Registered Office / Shareholders Minutes",
            portalUrl: "https://www.mca.gov.in",
            instructions: isFirstFyAudit
              ? `First AGM can be held within 9 months from end of 1st FY (by 31 Dec ${fyStartYear}). Adopt audited Balance Sheet & P&L, Directors' Report, and appoint Statutory Auditor for 5 years.`
              : `Convene AGM within 6 months from FY close (by 30 Sep ${fyStartYear}) with 21 clear days' notice to shareholders. Adopt audited Financial Statements & Directors' Report.`,
            penaltyNote: "Up to ₹1,00,000 + ₹5,000/day continuing default u/s 99.",
          },
          {
            key: `MCA_ADT1_FY_${prevFyLabel}`,
            title: `Form ADT-1 — Statutory Auditor Intimation (FY ${prevFyLabel})`,
            shortCode: "ADT-1",
            category: "MCA_ROC",
            periodLabel: "Within 15 days of AGM",
            dueDate: adt1Due,
            priority: "HIGH",
            portalName: "MCA V3 Portal (mca.gov.in)",
            portalUrl: "https://www.mca.gov.in",
            instructions:
              "File Form ADT-1 with ROC within 15 days of AGM whenever Statutory Auditor is appointed/re-appointed (mandatory at 1st AGM for 5-year term; mark 'Not Applicable' in years 2–5 if already appointed for 5 years).",
            penaltyNote: "Additional ROC fee up to 12x normal filing fee.",
          }
        );
      }

      specs.push(
        {
          key: `MCA_AOC4_FY_${prevFyLabel}`,
          title: `Form AOC-4 — Audited Financial Statements (FY ${prevFyLabel})`,
          shortCode: "AOC-4",
          category: "MCA_ROC",
          periodLabel:
            companyType === "OPC"
              ? `Within 180 days from FY end`
              : `Within 30 days of AGM`,
          dueDate:
            companyType === "OPC" ? makeIsoDate(fyStartYear, 9, 27) : aoc4Due,
          priority: "CRITICAL",
          portalName: "MCA V3 Portal (mca.gov.in)",
          portalUrl: "https://www.mca.gov.in",
          instructions: `File audited Balance Sheet, P&L Statement, Notes to Accounts, Auditor's Report & Board's Report for FY ${prevFyLabel} via Form AOC-4 with CA/CS DSC.`,
          penaltyNote: "₹100/day additional fee with NO maximum cap!",
        },
        {
          key: `MCA_MGT7A_FY_${prevFyLabel}`,
          title: `Form MGT-7A / MGT-7 — Annual Return (FY ${prevFyLabel})`,
          shortCode: "MGT-7A",
          category: "MCA_ROC",
          periodLabel: `Within 60 days of AGM`,
          dueDate: mgt7Due,
          priority: "CRITICAL",
          portalName: "MCA V3 Portal (mca.gov.in)",
          portalUrl: "https://www.mca.gov.in",
          instructions: `File Annual Return (Form MGT-7A for Small Pvt Ltd / OPC; Form MGT-7 for non-small companies) declaring shareholding, directors & meetings for FY ${prevFyLabel}.`,
          penaltyNote: "₹100/day additional fee with NO maximum cap!",
        }
      );
    }
  } else if (isLlp && (!incorpIso || incorpIso <= prevFyEndIso)) {
    specs.push(
      {
        key: `LLP_FORM11_FY_${prevFyLabel}`,
        title: `LLP Form 11 — Annual Return (FY ${prevFyLabel})`,
        shortCode: "Form 11",
        category: "MCA_ROC",
        periodLabel: `FY ${prevFyLabel} Annual`,
        dueDate: makeIsoDate(fyStartYear, 5, 30),
        priority: "CRITICAL",
        portalName: "MCA V3 Portal (mca.gov.in)",
        portalUrl: "https://www.mca.gov.in",
        instructions: `File LLP Annual Return (Form 11) with partner contribution summary for FY ${prevFyLabel} by 30 May.`,
        penaltyNote: "₹100/day late fee with NO upper limit!",
      },
      {
        key: `MCA_DIR3KYC_${fyStartYear}`,
        title: `DIR-3 KYC — Designated Partners DPIN KYC (${fyStartYear})`,
        shortCode: "DIR-3 KYC",
        category: "MCA_ROC",
        periodLabel: `Annual KYC ${fyStartYear}`,
        dueDate: makeIsoDate(fyStartYear, 9, 30),
        priority: "CRITICAL",
        portalName: "MCA V3 Portal (mca.gov.in)",
        portalUrl: "https://www.mca.gov.in",
        instructions:
          "Complete mandatory annual KYC for all Designated Partners holding DPIN/DIN.",
        penaltyNote: "DPIN deactivated + ₹5,000 flat penalty per partner!",
      },
      {
        key: `LLP_FORM8_FY_${prevFyLabel}`,
        title: `LLP Form 8 — Statement of Account & Solvency (FY ${prevFyLabel})`,
        shortCode: "Form 8",
        category: "MCA_ROC",
        periodLabel: `FY ${prevFyLabel} Annual`,
        dueDate: makeIsoDate(fyStartYear, 10, 30),
        priority: "CRITICAL",
        portalName: "MCA V3 Portal (mca.gov.in)",
        portalUrl: "https://www.mca.gov.in",
        instructions: `File LLP Statement of Accounts & Solvency (Form 8) certified by CA/CS for FY ${prevFyLabel} by 30 October.`,
        penaltyNote: "₹100/day late fee with NO upper limit!",
      }
    );
  }

  // =========================================================================
  // 4. INCOME TAX & TDS COMPLIANCES
  // =========================================================================
  // 4a. Monthly TDS Challan 281 (7th of next month; 30 April for March)
  for (let i = 0; i < 12; i++) {
    const m = ((3 + i) % 12) + 1;
    const y = m >= 4 ? fyStartYear : fyEndYear;
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const monthEndIso = makeIsoDate(y, m, lastDay);
    if (incorpIso && monthEndIso < incorpIso) continue;

    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear = m === 12 ? y + 1 : y;
    const dueDay = m === 3 ? 30 : 7;
    const mLabel = `${MONTH_SHORT[m - 1]} ${y}`;

    specs.push({
      key: `IT_TDS_CHALLAN_${y}_${pad2(m)}`,
      title: `TDS Payment — Challan 281 (${mLabel})`,
      shortCode: "TDS 281",
      category: "INCOME_TAX",
      periodLabel: mLabel,
      dueDate: makeIsoDate(nextYear, nextMonth, dueDay),
      priority: "HIGH",
      portalName: "Income Tax e-Pay Tax (incometax.gov.in)",
      portalUrl: "https://www.incometax.gov.in",
      instructions: `Deposit TDS deducted during ${mLabel} (Rent 194I, CA/Professional 194J, Contractors 194C, Salary 192) via Challan ITNS 281. Mark 'Not Applicable' if no TDS applied in ${mLabel}.`,
      penaltyNote: "1.5% per month interest on late deposit of deducted TDS.",
    });
  }

  // 4b. Quarterly TDS Returns (24Q / 26Q)
  const tdsQuarters = [
    ...(incorpIso && incorpIso > prevFyEndIso
      ? []
      : [
          {
            key: `IT_TDS_RET_${prevFyLabel}_Q4`,
            title: `TDS Quarterly Return 24Q/26Q — Q4 (Jan–Mar ${fyStartYear})`,
            periodLabel: `Q4 FY ${prevFyLabel}`,
            dueDate: makeIsoDate(fyStartYear, 5, 31),
          },
        ]),
    {
      key: `IT_TDS_RET_${fyLabel}_Q1`,
      title: `TDS Quarterly Return 24Q/26Q — Q1 (Apr–Jun ${fyStartYear})`,
      periodLabel: `Q1 FY ${fyLabel}`,
      dueDate: makeIsoDate(fyStartYear, 7, 31),
    },
    {
      key: `IT_TDS_RET_${fyLabel}_Q2`,
      title: `TDS Quarterly Return 24Q/26Q — Q2 (Jul–Sep ${fyStartYear})`,
      periodLabel: `Q2 FY ${fyLabel}`,
      dueDate: makeIsoDate(fyStartYear, 10, 31),
    },
    {
      key: `IT_TDS_RET_${fyLabel}_Q3`,
      title: `TDS Quarterly Return 24Q/26Q — Q3 (Oct–Dec ${fyStartYear})`,
      periodLabel: `Q3 FY ${fyLabel}`,
      dueDate: makeIsoDate(fyEndYear, 1, 31),
    },
  ];

  for (const tq of tdsQuarters) {
    if (incorpIso && tq.dueDate < incorpIso) continue;
    specs.push({
      key: tq.key,
      title: tq.title,
      shortCode: "24Q/26Q",
      category: "INCOME_TAX",
      periodLabel: tq.periodLabel,
      dueDate: tq.dueDate,
      priority: "HIGH",
      portalName: "TRACES / Income Tax Portal",
      portalUrl: "https://www.tdscpc.gov.in",
      instructions:
        "File quarterly TDS statements (Form 26Q for non-salary vendor/professional payments, Form 24Q for salaries) on Income Tax / TRACES portal and download Form 16A certificates for vendors. (Mark 'Not Applicable' if zero TDS deducted).",
      penaltyNote: "₹200/day late fee u/s 234E + penalty ₹10,000–₹1,00,000 u/s 271H.",
    });
  }

  // 4c. Advance Tax Installments
  const advTax = [
    { q: "Q1", pct: "15%", due: makeIsoDate(fyStartYear, 6, 15) },
    { q: "Q2", pct: "45%", due: makeIsoDate(fyStartYear, 9, 15) },
    { q: "Q3", pct: "75%", due: makeIsoDate(fyStartYear, 12, 15) },
    { q: "Q4", pct: "100%", due: makeIsoDate(fyEndYear, 3, 15) },
  ];
  for (const at of advTax) {
    if (incorpIso && at.due < incorpIso) continue;
    specs.push({
      key: `IT_ADV_TAX_${fyLabel}_${at.q}`,
      title: `Advance Tax Installment — ${at.q} (${at.pct} Cumulative)`,
      shortCode: `ADV ${at.pct}`,
      category: "INCOME_TAX",
      periodLabel: `FY ${fyLabel} (${at.q})`,
      dueDate: at.due,
      priority: "NORMAL",
      portalName: "Income Tax e-Pay Tax (incometax.gov.in)",
      portalUrl: "https://www.incometax.gov.in",
      instructions: `Pay up to ${at.pct} of estimated annual Income Tax via Challan 280 if estimated FY tax liability exceeds ₹10,000. Mark 'Not Applicable' if estimated tax ≤ ₹10,000.`,
      penaltyNote: "Interest @ 1% per month u/s 234B & 234C on shortfall.",
    });
  }

  // 4d. Tax Audit Report (30 Sep) + Annual Income Tax Return (ITR-6 / ITR-5 / ITR-3)
  if (!incorpIso || incorpIso <= prevFyEndIso) {
    const itrForm = isPvtOrOpc ? "ITR-6" : isLlp ? "ITR-5" : "ITR-3";
    const itrDue = isPvtOrOpc
      ? makeIsoDate(fyStartYear, 10, 31)
      : makeIsoDate(fyStartYear, 7, 31);

    specs.push(
      {
        key: `IT_TAX_AUDIT_FY_${prevFyLabel}`,
        title: `Tax Audit Report — Form 3CA/3CD (FY ${prevFyLabel})`,
        shortCode: "3CA/3CD",
        category: "INCOME_TAX",
        periodLabel: `FY ${prevFyLabel}`,
        dueDate: makeIsoDate(fyStartYear, 9, 30),
        priority: "NORMAL",
        portalName: "Income Tax Portal (incometax.gov.in)",
        portalUrl: "https://www.incometax.gov.in",
        instructions: `Applicable if FY ${prevFyLabel} turnover exceeds ₹1 Crore (or ₹10 Crore where ≥95% receipts & payments are digital). CA uploads Form 3CA/3CD and Director approves on incometax.gov.in. Mark 'Not Applicable' if below threshold.`,
        penaltyNote: "0.5% of turnover (up to ₹1,50,000) u/s 271B.",
      },
      {
        key: `IT_ITR_FY_${prevFyLabel}`,
        title: `Annual Income Tax Return — ${itrForm} (FY ${prevFyLabel})`,
        shortCode: itrForm,
        category: "INCOME_TAX",
        periodLabel: `AY ${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, "0")}`,
        dueDate: itrDue,
        priority: "CRITICAL",
        portalName: "Income Tax Portal (incometax.gov.in)",
        portalUrl: "https://www.incometax.gov.in",
        instructions: isPvtOrOpc
          ? `Mandatory for EVERY Private Limited / OPC company (even with nil revenue or loss). Reconcile AIS/26AS, audited financials, and file ${itrForm} via Director DSC on incometax.gov.in by 31 October.`
          : `Reconcile AIS/26AS, business P&L, and file ${itrForm} on incometax.gov.in.`,
        penaltyNote:
          "Late fee up to ₹5,000 u/s 234F + 1% interest u/s 234A + loss carry-forward lost!",
      }
    );
  }

  // =========================================================================
  // 5. OPTIONAL PF & ESIC MONTHLY FILINGS (15th of next month)
  // =========================================================================
  if (profile.pfEsicApplicable) {
    for (let i = 0; i < 12; i++) {
      const m = ((3 + i) % 12) + 1;
      const y = m >= 4 ? fyStartYear : fyEndYear;
      const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const monthEndIso = makeIsoDate(y, m, lastDay);
      if (incorpIso && monthEndIso < incorpIso) continue;

      const nextMonth = m === 12 ? 1 : m + 1;
      const nextYear = m === 12 ? y + 1 : y;
      const mLabel = `${MONTH_SHORT[m - 1]} ${y}`;

      specs.push({
        key: `PF_ESIC_${y}_${pad2(m)}`,
        title: `EPF & ESIC Monthly Return & Challan (${mLabel})`,
        shortCode: "PF/ESIC",
        category: "PF_ESIC",
        periodLabel: mLabel,
        dueDate: makeIsoDate(nextYear, nextMonth, 15),
        priority: "HIGH",
        portalName: "EPFO Unified & ESIC Portals",
        portalUrl: "https://unifiedportal-emp.epfindia.gov.in",
        instructions: `Generate & upload ECR file on EPFO Employer Portal and pay EPF + ESIC monthly contribution challans for ${mLabel} payroll by 15th.`,
        penaltyNote: "12% p.a. statutory interest + 5%–25% p.a. damages.",
      });
    }
  }

  // Map statutory specs with persisted ComplianceRecord statuses
  return specs.map((spec) => {
    const rec = recordMap.get(spec.key);
    const status = (rec?.status || "PENDING") as ComplianceStatus;
    const daysRemaining = daysDiff(spec.dueDate, todayIso);
    const urgency = computeUrgency(status, daysRemaining);

    return {
      key: spec.key,
      isCustom: false,
      title: spec.title,
      shortCode: spec.shortCode,
      category: spec.category,
      periodLabel: spec.periodLabel,
      dueDate: spec.dueDate,
      daysRemaining,
      urgency,
      priority: spec.priority,
      portalName: spec.portalName,
      portalUrl: spec.portalUrl,
      internalRoute: spec.internalRoute || null,
      internalRouteLabel: spec.internalRouteLabel || null,
      instructions: spec.instructions,
      penaltyNote: spec.penaltyNote,
      status,
      filedDate: toDateOnlyIso(rec?.filedDate),
      referenceNo: rec?.referenceNo || null,
      notes: rec?.notes || null,
      updatedBy: rec?.updatedBy || null,
    };
  });
}

export async function getComplianceCalendar(
  requestedFy?: string | null
): Promise<ComplianceCalendarResponse> {
  const todayIso = getTodayIstIso();
  const currentFyStart = getFinancialYearStartYear(todayIso);
  const selectedFyStart = parseFinancialYearStart(requestedFy);
  const selectedFy = formatFinancialYear(selectedFyStart);
  const currentFinancialYear = formatFinancialYear(currentFyStart);

  const [settings, records, customDates] = await Promise.all([
    getCompanySettings(),
    prisma.complianceRecord.findMany(),
    prisma.customImportantDate.findMany({ orderBy: { dueDate: "asc" } }),
  ]);

  const profile: ComplianceProfile = {
    companyName: settings.name,
    state: settings.state,
    stateCode: settings.stateCode || "06",
    gstin: settings.gstin,
    incorporationDate: toDateOnlyIso(settings.incorporationDate),
    companyType: settings.companyType || "PVT_LTD",
    gstFilingFrequency: settings.gstFilingFrequency || "MONTHLY",
    gstRegistrationDate: toDateOnlyIso(settings.gstRegistrationDate),
    pfEsicApplicable: Boolean(settings.pfEsicApplicable),
  };

  const recordMap = new Map(records.map((r) => [r.complianceKey, r]));
  const statutoryItems = generateStatutoryItems(
    profile,
    selectedFyStart,
    todayIso,
    recordMap
  );

  // Merge CustomImportantDate items (matching selected FY or unfiled urgent on current FY)
  const fyStartIso = `${selectedFyStart}-04-01`;
  const fyEndIso = `${selectedFyStart + 1}-03-31`;

  const customItems: ComplianceCalendarItem[] = [];
  for (const c of customDates) {
    const dueIso = toDateOnlyIso(c.dueDate) || todayIso;
    const status = (c.status || "PENDING") as ComplianceStatus;
    const inSelectedFy = dueIso >= fyStartIso && dueIso <= fyEndIso;
    const showOverdueInCurrent =
      selectedFyStart === currentFyStart &&
      status !== "FILED" &&
      status !== "NOT_APPLICABLE";

    if (!inSelectedFy && !showOverdueInCurrent) continue;

    const daysRemaining = daysDiff(dueIso, todayIso);
    const urgency = computeUrgency(status, daysRemaining);
    const cat = (
      ["POST_INCORP", "GST", "MCA_ROC", "INCOME_TAX", "PF_ESIC", "CUSTOM"].includes(
        c.category
      )
        ? c.category
        : "CUSTOM"
    ) as ComplianceCategory;

    customItems.push({
      key: `custom_${c.id}`,
      customId: c.id,
      isCustom: true,
      title: c.title,
      shortCode: "CUSTOM",
      category: cat,
      periodLabel:
        c.recurrence && c.recurrence !== "NONE"
          ? `Custom • ${c.recurrence}`
          : "Custom Reminder",
      dueDate: dueIso,
      daysRemaining,
      urgency,
      priority: urgency === "OVERDUE" ? "HIGH" : "NORMAL",
      portalName: c.portalName || "Internal / Custom",
      portalUrl: c.portalUrl || null,
      internalRoute: null,
      internalRouteLabel: null,
      instructions:
        c.instructions || "Complete this scheduled company obligation before due date.",
      penaltyNote: c.penaltyNote || null,
      recurrence: c.recurrence || "NONE",
      status,
      filedDate: toDateOnlyIso(c.filedDate),
      referenceNo: c.referenceNo || null,
      notes: c.notes || null,
      updatedBy: c.createdBy || null,
    });
  }

  const allItems = [...statutoryItems, ...customItems].sort((a, b) => {
    // Primary sort: dueDate ascending
    if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    return a.title.localeCompare(b.title);
  });

  const summary: ComplianceSummaryCounts = {
    total: allItems.length,
    overdue: allItems.filter((i) => i.urgency === "OVERDUE").length,
    dueSoon: allItems.filter((i) => i.urgency === "DUE_SOON").length,
    upcoming: allItems.filter((i) => i.urgency === "UPCOMING").length,
    filed: allItems.filter((i) => i.urgency === "FILED").length,
    notApplicable: allItems.filter((i) => i.urgency === "NOT_APPLICABLE").length,
  };

  // Build available FY dropdown list
  const incorpFy = profile.incorporationDate
    ? getFinancialYearStartYear(profile.incorporationDate)
    : currentFyStart - 1;
  const minFy = Math.min(incorpFy, currentFyStart - 1, selectedFyStart);
  const maxFy = Math.max(currentFyStart + 1, selectedFyStart);
  const availableFYs: string[] = [];
  for (let y = maxFy; y >= minFy; y--) {
    availableFYs.push(formatFinancialYear(y));
  }

  return {
    profile,
    financialYear: selectedFy,
    currentFinancialYear,
    availableFYs,
    summary,
    items: allItems,
  };
}

/**
 * Lightweight urgent compliance summary for Web Admin Dashboard & Flutter Mobile Dashboard.
 */
export async function getUpcomingComplianceAlerts(): Promise<ComplianceDashboardAlert> {
  const calendar = await getComplianceCalendar();
  const urgentItems = calendar.items
    .filter((i) => i.urgency === "OVERDUE" || i.urgency === "DUE_SOON")
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return {
    incorporationDateSet: Boolean(calendar.profile.incorporationDate),
    incorporationDate: calendar.profile.incorporationDate,
    gstFilingFrequency: calendar.profile.gstFilingFrequency,
    overdueCount: calendar.summary.overdue,
    dueSoonCount: calendar.summary.dueSoon,
    pendingTotal:
      calendar.summary.overdue +
      calendar.summary.dueSoon +
      calendar.summary.upcoming,
    topItems: urgentItems.slice(0, 4).map((i) => ({
      key: i.key,
      title: i.title,
      category: i.category,
      dueDate: i.dueDate,
      daysRemaining: i.daysRemaining,
      urgency: i.urgency,
      portalName: i.portalName,
      priority: i.priority,
    })),
  };
}
