"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Wrench, X, Pencil, Save, ShieldPlus } from "lucide-react";

export interface SimpleCustomerOption {
  id: string;
  companyName: string;
}

export interface SimpleAmcOption {
  id: string;
  contractNumber: string;
  customerId: string;
  title: string;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function oneYearLaterStr(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return todayStr();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CreateAmcModalButton({
  customers,
}: {
  customers: SimpleCustomerOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(oneYearLaterStr);
  const [visitFrequency, setVisitFrequency] = useState("QUARTERLY");
  const [contractValue, setContractValue] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !title.trim()) {
      setError("Please select a Customer and enter SLA Scope / Title.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/amc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contract",
          customerId,
          title: title.trim(),
          startDate,
          endDate,
          visitFrequency,
          contractValue: Number(contractValue || 0),
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create AMC contract.");
        return;
      }
      setOpen(false);
      setTitle("");
      setContractValue("");
      setNotes("");
      router.refresh();
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCustomerId(customers[0]?.id || "");
          setError("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
      >
        <ShieldPlus className="h-4 w-4" /> New AMC Contract
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create AMC Support Contract</h3>
                <p className="text-[11px] text-slate-500">
                  Track annual maintenance validity, visit schedule &amp; renewal alerts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client / Party *</label>
                {customers.length === 0 ? (
                  <p className="text-rose-600 font-medium">
                    No clients found. Please add a Client first under Parties &amp; Clients.
                  </p>
                ) : (
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SLA Scope / Contract Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual UHF RFID Gate & Software Maintenance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visit Frequency</label>
                  <select
                    value={visitFrequency}
                    onChange={(e) => setVisitFrequency(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    <option value="MONTHLY">Monthly Visits</option>
                    <option value="QUARTERLY">Quarterly Visits</option>
                    <option value="BI_ANNUAL">Bi-Annual (2x / yr)</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Annual Value (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="e.g. 60000"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Coverage Details</label>
                <textarea
                  rows={2}
                  placeholder="Included hardware readers, response SLA hours, spares policy..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full admin-input py-2 px-3 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || customers.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> {loading ? "Saving..." : "Create AMC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function EditAmcModalButton({
  contract,
}: {
  contract: {
    id: string;
    contractNumber: string;
    title: string;
    startDate: string;
    endDate: string;
    contractValue: number;
    visitFrequency: string;
    status: string;
    notes: string | null;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(contract.title);
  const [startDate, setStartDate] = useState(() => toDateInput(contract.startDate));
  const [endDate, setEndDate] = useState(() => toDateInput(contract.endDate));
  const [visitFrequency, setVisitFrequency] = useState(contract.visitFrequency);
  const [contractValue, setContractValue] = useState(String(contract.contractValue));
  const [status, setStatus] = useState(contract.status);
  const [notes, setNotes] = useState(contract.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/amc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contract",
          id: contract.id,
          title: title.trim(),
          startDate,
          endDate,
          visitFrequency,
          contractValue: Number(contractValue || 0),
          status,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update AMC.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTitle(contract.title);
          setStartDate(toDateInput(contract.startDate));
          setEndDate(toDateInput(contract.endDate));
          setVisitFrequency(contract.visitFrequency);
          setContractValue(String(contract.contractValue));
          setStatus(contract.status);
          setNotes(contract.notes || "");
          setError("");
          setOpen(true);
        }}
        title="Edit AMC Contract (Super Admin)"
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 text-left font-sans">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit AMC {contract.contractNumber}</h3>
                <p className="text-[11px] text-slate-500">Super Admin Control</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700 font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SLA Scope / Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={visitFrequency}
                    onChange={(e) => setVisitFrequency(e.target.value)}
                    className="w-full admin-input py-2 px-2"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="BI_ANNUAL">Bi-Annual</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Value (₹)</label>
                  <input
                    type="number"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className="w-full admin-input py-2 px-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full admin-input py-2 px-2"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRING_SOON">EXPIRING SOON</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="RENEWED">RENEWED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full admin-input py-2 px-3 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function CreateTicketModalButton({
  customers,
  contracts,
  staffNames,
}: {
  customers: SimpleCustomerOption[];
  contracts: SimpleAmcOption[];
  staffNames: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [amcId, setAmcId] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const customerAmcs = contracts.filter((c) => c.customerId === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !issueTitle.trim()) {
      setError("Customer and Issue Title are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/amc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ticket",
          customerId,
          amcId: amcId || null,
          issueTitle: issueTitle.trim(),
          description: description.trim() || issueTitle.trim(),
          priority,
          assignedTo: assignedTo.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to log service ticket.");
        return;
      }
      setOpen(false);
      setIssueTitle("");
      setDescription("");
      setAmcId("");
      router.refresh();
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCustomerId(customers[0]?.id || "");
          setAmcId("");
          setError("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
      >
        <PlusCircle className="h-4 w-4 text-blue-600" /> Log Service Ticket
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Log Support / RMA Ticket</h3>
                <p className="text-[11px] text-slate-500">
                  Assign on-site RFID hardware or software support request
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer *</label>
                {customers.length === 0 ? (
                  <p className="text-rose-600 font-medium">Add a client first under Parties &amp; Clients.</p>
                ) : (
                  <select
                    required
                    value={customerId}
                    onChange={(e) => {
                      setCustomerId(e.target.value);
                      setAmcId("");
                    }}
                    className="w-full admin-input py-2 px-3"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {customerAmcs.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Linked AMC Contract (Optional)
                  </label>
                  <select
                    value={amcId}
                    onChange={(e) => setAmcId(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    <option value="">None / Ad-hoc Support</option>
                    {customerAmcs.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.contractNumber} — {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UHF Reader Gate #2 not reading tags"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  placeholder="Symptoms, error codes, hardware serial number..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full admin-input py-2 px-3 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Engineer</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    <option value="">Unassigned</option>
                    {staffNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || customers.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Wrench className="h-3.5 w-3.5" /> {loading ? "Logging..." : "Log Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function UpdateTicketModalButton({
  ticket,
  staffNames,
}: {
  ticket: {
    id: string;
    ticketNumber: string;
    issueTitle: string;
    priority: string;
    status: string;
    assignedTo: string | null;
    resolutionNotes: string | null;
  };
  staffNames: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || "");
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/amc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ticket",
          id: ticket.id,
          status,
          priority,
          assignedTo: assignedTo.trim() || null,
          resolutionNotes: resolutionNotes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update ticket.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStatus(ticket.status);
          setPriority(ticket.priority);
          setAssignedTo(ticket.assignedTo || "");
          setResolutionNotes(ticket.resolutionNotes || "");
          setError("");
          setOpen(true);
        }}
        title="Update Ticket Status & Resolution"
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
      >
        <Wrench className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 text-left font-sans">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Update {ticket.ticketNumber}</h3>
                <p className="text-[11px] text-slate-500 truncate max-w-xs">{ticket.issueTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700 font-medium">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Engineer</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                >
                  <option value="">Unassigned</option>
                  {staffNames.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                  {assignedTo && !staffNames.includes(assignedTo) && (
                    <option value={assignedTo}>{assignedTo}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Summary</label>
                <textarea
                  rows={3}
                  placeholder="Describe fix performed, parts replaced, or next visit notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full admin-input py-2 px-3 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> {saving ? "Updating..." : "Save Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
