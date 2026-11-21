"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileCheck2,
  Filter,
  Loader2,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import type {
  ComplianceCalendarItem,
  ComplianceCalendarResponse,
  ComplianceCategory,
  ComplianceStatus,
} from "@/lib/compliance-engine";

interface Props {
  initialData: ComplianceCalendarResponse;
  isSuperAdmin: boolean;
}

const CATEGORY_META: Record<
  ComplianceCategory | "ALL",
  { label: string; shortLabel: string; badgeClass: string }
> = {
  ALL: {
    label: "All Compliances",
    shortLabel: "All",
    badgeClass: "bg-slate-100 text-slate-700",
  },
  POST_INCORP: {
    label: "Post-Incorporation",
    shortLabel: "Post-Incorp",
    badgeClass: "bg-purple-50 text-purple-700 border border-purple-200/80",
  },
  GST: {
    label: "GST Returns",
    shortLabel: "GST",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
  },
  MCA_ROC: {
    label: "MCA / ROC",
    shortLabel: "MCA / ROC",
    badgeClass: "bg-blue-50 text-[#0071e3] border border-blue-200/80",
  },
  INCOME_TAX: {
    label: "Income Tax & TDS",
    shortLabel: "Tax & TDS",
    badgeClass: "bg-amber-50 text-amber-800 border border-amber-200/80",
  },
  PF_ESIC: {
    label: "PF & ESIC",
    shortLabel: "PF / ESIC",
    badgeClass: "bg-cyan-50 text-cyan-800 border border-cyan-200/80",
  },
  CUSTOM: {
    label: "Custom Dates",
    shortLabel: "Custom",
    badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
  },
};

function formatDisplayDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const parts = iso.slice(0, 10).split("-").map(Number);
  if (parts.length !== 3) return iso;
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getDateBadgeParts(iso: string): { day: string; month: string; year: string } {
  const parts = iso.slice(0, 10).split("-").map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return {
    day: String(parts[2]).padStart(2, "0"),
    month: d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }).toUpperCase(),
    year: String(parts[0]),
  };
}

function getCountdownLabel(item: ComplianceCalendarItem): string {
  if (item.status === "FILED") {
    return item.filedDate ? `Filed ${formatDisplayDate(item.filedDate)}` : "Filed";
  }
  if (item.status === "NOT_APPLICABLE") return "Not Applicable";
  if (item.daysRemaining < 0) {
    const overdue = Math.abs(item.daysRemaining);
    return overdue === 1 ? "Overdue by 1 day" : `Overdue by ${overdue} days`;
  }
  if (item.daysRemaining === 0) return "Due Today";
  if (item.daysRemaining === 1) return "Due Tomorrow";
  return `In ${item.daysRemaining} days`;
}

