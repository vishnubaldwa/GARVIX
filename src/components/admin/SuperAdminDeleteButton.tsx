"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function SuperAdminDeleteButton({
  entity,
  id,
  label,
}: {
  entity:
    | "client"
    | "quotation"
    | "invoice"
    | "lead"
    | "challan"
    | "product"
    | "serial"
    | "amc"
    | "ticket"
    | "expense"
    | "purchase";
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Permanently delete ${label}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/records?entity=${encodeURIComponent(entity)}&id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        alert(data.error || "Failed to delete record.");
      }
    } catch {
      alert("Network error while deleting record.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      title={`Delete ${label} (Super Admin Only)`}
      className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50"
    >
      {deleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
