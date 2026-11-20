"use client";

import { useCallback, useEffect, useState } from "react";
import { GarvixLogoMark } from "@/components/brand/GarvixLogo";
import {
  Lock,
  ShieldCheck,
  Download,
  Eye,
  Archive,
  Folder,
  FileText,
  Image as ImageIcon,
  File,
  X,
  AlertCircle,
  Clock,
} from "lucide-react";

interface SharedDoc {
  id: string;
  folderId: string;
  title: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  notes: string | null;
  createdAt: string;
}

interface SharedFolder {
  id: string;
  name: string;
  description: string | null;
  documents: SharedDoc[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function VaultSharePortalView({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [label, setLabel] = useState("");
  const [recipient, setRecipient] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [folders, setFolders] = useState<SharedFolder[]>([]);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<SharedDoc | null>(null);

  const loadVault = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/vault/${token}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to open this shared link.");
        return;
      }
      setLocked(Boolean(data.locked));
      setLabel(data.label || "Shared Company Documents");
      setRecipient(data.recipient || null);
      setExpiresAt(data.expiresAt || null);
      setFolders(data.folders || []);
    } catch {
      setError("Network error loading shared documents.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setPinError("");
    try {
      const res = await fetch(`/api/portal/vault/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPinError(data.error || "Invalid PIN.");
        return;
      }
      await loadVault();
    } catch {
      setPinError("Failed to verify PIN.");
    } finally {
      setVerifying(false);
    }
  };

  const totalDocs = folders.reduce((sum, f) => sum + f.documents.length, 0);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      {/* Top Frosted Brand Bar */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#16171a] border border-[#d8b56c]/25">
              <GarvixLogoMark className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold tracking-tight block">GARVIX</span>
              <span className="text-[10px] text-[#86868b]">Secure Document Vault</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Official Portal
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {loading ? (
          <div className="rounded-3xl bg-white border border-black/[0.06] p-16 text-center text-sm text-[#86868b]">
            Verifying secure link...
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-3xl bg-white border border-black/[0.06] p-8 text-center shadow-sm space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h1 className="text-lg font-bold text-[#1d1d1f]">Link Unavailable</h1>
            <p className="text-xs text-[#6e6e73] leading-relaxed">{error}</p>
          </div>
        ) : locked ? (
          <div className="mx-auto max-w-sm rounded-3xl bg-white border border-black/[0.06] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0071e3]">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1d1d1f]">{label}</h1>
              {recipient && (
                <p className="text-xs text-[#86868b] mt-0.5">Prepared for: {recipient}</p>
              )}
              <p className="text-xs text-[#6e6e73] mt-2">
                Enter the access PIN shared by GARVIX Software Solutions Pvt. Ltd.
              </p>
            </div>

            {pinError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
                {pinError}
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                required
                placeholder="Enter Access PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-xl border border-black/[0.1] bg-[#f5f5f7] py-3 px-4 text-center text-base font-mono tracking-widest focus:bg-white focus:outline-none focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15"
              />
              <button
                type="submit"
                disabled={verifying}
                className="w-full rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-3 text-sm font-medium text-white shadow-sm transition disabled:opacity-50"
              >
                {verifying ? "Unlocking..." : "Unlock Documents"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Banner */}
            <div className="rounded-3xl bg-white border border-black/[0.06] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
                  GARVIX SOFTWARE SOLUTIONS PRIVATE LIMITED
                </p>
                <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mt-1">
                  {label}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#86868b]">
                  {recipient && <span>Prepared for: {recipient}</span>}
                  <span>•</span>
                  <span>
                    {totalDocs} Document(s) in {folders.length} Folder(s)
                  </span>
                  {expiresAt && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        Valid until {new Date(expiresAt).toLocaleString("en-IN")}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {totalDocs > 0 && (
                <a
                  href={`/api/portal/vault/${token}/zip`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-5 py-2.5 text-xs font-medium text-white shadow-sm transition shrink-0"
                >
                  <Archive className="h-4 w-4" />
                  <span>Download All as ZIP</span>
                </a>
              )}
            </div>

            {/* Folders & Files */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="rounded-3xl bg-white border border-black/[0.06] overflow-hidden shadow-xs"
              >
                <div className="px-6 py-4 bg-[#fbfbfd] border-b border-black/[0.06] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Folder className="h-4.5 w-4.5 text-[#0071e3]" />
                    <div>
                      <h2 className="text-sm font-bold text-[#1d1d1f]">{folder.name}</h2>
                      {folder.description && (
                        <p className="text-[11px] text-[#86868b]">{folder.description}</p>
                      )}
                    </div>
                  </div>
                  {folder.documents.length > 0 && (
                    <a
                      href={`/api/portal/vault/${token}/zip?folderId=${folder.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-[#f5f5f7] px-3 py-1.5 text-[11px] font-medium text-[#1d1d1f] transition"
                    >
                      <Archive className="h-3 w-3 text-[#0071e3]" />
                      <span>ZIP ({folder.documents.length})</span>
                    </a>
                  )}
                </div>

                {folder.documents.length === 0 ? (
                  <p className="p-6 text-xs text-[#86868b]">No files in this folder.</p>
                ) : (
                  <div className="divide-y divide-black/[0.05]">
                    {folder.documents.map((doc) => {
                      const isPdf =
                        doc.mimeType.includes("pdf") ||
                        doc.originalName.toLowerCase().endsWith(".pdf");
                      const isImg = doc.mimeType.startsWith("image/");
                      const previewable = isPdf || isImg;

                      return (
                        <div
                          key={doc.id}
                          className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fbfbfd] transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#1d1d1f]">
                              {isPdf ? (
                                <FileText className="h-4 w-4 text-rose-600" />
                              ) : isImg ? (
                                <ImageIcon className="h-4 w-4 text-[#0071e3]" />
                              ) : (
                                <File className="h-4 w-4 text-[#6e6e73]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1d1d1f] truncate">
                                {doc.title}
                              </p>
                              <p className="text-[11px] text-[#86868b] truncate">
                                {doc.originalName} • {formatSize(doc.fileSize)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {previewable && (
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-white hover:bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-[#1d1d1f] transition"
                              >
                                <Eye className="h-3.5 w-3.5 text-[#0071e3]" />
                                <span>Preview</span>
                              </button>
                            )}
                            <a
                              href={`/api/portal/vault/${token}/file/${doc.id}?mode=download`}
                              className="inline-flex items-center gap-1 rounded-full bg-[#1d1d1f] hover:bg-black px-3 py-1.5 text-xs font-medium text-white transition"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-6">
          <div className="w-full max-w-5xl h-[88vh] rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06] bg-[#fbfbfd]">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm font-bold text-[#1d1d1f] truncate">
                  {previewDoc.title}
                </h3>
                <p className="text-[11px] text-[#86868b] truncate">
                  {previewDoc.originalName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/portal/vault/${token}/file/${previewDoc.id}?mode=download`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-3.5 py-1.5 text-xs font-medium text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-full p-1.5 text-[#424245] hover:bg-black/[0.08]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-[#f5f5f7] overflow-auto flex items-center justify-center p-2">
              {previewDoc.mimeType.startsWith("image/") ? (
                <img
                  src={`/api/portal/vault/${token}/file/${previewDoc.id}?mode=inline`}
                  alt={previewDoc.title}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              ) : (
                <iframe
                  src={`/api/portal/vault/${token}/file/${previewDoc.id}?mode=inline`}
                  title={previewDoc.title}
                  className="w-full h-full rounded-xl bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