export function ImportantDatesManager({ initialData, isSuperAdmin }: Props) {
  const [data, setData] = useState<ComplianceCalendarResponse>(initialData);
  const [loadingFy, setLoadingFy] = useState(false);

  // Setup card state
  const [setupOpen, setSetupOpen] = useState(!initialData.profile.incorporationDate);
  const [incorporationDate, setIncorporationDate] = useState(
    initialData.profile.incorporationDate || ""
  );
  const [companyType, setCompanyType] = useState(
    initialData.profile.companyType || "PVT_LTD"
  );
  const [gstFilingFrequency, setGstFilingFrequency] = useState(
    initialData.profile.gstFilingFrequency || "MONTHLY"
  );
  const [gstRegistrationDate, setGstRegistrationDate] = useState(
    initialData.profile.gstRegistrationDate || ""
  );
  const [pfEsicApplicable, setPfEsicApplicable] = useState(
    initialData.profile.pfEsicApplicable
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ComplianceCategory | "ALL">("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState<
    "ALL" | "ACTION_NEEDED" | "OVERDUE" | "DUE_SOON" | "UPCOMING" | "FILED"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Status update modal
  const [statusModalItem, setStatusModalItem] = useState<ComplianceCalendarItem | null>(null);
  const [modalStatus, setModalStatus] = useState<ComplianceStatus>("FILED");
  const [modalFiledDate, setModalFiledDate] = useState("");
  const [modalRefNo, setModalRefNo] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  // Custom date add/edit modal
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [cTitle, setCTitle] = useState("");
  const [cCategory, setCCategory] = useState<ComplianceCategory>("CUSTOM");
  const [cDueDate, setCDueDate] = useState("");
  const [cPortalName, setCPortalName] = useState("");
  const [cPortalUrl, setCPortalUrl] = useState("");
  const [cInstructions, setCInstructions] = useState("");
  const [cPenalty, setCPenalty] = useState("");
  const [cRecurrence, setCRecurrence] = useState("NONE");
  const [savingCustom, setSavingCustom] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshCalendar = async (targetFy?: string) => {
    const fy = targetFy || data.financialYear;
    setLoadingFy(true);
    try {
      const res = await fetch(`/api/admin/important-dates?fy=${encodeURIComponent(fy)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load compliance calendar");
      setData(json);
    } catch (err: any) {
      showToast("error", err.message || "Unable to refresh calendar.");
    } finally {
      setLoadingFy(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/important-dates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incorporationDate: incorporationDate || null,
          companyType,
          gstFilingFrequency,
          gstRegistrationDate: gstRegistrationDate || null,
          pfEsicApplicable,
          fy: data.financialYear,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save compliance setup");
      setData(json);
      setSetupOpen(false);
      showToast(
        "success",
        "Company compliance profile saved! All statutory dates recalculated."
      );
    } catch (err: any) {
      showToast("error", err.message || "Failed to save setup.");
    } finally {
      setSavingProfile(false);
    }
  };

  const openStatusModal = (item: ComplianceCalendarItem) => {
    setStatusModalItem(item);
    setModalStatus(item.status === "PENDING" ? "FILED" : item.status);
    setModalFiledDate(
      item.filedDate || new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10)
    );
    setModalRefNo(item.referenceNo || "");
    setModalNotes(item.notes || "");
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalItem) return;
    setSavingStatus(true);
    try {
      const payload = statusModalItem.isCustom
        ? {
            customId: statusModalItem.customId,
            status: modalStatus,
            filedDate: modalStatus === "FILED" ? modalFiledDate : null,
            referenceNo: modalRefNo,
            notes: modalNotes,
          }
        : {
            complianceKey: statusModalItem.key,
            financialYear: data.financialYear,
            status: modalStatus,
            filedDate: modalStatus === "FILED" ? modalFiledDate : null,
            referenceNo: modalRefNo,
            notes: modalNotes,
          };

      const res = await fetch("/api/admin/important-dates/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");

      setStatusModalItem(null);
      await refreshCalendar();
      showToast("success", `Updated "${statusModalItem.shortCode}" to ${modalStatus.replace("_", " ")}.`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to save status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const openCreateCustomModal = () => {
    setEditingCustomId(null);
    setCTitle("");
    setCCategory("CUSTOM");
    setCDueDate(new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10));
    setCPortalName("");
    setCPortalUrl("");
    setCInstructions("");
    setCPenalty("");
    setCRecurrence("NONE");
    setCustomModalOpen(true);
  };

  const openEditCustomModal = (item: ComplianceCalendarItem) => {
    if (!item.customId) return;
    setEditingCustomId(item.customId);
    setCTitle(item.title);
    setCCategory(item.category);
    setCDueDate(item.dueDate);
    setCPortalName(item.portalName === "Internal / Custom" ? "" : item.portalName);
    setCPortalUrl(item.portalUrl || "");
    setCInstructions(item.instructions || "");
    setCPenalty(item.penaltyNote || "");
    setCRecurrence(item.recurrence || "NONE");
    setCustomModalOpen(true);
  };

  const handleSaveCustomDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle.trim() || !cDueDate) {
      showToast("error", "Title and Due Date are required.");
      return;
    }
    setSavingCustom(true);
    try {
      const endpoint = editingCustomId
        ? `/api/admin/important-dates/${editingCustomId}`
        : "/api/admin/important-dates";
      const method = editingCustomId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cTitle.trim(),
          category: cCategory,
          dueDate: cDueDate,
          portalName: cPortalName.trim() || null,
          portalUrl: cPortalUrl.trim() || null,
          instructions: cInstructions.trim() || null,
          penaltyNote: cPenalty.trim() || null,
          recurrence: cRecurrence,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save custom date");

      setCustomModalOpen(false);
      await refreshCalendar();
      showToast(
        "success",
        editingCustomId ? "Custom date updated!" : "Custom important date added!"
      );
    } catch (err: any) {
      showToast("error", err.message || "Failed to save custom date.");
    } finally {
      setSavingCustom(false);
    }
  };

  const handleDeleteCustomDate = async (item: ComplianceCalendarItem) => {
    if (!item.customId || !isSuperAdmin) return;
    const confirmed = window.confirm(
      `Permanently delete custom date "${item.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/important-dates/${item.customId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      await refreshCalendar();
      showToast("success", `Deleted "${item.title}".`);
    } catch (err: any) {
      showToast("error", err.message || "Delete failed.");
    }
  };

  const buildWhatsAppLink = (item: ComplianceCalendarItem) => {
    const lines = [
      `*GARVIX Statutory Compliance Reminder*`,
      `Company: ${data.profile.companyName}`,
      `Compliance: *${item.title}*`,
      `Due Date: *${formatDisplayDate(item.dueDate)}* (${getCountdownLabel(item)})`,
      `Where / Portal: ${item.portalName}${item.portalUrl ? ` (${item.portalUrl})` : ""}`,
      `What to Do: ${item.instructions}`,
      item.penaltyNote ? `Penalty Risk: ${item.penaltyNote}` : "",
    ].filter(Boolean);
    return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: data.items.length };
    for (const item of data.items) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [data.items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.items.filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      if (urgencyFilter === "ACTION_NEEDED") {
        if (item.urgency !== "OVERDUE" && item.urgency !== "DUE_SOON") return false;
      } else if (urgencyFilter !== "ALL") {
        if (item.urgency !== urgencyFilter) return false;
      }
      if (q) {
        const hay =
          `${item.title} ${item.shortCode} ${item.portalName} ${item.instructions} ${item.periodLabel} ${item.referenceNo || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.items, selectedCategory, urgencyFilter, searchQuery]);

  const visibleCategories: Array<ComplianceCategory | "ALL"> = [
    "ALL",
    "POST_INCORP",
    "GST",
    "MCA_ROC",
    "INCOME_TAX",
    ...(data.profile.pfEsicApplicable || (categoryCounts.PF_ESIC || 0) > 0
      ? (["PF_ESIC"] as const)
      : []),
    "CUSTOM",
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-semibold shadow-xl border ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-rose-600 text-white border-rose-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-[#0071e3]">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Indian Statutory Compliance Calendar • {data.profile.state} ({data.profile.stateCode})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight mt-1.5">
            Important Dates &amp; Compliances
          </h1>
          <p className="text-xs text-[#6e6e73] mt-1">
            Auto-calculated MCA/ROC, GST ({data.profile.gstFilingFrequency}), Income Tax, TDS &amp; Post-Incorporation deadlines — with exact portal links &amp; step-by-step instructions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* FY Selector */}
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1d1d1f] shadow-xs">
            <span className="text-[#86868b] font-medium">FY</span>
            <select
              value={data.financialYear}
              onChange={(e) => refreshCalendar(e.target.value)}
              disabled={loadingFy}
              className="bg-transparent outline-none font-bold text-[#1d1d1f] cursor-pointer"
            >
              {data.availableFYs.map((fy) => (
                <option key={fy} value={fy}>
                  {fy} {fy === data.currentFinancialYear ? "(Current)" : ""}
                </option>
              ))}
            </select>
            {loadingFy && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0071e3]" />}
          </div>

          <button
            onClick={() => setSetupOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-[#f5f5f7] px-4 py-2 text-xs font-semibold text-[#1d1d1f] shadow-xs transition"
          >
            <Settings2 className="h-3.5 w-3.5 text-[#0071e3]" />
            <span>Company Setup</span>
            {setupOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-[#86868b]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[#86868b]" />
            )}
          </button>

          <button
            onClick={openCreateCustomModal}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Custom Date</span>
          </button>
        </div>
      </div>

      {/* Company Setup Summary Pill (when collapsed) */}
      {!setupOpen && (
        <div className="rounded-2xl border border-black/[0.06] bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#0071e3]" />
              <span className="text-[#86868b]">Incorporation Date:</span>
              <span className="font-bold text-[#1d1d1f]">
                {data.profile.incorporationDate
                  ? formatDisplayDate(data.profile.incorporationDate)
                  : "Not Set"}
              </span>
            </div>
            <div>
              <span className="text-[#86868b]">Entity:</span>{" "}
              <span className="font-semibold text-[#1d1d1f]">
                {data.profile.companyType.replace("_", " ")}
              </span>
            </div>
            <div>
              <span className="text-[#86868b]">GST Scheme:</span>{" "}
              <span className="font-semibold text-emerald-700">
                {data.profile.gstFilingFrequency === "MONTHLY"
                  ? "Monthly (GSTR-1 & 3B)"
                  : data.profile.gstFilingFrequency === "QUARTERLY"
                  ? "Quarterly (QRMP)"
                  : "Not Applicable"}
              </span>
            </div>
            {data.profile.gstRegistrationDate && (
              <div>
                <span className="text-[#86868b]">GST Reg:</span>{" "}
                <span className="font-semibold text-[#1d1d1f]">
                  {formatDisplayDate(data.profile.gstRegistrationDate)}
                </span>
              </div>
            )}
            <div>
              <span className="text-[#86868b]">PF / ESIC:</span>{" "}
              <span className="font-semibold text-[#1d1d1f]">
                {data.profile.pfEsicApplicable ? "Enabled (15th Monthly)" : "Off"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSetupOpen(true)}
            className="text-[#0071e3] font-semibold hover:underline"
          >
            Edit Setup →
          </button>
        </div>
      )}

      {/* Company Compliance Setup Form Card */}
      {setupOpen && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 sm:p-6 shadow-[0_6px_24px_rgba(0,113,227,0.06)] space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#1d1d1f]">
                Company Incorporation &amp; Filing Profile
              </h2>
              <p className="text-xs text-[#6e6e73] mt-0.5">
                Enter your Date of Incorporation (from Certificate of Incorporation / COI) and GST filing frequency. GARVIX will auto-calculate every ROC, GST, TDS, and Income Tax due date.
              </p>
            </div>
            {data.profile.incorporationDate && (
              <button
                type="button"
                onClick={() => setSetupOpen(false)}
                className="rounded-lg p-1.5 text-[#86868b] hover:bg-black/[0.05]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#424245] mb-1.5">
                Date of Incorporation (DOI) *
              </label>
              <input
                type="date"
                value={incorporationDate}
                onChange={(e) => setIncorporationDate(e.target.value)}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-xs font-medium text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-[10px] text-[#86868b] mt-1">
                Calculates 30d, 60d, 180d (INC-20A) &amp; 1st AGM automatically
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#424245] mb-1.5">
                Company Entity Type
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-xs font-medium text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100"
              >
                <option value="PVT_LTD">Private Limited (Pvt. Ltd.)</option>
                <option value="OPC">One Person Company (OPC)</option>
                <option value="LLP">Limited Liability Partnership (LLP)</option>
                <option value="PROPRIETORSHIP">Proprietorship / Firm</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#424245] mb-1.5">
                GST Return Filing Scheme
              </label>
              <select
                value={gstFilingFrequency}
                onChange={(e) => setGstFilingFrequency(e.target.value)}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-xs font-medium text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100"
              >
                <option value="MONTHLY">Monthly (GSTR-1 on 11th &amp; 3B on 20th)</option>
                <option value="QUARTERLY">Quarterly — QRMP (IFF, PMT-06 &amp; Qtr 1/3B)</option>
                <option value="NONE">Not GST Registered</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#424245] mb-1.5">
                GST Registration Date (Optional)
              </label>
              <input
                type="date"
                value={gstRegistrationDate}
                onChange={(e) => setGstRegistrationDate(e.target.value)}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-xs font-medium text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-[10px] text-[#86868b] mt-1">
                Leave empty to start GST returns from Incorporation Date
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-black/[0.06]">
            <label className="inline-flex items-center gap-2.5 text-xs font-medium text-[#1d1d1f] cursor-pointer">
              <input
                type="checkbox"
                checked={pfEsicApplicable}
                onChange={(e) => setPfEsicApplicable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#0071e3] focus:ring-[#0071e3]"
              />
              <span>
                Enable monthly <strong>PF &amp; ESIC</strong> compliance reminders (15th of every month)
              </span>
            </label>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-60 px-5 py-2 text-xs font-semibold text-white shadow-sm transition"
            >
              {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save &amp; Generate Calendar</span>
            </button>
          </div>
        </form>
      )}

      {/* 4 Interactive KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() =>
            setUrgencyFilter((cur) => (cur === "OVERDUE" ? "ALL" : "OVERDUE"))
          }
          className={`text-left rounded-3xl border p-5 transition shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${
            urgencyFilter === "OVERDUE"
              ? "border-rose-400 bg-rose-50/70 ring-2 ring-rose-200"
              : "border-black/[0.06] bg-white hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868b]">
            <span>Overdue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-3xl font-bold text-rose-600 tracking-tight">
            {data.summary.overdue}
          </p>
          <p className="mt-1 text-[11px] text-[#86868b]">Needs immediate filing</p>
        </button>

        <button
          type="button"
          onClick={() =>
            setUrgencyFilter((cur) => (cur === "DUE_SOON" ? "ALL" : "DUE_SOON"))
          }
          className={`text-left rounded-3xl border p-5 transition shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${
            urgencyFilter === "DUE_SOON"
              ? "border-amber-400 bg-amber-50/70 ring-2 ring-amber-200"
              : "border-black/[0.06] bg-white hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868b]">
            <span>Due Within 15 Days</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-3xl font-bold text-amber-600 tracking-tight">
            {data.summary.dueSoon}
          </p>
          <p className="mt-1 text-[11px] text-[#86868b]">Prepare &amp; coordinate CA</p>
        </button>

        <button
          type="button"
          onClick={() =>
            setUrgencyFilter((cur) => (cur === "UPCOMING" ? "ALL" : "UPCOMING"))
          }
          className={`text-left rounded-3xl border p-5 transition shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${
            urgencyFilter === "UPCOMING"
              ? "border-blue-400 bg-blue-50/70 ring-2 ring-blue-200"
              : "border-black/[0.06] bg-white hover:border-blue-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868b]">
            <span>Upcoming (FY {data.financialYear})</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#0071e3]">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-3xl font-bold text-[#1d1d1f] tracking-tight">
            {data.summary.upcoming}
          </p>
          <p className="mt-1 text-[11px] text-[#86868b]">Scheduled later this FY</p>
        </button>

        <button
          type="button"
          onClick={() =>
            setUrgencyFilter((cur) => (cur === "FILED" ? "ALL" : "FILED"))
          }
          className={`text-left rounded-3xl border p-5 transition shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${
            urgencyFilter === "FILED"
              ? "border-emerald-400 bg-emerald-50/70 ring-2 ring-emerald-200"
              : "border-black/[0.06] bg-white hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868b]">
            <span>Filed / Completed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-3xl font-bold text-emerald-700 tracking-tight">
            {data.summary.filed}
          </p>
          <p className="mt-1 text-[11px] text-[#86868b]">
            {data.summary.notApplicable > 0
              ? `+ ${data.summary.notApplicable} marked N/A`
              : "SRN / ARN archived"}
          </p>
        </button>
      </div>

      {/* Category Tabs & Search Filter Bar */}
      <div className="rounded-3xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleCategories.map((cat) => {
            const active = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-[#1d1d1f] text-white shadow-xs"
                    : "bg-[#f5f5f7] text-[#424245] hover:bg-black/[0.08]"
                }`}
              >
                <span>{CATEGORY_META[cat].label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-white text-[#6e6e73]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2 border-t border-black/[0.05]">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search INC-20A, GSTR-3B, DIR-3 KYC, TDS, ITR-6, portal..."
              className="w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7]/70 pl-9 pr-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-[#86868b] mr-0.5 hidden sm:block" />
            {(
              [
                { id: "ALL", label: "All" },
                { id: "ACTION_NEEDED", label: "Urgent (≤15d)" },
                { id: "OVERDUE", label: "Overdue" },
                { id: "DUE_SOON", label: "Due Soon" },
                { id: "FILED", label: "Filed" },
              ] as const
            ).map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setUrgencyFilter(pill.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  urgencyFilter === pill.id
                    ? "bg-[#0071e3] text-white"
                    : "bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f]"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-black/[0.06] bg-white p-10 text-center space-y-2">
            <CalendarClock className="h-9 w-9 text-[#86868b] mx-auto" />
            <p className="text-sm font-semibold text-[#1d1d1f]">
              No compliance items match this filter
            </p>
            <p className="text-xs text-[#86868b]">
              Try switching to &ldquo;All&rdquo;, selecting another Financial Year, or adding a custom reminder date.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const dateBadge = getDateBadgeParts(item.dueDate);
            const catMeta = CATEGORY_META[item.category];

            const borderStyle =
              item.urgency === "OVERDUE"
                ? "border-rose-200/90 bg-rose-50/20"
                : item.urgency === "DUE_SOON"
                ? "border-amber-200/90 bg-amber-50/20"
                : item.urgency === "FILED"
                ? "border-emerald-200/70 bg-emerald-50/15"
                : "border-black/[0.06] bg-white";

            const dateBoxStyle =
              item.urgency === "OVERDUE"
                ? "bg-rose-600 text-white"
                : item.urgency === "DUE_SOON"
                ? "bg-amber-500 text-white"
                : item.urgency === "FILED"
                ? "bg-emerald-600 text-white"
                : item.urgency === "NOT_APPLICABLE"
                ? "bg-slate-200 text-slate-600"
                : "bg-[#1d1d1f] text-white";

            const countdownStyle =
              item.urgency === "OVERDUE"
                ? "bg-rose-100 text-rose-700"
                : item.urgency === "DUE_SOON"
                ? "bg-amber-100 text-amber-800"
                : item.urgency === "FILED"
                ? "bg-emerald-100 text-emerald-700"
                : item.urgency === "NOT_APPLICABLE"
                ? "bg-slate-100 text-slate-600"
                : "bg-blue-50 text-[#0071e3]";

            return (
              <div
                key={item.key}
                className={`rounded-3xl border p-4 sm:p-5 transition shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] ${borderStyle}`}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left Calendar Date Tile (KAB) */}
                  <div className="flex md:flex-col items-center md:justify-center gap-3 md:gap-0 shrink-0">
                    <div
                      className={`flex flex-col items-center justify-center rounded-2xl w-16 h-16 sm:w-18 sm:h-18 shrink-0 shadow-xs ${dateBoxStyle}`}
                    >
                      <span className="text-[10px] font-bold tracking-wider opacity-90">
                        {dateBadge.month}
                      </span>
                      <span className="text-xl sm:text-2xl font-black leading-none my-0.5">
                        {dateBadge.day}
                      </span>
                      <span className="text-[10px] font-semibold opacity-80">
                        {dateBadge.year}
                      </span>
                    </div>
                    <span
                      className={`md:mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${countdownStyle}`}
                    >
                      {getCountdownLabel(item)}
                    </span>
                  </div>

                  {/* Middle Content: KYA + KAHA */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${catMeta.badgeClass}`}
                      >
                        {catMeta.shortLabel}
                      </span>
                      <span className="rounded-full bg-[#f5f5f7] border border-black/[0.06] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#1d1d1f]">
                        {item.shortCode}
                      </span>
                      <span className="text-[11px] font-medium text-[#86868b]">
                        {item.periodLabel}
                      </span>
                      {item.priority === "CRITICAL" && item.status !== "FILED" && (
                        <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          CRITICAL
                        </span>
                      )}
                      {item.status === "IN_PROGRESS" && (
                        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          IN PROGRESS
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#1d1d1f] leading-snug">
                      {item.title}
                    </h3>

                    {/* What to Do (KYA) */}
                    <p className="text-xs text-[#424245] leading-relaxed">
                      <strong className="text-[#1d1d1f]">What to do: </strong>
                      {item.instructions}
                    </p>

                    {/* Where (KAHA) + Internal Link */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {item.portalUrl ? (
                        <a
                          href={item.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-black/[0.08] hover:border-[#0071e3] px-3 py-1.5 text-[11px] font-semibold text-[#1d1d1f] transition"
                        >
                          <span className="text-[#86868b]">Where:</span>
                          <span className="text-[#0071e3]">{item.portalName}</span>
                          <ExternalLink className="h-3 w-3 text-[#0071e3]" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-black/[0.08] px-3 py-1.5 text-[11px] font-semibold text-[#424245]">
                          <span className="text-[#86868b]">Where:</span>
                          <span>{item.portalName}</span>
                        </span>
                      )}

                      {item.internalRoute && (
                        <Link
                          href={item.internalRoute}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 transition"
                        >
                          <span>{item.internalRouteLabel || "Open in GARVIX"} →</span>
                        </Link>
                      )}
                    </div>

                    {/* Penalty Note */}
                    {item.penaltyNote && item.status !== "FILED" && item.status !== "NOT_APPLICABLE" && (
                      <div className="flex items-start gap-1.5 rounded-xl bg-amber-50/80 border border-amber-200/70 px-3 py-2 text-[11px] text-amber-900">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Late Fee / Penalty:</strong> {item.penaltyNote}
                        </span>
                      </div>
                    )}

                    {/* Filed Reference / Notes Strip */}
                    {(item.referenceNo || item.notes) && (
                      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white/90 border border-black/[0.06] px-3 py-2 text-[11px] text-[#424245]">
                        {item.referenceNo && (
                          <span>
                            <strong className="text-[#1d1d1f]">SRN / ARN / Ref:</strong>{" "}
                            <span className="font-mono font-semibold text-emerald-700">
                              {item.referenceNo}
                            </span>
                          </span>
                        )}
                        {item.notes && (
                          <span>
                            <strong className="text-[#1d1d1f]">Note:</strong> {item.notes}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Actions Column */}
                  <div className="flex md:flex-col items-center md:items-end justify-start gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/[0.05]">
                    <button
                      type="button"
                      onClick={() => openStatusModal(item)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition w-auto md:w-36 ${
                        item.status === "FILED"
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                          : "bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-xs"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        {item.status === "FILED"
                          ? "Update Filing"
                          : item.status === "NOT_APPLICABLE"
                          ? "Marked N/A"
                          : "Mark Filed"}
                      </span>
                    </button>

                    <a
                      href={buildWhatsAppLink(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-white hover:bg-emerald-50 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition md:w-36"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp CA</span>
                    </a>

                    {item.isCustom && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditCustomModal(item)}
                          className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-white hover:bg-[#f5f5f7] px-2.5 py-1 text-[11px] font-semibold text-[#424245] transition"
                          title="Edit Custom Date"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomDate(item)}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700 transition"
                            title="Permanent Delete (Super Admin Only)"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Mark Filed / Update Compliance Status */}
      {statusModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveStatus}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/[0.08] space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071e3]">
                  Update Compliance Status
                </span>
                <h3 className="text-base font-bold text-[#1d1d1f] mt-0.5">
                  {statusModalItem.title}
                </h3>
                <p className="text-[11px] text-[#86868b] mt-0.5">
                  Due: {formatDisplayDate(statusModalItem.dueDate)} • {statusModalItem.portalName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalItem(null)}
                className="rounded-lg p-1.5 text-[#86868b] hover:bg-black/[0.05]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as ComplianceStatus)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs font-semibold text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                >
                  <option value="FILED">Filed / Completed</option>
                  <option value="IN_PROGRESS">In Progress (With CA)</option>
                  <option value="PENDING">Pending</option>
                  <option value="NOT_APPLICABLE">Not Applicable (Exempt / Nil)</option>
                </select>
              </div>

              {modalStatus === "FILED" && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                    Filed / Completed Date
                  </label>
                  <input
                    type="date"
                    value={modalFiledDate}
                    onChange={(e) => setModalFiledDate(e.target.value)}
                    className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  SRN / ARN / Challan / Acknowledgement No. (Optional)
                </label>
                <input
                  type="text"
                  value={modalRefNo}
                  onChange={(e) => setModalRefNo(e.target.value)}
                  placeholder="e.g. AA060526123456Z or SRN AB1234567"
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs font-mono text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  Remarks / CA Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Filed by CA Sharma, challan saved in Vault"
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06]">
              <button
                type="button"
                onClick={() => setStatusModalItem(null)}
                className="rounded-full border border-black/[0.08] px-4 py-2 text-xs font-semibold text-[#424245] hover:bg-[#f5f5f7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingStatus}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-60 px-5 py-2 text-xs font-semibold text-white"
              >
                {savingStatus && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Status</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Add / Edit Custom Important Date */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveCustomDate}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-black/[0.08] space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#1d1d1f]">
                  {editingCustomId ? "Edit Custom Important Date" : "Add Custom Important Date"}
                </h3>
                <p className="text-[11px] text-[#86868b] mt-0.5">
                  Track DSC renewal, Office Rent Agreement, Trademark, ISO Audit, Domain/Hosting, or custom legal deadlines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="rounded-lg p-1.5 text-[#86868b] hover:bg-black/[0.05]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  placeholder="e.g. Director Class-3 DSC Renewal"
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={cDueDate}
                  onChange={(e) => setCDueDate(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  Category
                </label>
                <select
                  value={cCategory}
                  onChange={(e) => setCCategory(e.target.value as ComplianceCategory)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                >
                  <option value="CUSTOM">Custom / Operations</option>
                  <option value="MCA_ROC">MCA / ROC</option>
                  <option value="GST">GST</option>
                  <option value="INCOME_TAX">Income Tax &amp; TDS</option>
                  <option value="PF_ESIC">PF &amp; ESIC</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  Where / Portal Name
                </label>
                <input
                  type="text"
                  value={cPortalName}
                  onChange={(e) => setCPortalName(e.target.value)}
                  placeholder="e.g. eMudhra / Haryana Trade License"
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  Portal URL (Optional)
                </label>
                <input
                  type="text"
                  value={cPortalUrl}
                  onChange={(e) => setCPortalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  What to Do (Instructions)
                </label>
                <textarea
                  rows={2}
                  value={cInstructions}
                  onChange={(e) => setCInstructions(e.target.value)}
                  placeholder="Step-by-step instructions or documents required..."
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  Penalty / Risk Note (Optional)
                </label>
                <input
                  type="text"
                  value={cPenalty}
                  onChange={(e) => setCPenalty(e.target.value)}
                  placeholder="e.g. Cannot sign MCA/GST forms if expired"
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#424245] mb-1">
                  Recurrence Tag
                </label>
                <select
                  value={cRecurrence}
                  onChange={(e) => setCRecurrence(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:bg-white focus:border-[#0071e3]"
                >
                  <option value="NONE">One-Time</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06]">
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="rounded-full border border-black/[0.08] px-4 py-2 text-xs font-semibold text-[#424245] hover:bg-[#f5f5f7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingCustom}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-60 px-5 py-2 text-xs font-semibold text-white"
              >
                {savingCustom && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{editingCustomId ? "Save Changes" : "Add Date"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
