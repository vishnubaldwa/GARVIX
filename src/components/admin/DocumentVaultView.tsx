"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Folder,
  FolderPlus,
  Upload,
  Download,
  Eye,
  Trash2,
  Pencil,
  Archive,
  Search,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  ShieldCheck,
  UserPlus,
  Link2,
  Activity,
  X,
  Check,
  Copy,
  Lock,
  Clock,
  RefreshCw,
  Building2,
  MapPin,
  User,
  Landmark,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Ban,
} from "lucide-react";

interface VaultDocument {
  id: string;
  folderId: string;
  title: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  notes: string | null;
  expiryDate: string | null;
  uploadedBy: string | null;
  downloadCount: number;
  createdAt: string;
}

interface VaultFolder {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  sortOrder: number;
  isDefault: boolean;
  documents: VaultDocument[];
}

interface VaultUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  folderIds: string[];
}

interface VaultShareLink {
  id: string;
  token: string;
  label: string;
  recipient: string | null;
  folderIds: string[];
  hasPin: boolean;
  expiresAt: string;
  isActive: boolean;
  createdBy: string | null;
  accessCount: number;
  lastAccessAt: string | null;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  username: string | null;
  action: string;
  entityType: string;
  details: string | null;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileVisual(mime: string, name: string) {
  const lower = name.toLowerCase();
  if (mime.includes("pdf") || lower.endsWith(".pdf")) {
    return { label: "PDF", cls: "bg-rose-50 text-rose-700 border-rose-200", icon: FileText, previewable: true };
  }
  if (mime.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/.test(lower)) {
    return { label: "IMG", cls: "bg-blue-50 text-[#0071e3] border-blue-200", icon: ImageIcon, previewable: true };
  }
  if (/\.(xls|xlsx|csv)$/.test(lower)) {
    return { label: "XLS", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: FileSpreadsheet, previewable: false };
  }
  return { label: "DOC", cls: "bg-slate-100 text-slate-700 border-slate-200", icon: File, previewable: false };
}

function getFolderIcon(iconName: string) {
  switch (iconName) {
    case "building":
      return Building2;
    case "map":
      return MapPin;
    case "user":
      return User;
    case "bank":
      return Landmark;
    case "shield":
      return ShieldCheck;
    default:
      return Folder;
  }
}

export function DocumentVaultView({
  isSuperAdmin = false,
}: {
  isSuperAdmin?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [users, setUsers] = useState<VaultUser[]>([]);
  const [shareLinks, setShareLinks] = useState<VaultShareLink[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [activeTab, setActiveTab] = useState<"docs" | "users" | "shares" | "logs">("docs");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFolderId, setUploadFolderId] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create / Rename folder modal
  const [folderModal, setFolderModal] = useState<{
    mode: "create" | "rename";
    id?: string;
    name: string;
    description: string;
  } | null>(null);

  // Create Banker/CA User ID state
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<"DOCUMENT_VIEWER" | "SUPER_ADMIN">("DOCUMENT_VIEWER");
  const [newUserExpiryDays, setNewUserExpiryDays] = useState<string>("7");
  const [newUserFolderIds, setNewUserFolderIds] = useState<string[]>([]);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{
    name: string;
    email: string;
    password: string;
    expiresAt: string | null;
  } | null>(null);

  // Edit user folder access modal
  const [editAccessUser, setEditAccessUser] = useState<{
    id: string;
    name: string;
    email: string;
    folderIds: string[];
  } | null>(null);

  // Create Share Link state
  const [shareLabel, setShareLabel] = useState("");
  const [shareRecipient, setShareRecipient] = useState("");
  const [sharePin, setSharePin] = useState("");
  const [shareHours, setShareHours] = useState("72");
  const [shareFolderIds, setShareFolderIds] = useState<string[]>([]);
  const [creatingShare, setCreatingShare] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchVault = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/vault/folders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Failed to load Company Vault");
        return;
      }
      setCanManage(Boolean(data.canManage));
      setFolders(data.folders || []);
      setUsers(data.users || []);
      setShareLinks(data.shareLinks || []);
      setActivityLogs(data.activityLogs || []);

      if (data.folders?.length > 0 && !uploadFolderId) {
        setUploadFolderId(data.folders[0].id);
      }
    } catch {
      showToast("error", "Network error loading Company Vault.");
    } finally {
      setLoading(false);
    }
  }, [showToast, uploadFolderId]);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  const totalDocs = useMemo(
    () => folders.reduce((sum, f) => sum + f.documents.length, 0),
    [folders]
  );

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === selectedFolderId) || null,
    [folders, selectedFolderId]
  );

  const displayedDocuments = useMemo(() => {
    const base =
      selectedFolderId === "ALL"
        ? folders.flatMap((f) =>
            f.documents.map((d) => ({ ...d, folderName: f.name }))
          )
        : (activeFolder?.documents || []).map((d) => ({
            ...d,
            folderName: activeFolder?.name || "",
          }));

    if (!searchQuery.trim()) return base;
    const q = searchQuery.trim().toLowerCase();
    return base.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.originalName.toLowerCase().includes(q) ||
        (d.notes || "").toLowerCase().includes(q) ||
        d.folderName.toLowerCase().includes(q)
    );
  }, [folders, selectedFolderId, activeFolder, searchQuery]);

  // Preset: Bank Account Opening Kit (Incorporation + Office + Director 1/2/3)
  const applyBankKycPreset = (setter: (ids: string[]) => void) => {
    const kycSlugs = new Set([
      "incorporation",
      "office-registrations",
      "director-1",
      "director-2",
      "director-3",
      "banking",
    ]);
    const matched = folders
      .filter((f) => kycSlugs.has(f.slug))
      .map((f) => f.id);
    setter(matched.length > 0 ? matched : folders.map((f) => f.id));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0 || !uploadFolderId) {
      showToast("error", "Select a folder and at least one file.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("folderId", uploadFolderId);
      if (uploadTitle.trim()) fd.append("title", uploadTitle.trim());
      if (uploadNotes.trim()) fd.append("notes", uploadNotes.trim());
      if (uploadExpiry) fd.append("expiryDate", uploadExpiry);
      uploadFiles.forEach((f) => fd.append("files", f));

      const res = await fetch("/api/admin/vault/documents", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Upload failed");
        return;
      }
      showToast("success", `Uploaded ${uploadFiles.length} document(s) securely.`);
      setUploadFiles([]);
      setUploadTitle("");
      setUploadNotes("");
      setUploadExpiry("");
      setUploadOpen(false);
      await fetchVault();
    } catch {
      showToast("error", "Upload failed due to network error.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (doc: VaultDocument) => {
    if (!confirm(`Delete '${doc.title}' permanently from the Vault?`)) return;
    try {
      const res = await fetch(`/api/admin/vault/documents/${doc.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        showToast("error", data.error || "Failed to delete");
        return;
      }
      showToast("success", `Deleted '${doc.title}'.`);
      await fetchVault();
    } catch {
      showToast("error", "Delete request failed.");
    }
  };

  const handleFolderSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderModal || !folderModal.name.trim()) return;
    try {
      const url =
        folderModal.mode === "create"
          ? "/api/admin/vault/folders"
          : `/api/admin/vault/folders/${folderModal.id}`;
      const method = folderModal.mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: folderModal.name.trim(),
          description: folderModal.description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Folder action failed");
        return;
      }
      showToast(
        "success",
        folderModal.mode === "create" ? "Folder created." : "Folder renamed."
      );
      setFolderModal(null);
      await fetchVault();
    } catch {
      showToast("error", "Request failed.");
    }
  };

  const handleDeleteFolder = async (folder: VaultFolder) => {
    if (
      !confirm(
        `Delete folder '${folder.name}' and all ${folder.documents.length} document(s) inside it?`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/vault/folders/${folder.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        showToast("error", data.error || "Delete failed");
        return;
      }
      if (selectedFolderId === folder.id) setSelectedFolderId("ALL");
      showToast("success", `Folder '${folder.name}' removed.`);
      await fetchVault();
    } catch {
      showToast("error", "Delete failed.");
    }
  };

  const handleCreateVaultUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPassword) {
      showToast("error", "Name, username, and password are required.");
      return;
    }
    if (newUserRole === "DOCUMENT_VIEWER" && newUserFolderIds.length === 0) {
      showToast("error", "Select at least one folder for this Banker / External Viewer.");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch("/api/admin/vault/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName.trim(),
          username: newUserUsername.trim(),
          password: newUserPassword,
          phone: newUserPhone.trim(),
          role: newUserRole,
          expiresInDays: newUserExpiryDays === "NEVER" ? null : Number(newUserExpiryDays),
          folderIds: newUserFolderIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Failed to create login ID");
        return;
      }

      setCreatedCreds({
        name: data.user.name,
        email: data.user.email,
        password: newUserPassword,
        expiresAt: data.user.expiresAt,
      });
      setNewUserName("");
      setNewUserUsername("");
      setNewUserPassword("");
      setNewUserPhone("");
      setNewUserFolderIds([]);
      showToast("success", `Login ID created for ${data.user.name}!`);
      await fetchVault();
    } catch {
      showToast("error", "Network error creating user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleUserActive = async (u: VaultUser) => {
    try {
      const res = await fetch("/api/admin/vault/access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, isActive: !u.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Failed to update status");
        return;
      }
      showToast(
        "success",
        `${u.name} is now ${!u.isActive ? "Active" : "Revoked / Inactive"}.`
      );
      await fetchVault();
    } catch {
      showToast("error", "Failed to update user status.");
    }
  };

  const handleSaveUserFolders = async () => {
    if (!editAccessUser) return;
    try {
      const res = await fetch("/api/admin/vault/access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editAccessUser.id,
          folderIds: editAccessUser.folderIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast("error", data.error || "Failed to update folder access");
        return;
      }
      showToast("success", `Updated folder access for ${editAccessUser.name}.`);
      setEditAccessUser(null);
      await fetchVault();
    } catch {
      showToast("error", "Failed to save folder access.");
    }
  };

  const handleCreateShareLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareLabel.trim() || shareFolderIds.length === 0) {
      showToast("error", "Provide a title and select at least one folder.");
      return;
    }
    setCreatingShare(true);
    try {
      const res = await fetch("/api/admin/vault/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: shareLabel.trim(),
          recipient: shareRecipient.trim(),
          pin: sharePin.trim(),
          expiresInHours: Number(shareHours),
          folderIds: shareFolderIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Failed to create share link");
        return;
      }
      showToast("success", "Expiring share link generated!");
      setShareLabel("");
      setShareRecipient("");
      setSharePin("");
      setShareFolderIds([]);
      await fetchVault();
    } catch {
      showToast("error", "Failed to create share link.");
    } finally {
      setCreatingShare(false);
    }
  };

  const handleRevokeShareLink = async (id: string) => {
    if (!confirm("Revoke this share link immediately?")) return;
    try {
      const res = await fetch(`/api/admin/vault/shares/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        showToast("error", "Failed to revoke link.");
        return;
      }
      showToast("success", "Share link revoked.");
      await fetchVault();
    } catch {
      showToast("error", "Revoke request failed.");
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
    let pass = "Gvx@";
    for (let i = 0; i < 6; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    setNewUserPassword(pass);
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-black/[0.06] bg-white p-16 text-center text-sm text-[#86868b]">
        Loading Company Document Vault...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-medium shadow-xl backdrop-blur-xl ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
              : "border-rose-200 bg-rose-50/95 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header & Apple Segmented Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#0071e3]">
            Private Encrypted Storage • GARVIX Software Solutions Pvt. Ltd.
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight mt-0.5">
            Company Document Vault
          </h1>
          <p className="text-xs text-[#86868b] mt-1">
            {canManage
              ? "Upload MCA, Director KYC, Banking & Tax papers once — grant controlled access to Bankers, CAs, and Directors."
              : "Authorized Read & Download Access. Preview or download permitted company documents below."}
          </p>
        </div>

        {/* Segmented Control (Managers only) */}
        {canManage && (
          <div className="inline-flex rounded-full bg-black/[0.05] p-1 self-start lg:self-auto">
            {[
              { id: "docs", label: "Documents", icon: Folder },
              { id: "users", label: "Banker / User IDs", icon: UserPlus },
              { id: "shares", label: "Share Links", icon: Link2 },
              { id: "logs", label: "Activity", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-white text-[#1d1d1f] shadow-xs"
                      : "text-[#6e6e73] hover:text-[#1d1d1f]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          TAB 1: DOCUMENTS & FOLDERS (Apple Finder / iCloud Layout)
         ========================================================= */}
      {activeTab === "docs" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Folder Tree */}
          <div className="lg:col-span-4 rounded-3xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-black/[0.06]">
              <span className="text-xs font-semibold text-[#1d1d1f]">Folders</span>
              {canManage && (
                <button
                  onClick={() =>
                    setFolderModal({ mode: "create", name: "", description: "" })
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] hover:bg-black/[0.08] px-2.5 py-1 text-[11px] font-medium text-[#1d1d1f] transition"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-[#0071e3]" />
                  <span>New</span>
                </button>
              )}
            </div>

            {/* All Docs Option */}
            <button
              onClick={() => setSelectedFolderId("ALL")}
              className={`w-full flex items-center justify-between rounded-2xl px-3 py-2.5 text-left text-xs font-medium transition ${
                selectedFolderId === "ALL"
                  ? "bg-[#0071e3] text-white shadow-xs"
                  : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Archive className="h-4 w-4 shrink-0" />
                <span>All Accessible Documents</span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  selectedFolderId === "ALL"
                    ? "bg-white/20 text-white"
                    : "bg-[#f5f5f7] text-[#6e6e73]"
                }`}
              >
                {totalDocs}
              </span>
            </button>

            {/* Individual Folders */}
            <div className="space-y-1 pt-1">
              {folders.map((folder) => {
                const Icon = getFolderIcon(folder.icon);
                const selected = selectedFolderId === folder.id;
                return (
                  <div
                    key={folder.id}
                    className={`group flex items-center justify-between rounded-2xl px-3 py-2.5 transition ${
                      selected
                        ? "bg-[#0071e3] text-white shadow-xs"
                        : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="flex-1 flex items-center gap-2.5 text-left min-w-0"
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          selected ? "text-white" : "text-[#0071e3]"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{folder.name}</p>
                        {folder.description && (
                          <p
                            className={`text-[10px] truncate ${
                              selected ? "text-white/75" : "text-[#86868b]"
                            }`}
                          >
                            {folder.description}
                          </p>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      {canManage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderModal({
                              mode: "rename",
                              id: folder.id,
                              name: folder.name,
                              description: folder.description || "",
                            });
                          }}
                          title="Rename Folder"
                          className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition ${
                            selected
                              ? "hover:bg-white/20 text-white"
                              : "hover:bg-black/[0.08] text-[#6e6e73]"
                          }`}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                      {isSuperAdmin && !folder.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder);
                          }}
                          title="Delete Folder (Super Admin Only)"
                          className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition ${
                            selected
                              ? "hover:bg-white/20 text-white"
                              : "hover:bg-rose-50 text-rose-600"
                          }`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          selected
                            ? "bg-white/20 text-white"
                            : "bg-[#f5f5f7] text-[#6e6e73]"
                        }`}
                      >
                        {folder.documents.length}
                      </span>
                    </div>
                  </div>
                );
              })}

              {folders.length === 0 && (
                <p className="py-8 text-center text-xs text-[#86868b]">
                  No folders assigned to your account yet. Contact Admin.
                </p>
              )}
            </div>
          </div>

          {/* Right Pane: Documents List */}
          <div className="lg:col-span-8 rounded-3xl border border-black/[0.06] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#1d1d1f] truncate">
                  {activeFolder ? activeFolder.name : "All Accessible Documents"}
                </h2>
                <p className="text-xs text-[#86868b] mt-0.5 truncate">
                  {activeFolder?.description || `${totalDocs} total document(s) across ${folders.length} folder(s)`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {displayedDocuments.length > 0 && (
                  <a
                    href={
                      selectedFolderId === "ALL"
                        ? "/api/admin/vault/zip"
                        : `/api/admin/vault/zip?folderId=${selectedFolderId}`
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-[#f5f5f7] hover:bg-black/[0.08] px-3.5 py-2 text-xs font-medium text-[#1d1d1f] transition"
                  >
                    <Archive className="h-3.5 w-3.5 text-[#0071e3]" />
                    <span>
                      {selectedFolderId === "ALL" ? "Download All ZIP" : "Download Folder ZIP"}
                    </span>
                  </a>
                )}

                {canManage && folders.length > 0 && (
                  <button
                    onClick={() => {
                      setUploadFolderId(
                        selectedFolderId !== "ALL"
                          ? selectedFolderId
                          : folders[0]?.id || ""
                      );
                      setUploadOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Papers</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 text-[#86868b] absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search COI, PAN, Aadhaar, MOA, GST, Rent Agreement..."
                className="w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7]/70 py-2 pl-10 pr-4 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/15 transition"
              />
            </div>

            {/* Documents Grid / Rows */}
            {displayedDocuments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/[0.12] bg-[#fbfbfd] py-14 px-6 text-center">
                <Folder className="h-10 w-10 text-[#86868b]/50 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#1d1d1f]">
                  {searchQuery ? "No matching documents found" : "No documents uploaded here yet"}
                </p>
                <p className="text-xs text-[#86868b] mt-1 max-w-sm mx-auto">
                  {canManage
                    ? "Upload PDFs, PAN/Aadhaar scans, COI, MOA, AOA, or office bills to store them securely."
                    : "There are currently no files in this folder."}
                </p>
                {canManage && folders.length > 0 && !searchQuery && (
                  <button
                    onClick={() => {
                      setUploadFolderId(
                        selectedFolderId !== "ALL"
                          ? selectedFolderId
                          : folders[0]?.id || ""
                      );
                      setUploadOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-5 py-2 text-xs font-medium text-white transition"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload First Document</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05] rounded-2xl border border-black/[0.06] overflow-hidden">
                {displayedDocuments.map((doc) => {
                  const visual = getFileVisual(doc.mimeType, doc.originalName);
                  const FileIcon = visual.icon;
                  const isExpired =
                    doc.expiryDate && new Date(doc.expiryDate) < new Date();

                  return (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-[#fbfbfd] transition"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${visual.cls}`}
                        >
                          <FileIcon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-[#1d1d1f] truncate">
                              {doc.title}
                            </h4>
                            <span
                              className={`rounded-md border px-1.5 py-0.2 text-[9px] font-bold ${visual.cls}`}
                            >
                              {visual.label}
                            </span>
                            {selectedFolderId === "ALL" && (
                              <span className="rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[10px] font-medium text-[#6e6e73]">
                                {doc.folderName}
                              </span>
                            )}
                            {doc.expiryDate && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  isExpired
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                <Clock className="h-2.5 w-2.5" />
                                {isExpired ? "Expired" : "Exp:"}{" "}
                                {new Date(doc.expiryDate).toLocaleDateString("en-IN")}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#86868b] mt-0.5 truncate">
                            {doc.originalName} • {formatFileSize(doc.fileSize)} •{" "}
                            {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                            {doc.downloadCount > 0 && ` • ${doc.downloadCount} downloads`}
                          </p>
                          {doc.notes && (
                            <p className="text-[11px] text-[#424245] mt-1">{doc.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {visual.previewable && (
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-white hover:bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-[#1d1d1f] transition"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#0071e3]" />
                            <span>View</span>
                          </button>
                        )}
                        <a
                          href={`/api/admin/vault/documents/${doc.id}/file?mode=download`}
                          className="inline-flex items-center gap-1 rounded-full bg-[#1d1d1f] hover:bg-black px-3 py-1.5 text-xs font-medium text-white transition"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </a>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteDoc(doc)}
                            title="Delete Document (Super Admin Only)"
                            className="rounded-full p-2 text-[#86868b] hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: USER & BANKER LOGIN ACCESS (Dedicated IDs)
         ========================================================= */}
      {activeTab === "users" && canManage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Create Banker / CA / Director ID Form */}
          <div className="lg:col-span-5 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#1d1d1f]">
                Create Banker / CA / Director Login
              </h3>
              <p className="text-xs text-[#86868b] mt-0.5">
                Give a banker or CA their own ID & password — they only see the folders you tick below.
              </p>
            </div>

            {createdCreds && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">
                    ✓ Login Ready for {createdCreds.name}
                  </span>
                  <button
                    onClick={() =>
                      copyText(
                        `GARVIX Document Vault Login\nURL: https://garvix.in/admin/login\nUsername: ${createdCreds.email}\nPassword: ${createdCreds.password}${
                          createdCreds.expiresAt
                            ? `\nValid Until: ${new Date(createdCreds.expiresAt).toLocaleDateString("en-IN")}`
                            : ""
                        }`,
                        "new-creds"
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-medium hover:bg-emerald-800"
                  >
                    {copiedId === "new-creds" ? (
                      <>
                        <Check className="h-3 w-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy Credentials
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-emerald-900 bg-white/80 rounded-xl p-2.5 border border-emerald-200/70 space-y-0.5">
                  <p>Login URL: https://garvix.in/admin/login</p>
                  <p>ID: {createdCreds.email}</p>
                  <p>Password: {createdCreds.password}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateVaultUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  Person / Bank Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank RM / CA Sharma / Director 2"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="admin-input w-full px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#424245] mb-1">
                    Login Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hdfcbank"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="admin-input w-full px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#424245] mb-1">
                    Password *
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      required
                      placeholder="Min 6 chars"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="admin-input w-full px-3 py-2 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      title="Generate Password"
                      className="rounded-xl border border-black/[0.08] bg-[#f5f5f7] px-2.5 hover:bg-black/[0.08] transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-[#424245]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#424245] mb-1">
                    Access Level
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="admin-input w-full px-3 py-2 text-xs"
                  >
                    <option value="DOCUMENT_VIEWER">🏦 Banker / CA (Docs Only)</option>
                    <option value="SUPER_ADMIN">👑 Director (Full Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#424245] mb-1">
                    Auto-Expire Access
                  </label>
                  <select
                    value={newUserExpiryDays}
                    onChange={(e) => setNewUserExpiryDays(e.target.value)}
                    className="admin-input w-full px-3 py-2 text-xs"
                  >
                    <option value="3">After 3 Days</option>
                    <option value="7">After 7 Days (Recommended)</option>
                    <option value="15">After 15 Days</option>
                    <option value="30">After 30 Days</option>
                    <option value="NEVER">Never Expire (Director / CA)</option>
                  </select>
                </div>
              </div>

              {/* Folder Checkboxes for Restricted Viewer */}
              {newUserRole === "DOCUMENT_VIEWER" && (
                <div className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1d1d1f]">
                      Allowed Folders ({newUserFolderIds.length})
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => applyBankKycPreset(setNewUserFolderIds)}
                        className="text-[11px] font-medium text-[#0071e3] hover:underline"
                      >
                        Bank KYC Kit
                      </button>
                      <span className="text-black/20">|</span>
                      <button
                        type="button"
                        onClick={() => setNewUserFolderIds(folders.map((f) => f.id))}
                        className="text-[11px] font-medium text-[#6e6e73] hover:text-[#1d1d1f]"
                      >
                        All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {folders.map((f) => {
                      const checked = newUserFolderIds.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-white cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setNewUserFolderIds((prev) =>
                                checked
                                  ? prev.filter((x) => x !== f.id)
                                  : [...prev, f.id]
                              )
                            }
                            className="accent-[#0071e3] h-3.5 w-3.5 rounded"
                          />
                          <span className="text-[#1d1d1f] font-medium truncate">
                            {f.name}
                          </span>
                          <span className="ml-auto text-[10px] text-[#86868b]">
                            {f.documents.length}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={creatingUser}
                className="w-full rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-2.5 text-xs font-medium text-white shadow-xs transition disabled:opacity-50"
              >
                {creatingUser ? "Creating Account..." : "Create Login ID & Grant Access"}
              </button>
            </form>
          </div>

          {/* Existing Users & External Access Table */}
          <div className="lg:col-span-7 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#1d1d1f]">
                Active Vault Accounts ({users.length})
              </h3>
              <p className="text-xs text-[#86868b]">
                Control folder access or revoke a Banker/CA account in 1 click once work is done.
              </p>
            </div>

            <div className="divide-y divide-black/[0.05]">
              {users.map((u) => {
                const isAdmin =
                  u.role === "SUPER_ADMIN" || u.role === "ADMIN";
                const expired =
                  u.expiresAt && new Date(u.expiresAt) < new Date();
                return (
                  <div
                    key={u.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#1d1d1f]">
                          {u.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isAdmin
                              ? "bg-blue-50 text-[#0071e3]"
                              : u.role === "DOCUMENT_VIEWER"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-[#f5f5f7] text-[#424245]"
                          }`}
                        >
                          {u.role === "DOCUMENT_VIEWER" ? "BANKER / VIEWER" : u.role}
                        </span>
                        {(!u.isActive || expired) && (
                          <span className="rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-semibold">
                            {expired ? "EXPIRED" : "REVOKED"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#86868b] font-mono mt-0.5">
                        {u.email}
                      </p>
                      <p className="text-[11px] text-[#6e6e73] mt-1">
                        {isAdmin
                          ? "Full access to all Vault folders"
                          : `Granted access to ${u.folderIds.length} folder(s)`}
                        {u.expiresAt &&
                          ` • Expires ${new Date(u.expiresAt).toLocaleDateString("en-IN")}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isAdmin && (
                        <button
                          onClick={() =>
                            setEditAccessUser({
                              id: u.id,
                              name: u.name,
                              email: u.email,
                              folderIds: u.folderIds,
                            })
                          }
                          className="rounded-full border border-black/[0.08] bg-[#f5f5f7] hover:bg-black/[0.08] px-3 py-1.5 text-xs font-medium text-[#1d1d1f] transition"
                        >
                          Folders
                        </button>
                      )}
                      {!isAdmin && (
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            u.isActive
                              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {u.isActive ? "Revoke ID" : "Activate"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: EXPIRING PIN-PROTECTED SHARE LINKS
         ========================================================= */}
      {activeTab === "shares" && canManage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Generate Share Link Form */}
          <div className="lg:col-span-5 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#1d1d1f]">
                Generate Expiring Share Link
              </h3>
              <p className="text-xs text-[#86868b] mt-0.5">
                Share selected folders via a clean PIN-protected link that auto-expires.
              </p>
            </div>

            <form onSubmit={handleCreateShareLink} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  Link Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Current Account Opening KYC Pack"
                  value={shareLabel}
                  onChange={(e) => setShareLabel(e.target.value)}
                  className="admin-input w-full px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul — HDFC Bank Sector 24"
                  value={shareRecipient}
                  onChange={(e) => setShareRecipient(e.target.value)}
                  className="admin-input w-full px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#424245] mb-1">
                    Access PIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4829"
                    value={sharePin}
                    onChange={(e) => setSharePin(e.target.value)}
                    className="admin-input w-full px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#424245] mb-1">
                    Link Expiry
                  </label>
                  <select
                    value={shareHours}
                    onChange={(e) => setShareHours(e.target.value)}
                    className="admin-input w-full px-3 py-2 text-xs"
                  >
                    <option value="24">24 Hours</option>
                    <option value="72">3 Days (72 Hours)</option>
                    <option value="168">7 Days</option>
                    <option value="720">30 Days</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1d1d1f]">
                    Folders to Include ({shareFolderIds.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => applyBankKycPreset(setShareFolderIds)}
                    className="text-[11px] font-medium text-[#0071e3] hover:underline"
                  >
                    Bank KYC Kit
                  </button>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {folders.map((f) => {
                    const checked = shareFolderIds.includes(f.id);
                    return (
                      <label
                        key={f.id}
                        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-white cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setShareFolderIds((prev) =>
                              checked
                                ? prev.filter((x) => x !== f.id)
                                : [...prev, f.id]
                            )
                          }
                          className="accent-[#0071e3] h-3.5 w-3.5 rounded"
                        />
                        <span className="text-[#1d1d1f] font-medium truncate">
                          {f.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingShare}
                className="w-full rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-2.5 text-xs font-medium text-white shadow-xs transition disabled:opacity-50"
              >
                {creatingShare ? "Generating Link..." : "Create Secure Share Link"}
              </button>
            </form>
          </div>

          {/* Active Share Links List */}
          <div className="lg:col-span-7 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#1d1d1f]">
                Generated Share Links ({shareLinks.length})
              </h3>
              <p className="text-xs text-[#86868b]">
                Copy and share securely. Revoke any link instantly once documents are received.
              </p>
            </div>

            {shareLinks.length === 0 ? (
              <p className="py-10 text-center text-xs text-[#86868b]">
                No share links created yet.
              </p>
            ) : (
              <div className="space-y-3">
                {shareLinks.map((s) => {
                  const expired = new Date(s.expiresAt) < new Date();
                  const active = s.isActive && !expired;
                  const shareUrl =
                    typeof window !== "undefined"
                      ? `${window.location.origin}/portal/vault/${s.token}`
                      : `/portal/vault/${s.token}`;

                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-black/[0.06] bg-[#fbfbfd] p-4 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-[#1d1d1f]">
                              {s.label}
                            </span>
                            {s.hasPin && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-[#0071e3] px-2 py-0.5 text-[10px] font-semibold">
                                <Lock className="h-2.5 w-2.5" /> PIN Protected
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {!s.isActive ? "REVOKED" : expired ? "EXPIRED" : "ACTIVE"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#86868b] mt-0.5">
                            {s.recipient ? `For: ${s.recipient} • ` : ""}
                            {s.folderIds.length} folder(s) • {s.accessCount} opens • Expires{" "}
                            {new Date(s.expiresAt).toLocaleString("en-IN")}
                          </p>
                        </div>

                        {active && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => copyText(shareUrl, s.id)}
                              className="inline-flex items-center gap-1 rounded-full bg-[#1d1d1f] text-white px-3 py-1.5 text-[11px] font-medium hover:bg-black transition"
                            >
                              {copiedId === s.id ? (
                                <>
                                  <Check className="h-3 w-3" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" /> Copy Link
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRevokeShareLink(s.id)}
                              title="Revoke Link"
                              className="rounded-full border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 transition"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: DOWNLOAD & ACCESS AUDIT LOGS
         ========================================================= */}
      {activeTab === "logs" && canManage && (
        <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="pb-4 border-b border-black/[0.06]">
            <h3 className="text-base font-bold text-[#1d1d1f]">
              Vault Download & Access Audit Trail
            </h3>
            <p className="text-xs text-[#86868b]">
              Complete record of every preview, download, ZIP export, upload, and share access.
            </p>
          </div>
          <div className="mt-3 overflow-x-auto">
            {activityLogs.length === 0 ? (
              <p className="py-10 text-center text-xs text-[#86868b]">
                No vault activity logged yet.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-[#86868b] border-b border-black/[0.06]">
                  <tr>
                    <th className="py-2.5 pr-4">Date & Time</th>
                    <th className="py-2.5 pr-4">User / Recipient</th>
                    <th className="py-2.5 pr-4">Action</th>
                    <th className="py-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#fbfbfd]">
                      <td className="py-3 pr-4 font-mono text-[11px] text-[#86868b] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 pr-4 font-medium text-[#1d1d1f] whitespace-nowrap">
                        {log.username || "System"}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-[10px] font-semibold text-[#1d1d1f]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-[#424245]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: DRAG & DROP UPLOAD MODAL
         ========================================================= */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-black/[0.06] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1d1d1f]">Upload Company Papers</h3>
                <p className="text-xs text-[#86868b]">
                  Stored privately outside public web root (max 25 MB/file).
                </p>
              </div>
              <button
                onClick={() => setUploadOpen(false)}
                className="rounded-full p-1.5 text-[#86868b] hover:bg-[#f5f5f7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  Destination Folder *
                </label>
                <select
                  value={uploadFolderId}
                  onChange={(e) => setUploadFolderId(e.target.value)}
                  className="admin-input w-full px-3.5 py-2.5 text-xs"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const dropped = Array.from(e.dataTransfer.files);
                  if (dropped.length > 0) setUploadFiles((prev) => [...prev, ...dropped]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                  dragOver
                    ? "border-[#0071e3] bg-blue-50/60"
                    : "border-black/[0.12] bg-[#fbfbfd] hover:border-[#0071e3]"
                }`}
              >
                <Upload className="h-7 w-7 text-[#0071e3] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#1d1d1f]">
                  Click to browse or drag & drop files here
                </p>
                <p className="text-[11px] text-[#86868b] mt-1">
                  PDF, JPG, PNG, DOCX, XLSX — multiple files supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    if (picked.length > 0) setUploadFiles((prev) => [...prev, ...picked]);
                  }}
                  className="hidden"
                />
              </div>

              {uploadFiles.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {uploadFiles.map((f, idx) => (
                    <div
                      key={`${f.name}-${idx}`}
                      className="flex items-center justify-between rounded-xl bg-[#f5f5f7] px-3 py-1.5 text-xs"
                    >
                      <span className="truncate text-[#1d1d1f] font-medium">{f.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-[#86868b]">
                          {formatFileSize(f.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setUploadFiles((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-rose-600 hover:text-rose-800"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uploadFiles.length <= 1 && (
                <div>
                  <label className="block text-xs font-medium text-[#424245] mb-1">
                    Document Display Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Certificate of Incorporation (COI)"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="admin-input w-full px-3.5 py-2 text-xs"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#424245] mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Self-attested copy"
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="admin-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#424245] mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={uploadExpiry}
                    onChange={(e) => setUploadExpiry(e.target.value)}
                    className="admin-input w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-xs font-medium text-[#424245]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || uploadFiles.length === 0}
                  className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-5 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : `Upload (${uploadFiles.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: CREATE / RENAME FOLDER
         ========================================================= */}
      {folderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1d1d1f]">
                {folderModal.mode === "create" ? "Create New Folder" : "Rename Folder"}
              </h3>
              <button
                onClick={() => setFolderModal(null)}
                className="rounded-full p-1 text-[#86868b] hover:bg-[#f5f5f7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleFolderSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vishnu Baldwa — Director KYC"
                  value={folderModal.name}
                  onChange={(e) =>
                    setFolderModal({ ...folderModal, name: e.target.value })
                  }
                  className="admin-input w-full px-3.5 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. PAN, Aadhaar, Photo, DIN"
                  value={folderModal.description}
                  onChange={(e) =>
                    setFolderModal({ ...folderModal, description: e.target.value })
                  }
                  className="admin-input w-full px-3.5 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFolderModal(null)}
                  className="rounded-full border border-black/[0.08] px-4 py-2 text-xs font-medium text-[#424245]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-5 py-2 text-xs font-medium text-white"
                >
                  Save Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: EDIT USER FOLDER ACCESS
         ========================================================= */}
      {editAccessUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1d1d1f]">
                  Folder Access — {editAccessUser.name}
                </h3>
                <p className="text-xs text-[#86868b] font-mono">{editAccessUser.email}</p>
              </div>
              <button
                onClick={() => setEditAccessUser(null)}
                className="rounded-full p-1 text-[#86868b] hover:bg-[#f5f5f7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {folders.map((f) => {
                const checked = editAccessUser.folderIds.includes(f.id);
                return (
                  <label
                    key={f.id}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-[#f5f5f7] cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setEditAccessUser((prev) =>
                          prev
                            ? {
                                ...prev,
                                folderIds: checked
                                  ? prev.folderIds.filter((x) => x !== f.id)
                                  : [...prev.folderIds, f.id],
                              }
                            : null
                        )
                      }
                      className="accent-[#0071e3] h-4 w-4 rounded"
                    />
                    <span className="font-medium text-[#1d1d1f]">{f.name}</span>
                    <span className="ml-auto text-[10px] text-[#86868b]">
                      {f.documents.length} files
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditAccessUser(null)}
                className="rounded-full border border-black/[0.08] px-4 py-2 text-xs font-medium text-[#424245]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserFolders}
                className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-5 py-2 text-xs font-medium text-white"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: IN-BROWSER PDF / IMAGE PREVIEW
         ========================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-6">
          <div className="w-full max-w-5xl h-[88vh] rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06] bg-[#fbfbfd]">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm font-bold text-[#1d1d1f] truncate">
                  {previewDoc.title}
                </h3>
                <p className="text-[11px] text-[#86868b] truncate">
                  {previewDoc.originalName} • {formatFileSize(previewDoc.fileSize)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/api/admin/vault/documents/${previewDoc.id}/file?mode=download`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#0077ed]"
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
                  src={`/api/admin/vault/documents/${previewDoc.id}/file?mode=inline`}
                  alt={previewDoc.title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-md"
                />
              ) : (
                <iframe
                  src={`/api/admin/vault/documents/${previewDoc.id}/file?mode=inline`}
                  title={previewDoc.title}
                  className="w-full h-full rounded-xl bg-white border border-black/[0.06]"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
