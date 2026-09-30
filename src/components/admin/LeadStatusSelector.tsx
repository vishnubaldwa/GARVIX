"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusOptions = [
  { value: "NEW", label: "New Lead" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "DEMO_SCHEDULED", label: "Demo Scheduled" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "WON", label: "Closed Won" },
  { value: "LOST", label: "Closed Lost" },
];

export function LeadStatusSelector({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setUpdating(true);

    try {
      await fetch("/api/admin/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      value={status}
      disabled={updating}
      onChange={handleChange}
      className={`rounded-lg py-1 px-2.5 text-xs font-semibold focus:outline-none transition cursor-pointer border ${
        status === "WON"
          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
          : status === "LOST"
          ? "bg-rose-50 text-rose-700 border-rose-300"
          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
      }`}
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
