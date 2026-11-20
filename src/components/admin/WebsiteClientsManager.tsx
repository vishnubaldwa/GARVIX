"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Upload,
  X,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";

export interface WebsiteClientRow {
  id: string;
  name: string;
  industry: string | null;
  websiteUrl: string | null;
  hasLogo: boolean;
  logoUrl: string | null;
  displayOrder: number;
  isVisible: boolean;
}

export function WebsiteClientsManager({
  initialClients,
  isSuperAdmin,
}: {
  initialClients: WebsiteClientRow[];
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const createFileRef = useRef<HTMLInputElement | null>(null);
  const editFileRef = useRef<HTMLInputElement | null>(null);

  const [clients, setClients] = useState<WebsiteClientRow[]>(initialClients);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  // Create form state
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Edit modal state
  const [editing, setEditing] = useState<WebsiteClientRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState("");
  const [editOrder, setEditOrder] = useState("0");
  const [editVisible, setEditVisible] = useState(true);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editRemoveLogo, setEditRemoveLogo] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Client / Brand Name is required.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (industry.trim()) formData.append("industry", industry.trim());
      if (websiteUrl.trim()) formData.append("websiteUrl", websiteUrl.trim());
      formData.append("displayOrder", displayOrder || "0");
      formData.append("isVisible", "true");
      if (logoFile) formData.append("logo", logoFile);

      const res = await fetch("/api/admin/website-clients", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add client.");
        return;
      }

      setClients((prev) =>
        [...prev, data.client].sort((a, b) => a.displayOrder - b.displayOrder)
      );
      setName("");
      setIndustry("");
      setWebsiteUrl("");
      setDisplayOrder("0");
      setLogoFile(null);
      setLogoPreview(null);
      if (createFileRef.current) createFileRef.current.value = "";
      showToast(`"${data.client.name}" added to garvix.in homepage!`);
      router.refresh();
    } catch {
      setError("Network error while adding client.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleVisible = async (client: WebsiteClientRow) => {
    const next = !client.isVisible;
    try {
      const res = await fetch(`/api/admin/website-clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: next }),
      });
      const data = await res.json();
      if (res.ok) {
        setClients((prev) =>
          prev.map((c) => (c.id === client.id ? { ...c, isVisible: next } : c))
        );
        showToast(
          next
            ? `"${client.name}" is now LIVE on garvix.in.`
            : `"${client.name}" hidden from homepage.`
        );
        router.refresh();
      } else {
        alert(data.error || "Failed to update visibility.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const openEditModal = (c: WebsiteClientRow) => {
    setEditing(c);
    setEditName(c.name);
    setEditIndustry(c.industry || "");
    setEditWebsiteUrl(c.websiteUrl || "");
    setEditOrder(String(c.displayOrder));
    setEditVisible(c.isVisible);
    setEditLogoFile(null);
    setEditRemoveLogo(false);
    setEditError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editName.trim()) {
      setEditError("Client Name is required.");
      return;
    }
    setSavingEdit(true);
    setEditError("");
    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      formData.append("industry", editIndustry.trim());
      formData.append("websiteUrl", editWebsiteUrl.trim());
      formData.append("displayOrder", editOrder || "0");
      formData.append("isVisible", String(editVisible));
      if (editRemoveLogo) formData.append("removeLogo", "true");
      if (editLogoFile) formData.append("logo", editLogoFile);

      const res = await fetch(`/api/admin/website-clients/${editing.id}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update client.");
        return;
      }

      setClients((prev) =>
        prev
          .map((c) => (c.id === editing.id ? data.client : c))
          .sort((a, b) => a.displayOrder - b.displayOrder)
      );
      setEditing(null);
      showToast(`Updated "${data.client.name}"!`);
      router.refresh();
    } catch {
      setEditError("Network error while saving.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (c: WebsiteClientRow) => {
    if (!confirm(`Permanently delete "${c.name}" from Website Clients?`)) return;
    try {
      const res = await fetch(`/api/admin/website-clients/${c.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setClients((prev) => prev.filter((x) => x.id !== c.id));
        showToast(`Deleted "${c.name}".`);
        router.refresh();
      } else {
        alert(data.error || "Delete failed.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const visibleCount = clients.filter((c) => c.isVisible).length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toast}
        </div>
      )}

      {/* Top Full-Width Add Form */}
      <div className="admin-card p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Add Client to Website Showcase
          </h3>
          <span className="text-[11px] text-slate-500">
            {visibleCount} of {clients.length} visible on garvix.in homepage
          </span>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client / Brand Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unit Nine Private Limited"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full admin-input py-2 px-3"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Industry / Solution Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Retail Software, Jewellery RFID"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full admin-input py-2 px-3"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client Website URL (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full admin-input py-2 px-3"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0 (lower shows first)"
                className="w-full admin-input py-2 px-3 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <div className="flex-1 flex items-center gap-2.5">
              <label className="flex-1 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-2 cursor-pointer transition text-slate-600 truncate">
                <Upload className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate">
                  {logoFile
                    ? logoFile.name
                    : "Upload Client Logo (PNG, JPG, WEBP, SVG — optional, max 5 MB)"}
                </span>
                <input
                  ref={createFileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setLogoFile(f);
                    setLogoPreview(f ? URL.createObjectURL(f) : null);
                  }}
                  className="hidden"
                />
              </label>

              {logoPreview && (
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 shrink-0">
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="h-7 w-14 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                      if (createFileRef.current) createFileRef.current.value = "";
                    }}
                    className="text-slate-400 hover:text-rose-600"
                    title="Clear logo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2.5 font-bold uppercase text-white shadow-sm transition disabled:opacity-50 shrink-0"
            >
              <Plus className="h-4 w-4" />
              {creating ? "Adding..." : "Add to Website"}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Clients Showcase List */}
      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-blue-600" /> Homepage &ldquo;Our Clients&rdquo; List ({clients.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Tip: Hide all clients to hide the section automatically on garvix.in
          </span>
        </div>

        {clients.length === 0 ? (
          <div className="py-12 px-6 text-center text-xs text-slate-400">
            No website showcase clients added yet. Add your first client above — it will immediately appear in the <strong>Our Clients</strong> section on <code>garvix.in</code>!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Logo</th>
                  <th className="py-3 px-4">Client Name &amp; Industry</th>
                  <th className="py-3 px-4 whitespace-nowrap">Website</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Order</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Homepage Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      {c.logoUrl ? (
                        <div className="h-10 w-20 rounded-lg border border-slate-200 bg-white flex items-center justify-center p-1">
                          <img
                            src={c.logoUrl}
                            alt={c.name}
                            className="max-h-8 max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                      {c.industry && (
                        <span className="inline-block mt-0.5 rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {c.industry}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {c.websiteUrl ? (
                        <a
                          href={c.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                        >
                          <span className="max-w-[160px] truncate">
                            {c.websiteUrl.replace(/^https?:\/\//, "")}
                          </span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-slate-600 whitespace-nowrap">
                      {c.displayOrder}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleVisible(c)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${
                          c.isVisible
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
                        }`}
                        title="Click to toggle visibility on garvix.in"
                      >
                        {c.isVisible ? (
                          <>
                            <Eye className="h-3 w-3" /> Visible Live
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" /> Hidden
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          title="Edit Website Client"
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            title="Delete permanently (Super Admin Only)"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm font-bold text-slate-900">Edit Website Client</h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              {editError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700 font-semibold">
                  {editError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Industry / Solution Tag</label>
                <input
                  type="text"
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  className="w-full admin-input py-2 px-3"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editWebsiteUrl}
                    onChange={(e) => setEditWebsiteUrl(e.target.value)}
                    className="w-full admin-input py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Order</label>
                  <input
                    type="number"
                    value={editOrder}
                    onChange={(e) => setEditOrder(e.target.value)}
                    className="w-full admin-input py-2 px-3 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Client Logo</label>
                {editing.logoUrl && !editRemoveLogo && !editLogoFile && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <img
                      src={editing.logoUrl}
                      alt={editing.name}
                      className="h-9 max-w-[120px] object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setEditRemoveLogo(true)}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-800"
                    >
                      Remove Logo
                    </button>
                  </div>
                )}

                <label className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-2 cursor-pointer text-slate-600 truncate">
                  <Upload className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">
                    {editLogoFile ? editLogoFile.name : "Upload / Replace Logo (PNG, JPG, WEBP, SVG)"}
                  </span>
                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setEditLogoFile(f);
                      if (f) setEditRemoveLogo(false);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={editVisible}
                  onChange={(e) => setEditVisible(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span className="font-semibold text-slate-700">Show live on garvix.in homepage</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
