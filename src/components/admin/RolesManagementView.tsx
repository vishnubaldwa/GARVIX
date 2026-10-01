"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Save,
  Users,
  Lock,
} from "lucide-react";
import { ALL_PERMISSIONS, PermissionCode } from "@/lib/permissions";

interface RoleData {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  permissions: PermissionCode[];
  isSystem: boolean;
}

export function RolesManagementView({
  initialRoles,
}: {
  initialRoles: RoleData[];
}) {
  const [roles, setRoles] = useState<RoleData[]>(initialRoles);
  const [activeRole, setActiveRole] = useState<RoleData>(initialRoles[0] || null);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionCode[]>(
    initialRoles[0]?.permissions || []
  );

  // Create role modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<PermissionCode[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Saving state
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleSelectRole = (r: RoleData) => {
    setActiveRole(r);
    setSelectedPermissions(r.permissions);
  };

  const handleTogglePermission = (code: PermissionCode) => {
    if (activeRole.name === "SUPER_ADMIN") return; // Super admin always has all permissions

    if (selectedPermissions.includes(code)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== code));
    } else {
      setSelectedPermissions([...selectedPermissions, code]);
    }
  };

  const handleSavePermissions = async () => {
    if (!activeRole) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/roles/${activeRole.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: selectedPermissions }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoles(roles.map((r) => (r.id === activeRole.id ? data.role : r)));
        setActiveRole(data.role);
        showToast(`Permissions updated for ${activeRole.displayName}!`);
      } else {
        alert(data.error || "Failed to update role permissions.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          displayName: newDisplayName,
          description: newDescription,
          permissions: newRolePerms,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoles([...roles, data.role]);
        setActiveRole(data.role);
        setSelectedPermissions(data.role.permissions);
        setCreateModalOpen(false);
        setNewRoleName("");
        setNewDisplayName("");
        setNewDescription("");
        setNewRolePerms([]);
        showToast(`Custom role '${data.role.displayName}' created successfully!`);
      } else {
        setCreateError(data.error || "Failed to create role.");
      }
    } catch {
      setCreateError("Network error.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (role: RoleData) => {
    if (role.isSystem) return;
    if (!confirm(`Are you sure you want to delete role '${role.displayName}'?`)) return;

    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        const remaining = roles.filter((r) => r.id !== role.id);
        setRoles(remaining);
        if (activeRole.id === role.id) {
          setActiveRole(remaining[0] || null);
          setSelectedPermissions(remaining[0]?.permissions || []);
        }
        showToast(`Role '${role.displayName}' deleted.`);
      } else {
        alert(data.error || "Failed to delete role.");
      }
    } catch {
      alert("Network error.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="admin-card p-6 border-l-4 border-l-indigo-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Roles & Dynamic Permissions Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize granular access rules across Web Admin and the Telegram Bot (@garvix_software_bot).
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Create Custom Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col (4 cols): Roles List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Configured Roles ({roles.length})
          </h3>

          <div className="space-y-2">
            {roles.map((r) => {
              const isSelected = activeRole?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRole(r)}
                  className={`admin-card p-3.5 cursor-pointer transition border text-left flex items-center justify-between ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{r.displayName}</span>
                      {r.isSystem && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {r.description || `Role code: ${r.name}`}
                    </p>
                    <div className="text-[10px] text-indigo-700 font-semibold mt-1">
                      {r.name === "SUPER_ADMIN"
                        ? "All Permissions (Unrestricted)"
                        : `${r.permissions.length} Permissions Active`}
                    </div>
                  </div>

                  {!r.isSystem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(r);
                      }}
                      title="Delete Custom Role"
                      className="text-slate-400 hover:text-rose-600 p-1 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (8 cols): Permission Checkboxes */}
        <div className="lg:col-span-8 admin-card p-6 space-y-5">
          {activeRole && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{activeRole.displayName}</h3>
                    <code className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {activeRole.name}
                    </code>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeRole.description || "Customize granular permissions for this role."}
                  </p>
                </div>

                {activeRole.name !== "SUPER_ADMIN" ? (
                  <button
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 self-start sm:self-auto"
                  >
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Permissions"}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700">
                    <Lock className="h-3.5 w-3.5" /> Super Admin Lock
                  </span>
                )}
              </div>

              {activeRole.name === "SUPER_ADMIN" && (
                <div className="rounded-lg bg-purple-50/60 border border-purple-200 p-3 text-xs text-purple-900 leading-relaxed">
                  👑 <b>Super Admin</b> has universal unrestricted rights across all features, financial data, and system configurations. Permissions cannot be disabled for Super Admin.
                </div>
              )}

              {/* Permissions Grid */}
              <div className="space-y-3">
                {ALL_PERMISSIONS.map((perm) => {
                  const isChecked =
                    activeRole.name === "SUPER_ADMIN" || selectedPermissions.includes(perm.code);
                  const isDisabled = activeRole.name === "SUPER_ADMIN";

                  return (
                    <div
                      key={perm.code}
                      onClick={() => !isDisabled && handleTogglePermission(perm.code)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition ${
                        isChecked
                          ? "bg-slate-50/80 border-indigo-200"
                          : "bg-white border-slate-200 opacity-60"
                      } ${!isDisabled ? "cursor-pointer hover:border-indigo-300" : ""}`}
                    >
                      <input
                        type="checkbox"
                        disabled={isDisabled}
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{perm.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">{perm.code}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{perm.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal: Create Custom Role */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Create New Custom Role</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {createError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" /> {createError}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Role Display Name * (e.g. Senior Sales Manager)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Sales Manager"
                  value={newDisplayName}
                  onChange={(e) => {
                    setNewDisplayName(e.target.value);
                    if (!newRoleName) {
                      setNewRoleName(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_")
                      );
                    }
                  }}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  System Code (Auto-generated or custom uppercase)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SENIOR_SALES"
                  value={newRoleName}
                  onChange={(e) =>
                    setNewRoleName(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_")
                    )
                  }
                  className="w-full admin-input py-2 px-3 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of responsibilities..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">Initial Permissions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = newRolePerms.includes(perm.code);
                    return (
                      <div
                        key={perm.code}
                        onClick={() => {
                          if (isChecked) {
                            setNewRolePerms(newRolePerms.filter((p) => p !== perm.code));
                          } else {
                            setNewRolePerms([...newRolePerms, perm.code]);
                          }
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer ${
                          isChecked
                            ? "bg-indigo-50/50 border-indigo-200 text-indigo-900 font-semibold"
                            : "bg-white border-slate-200 text-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                        />
                        <span>{perm.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Custom Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
