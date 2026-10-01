"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserX,
  UserCheck,
  Search,
  Filter,
  Link2Off,
  Briefcase,
  Lock,
  Edit3,
} from "lucide-react";

interface Employee {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  telegramChatId: string | null;
  isActive: boolean;
  createdAt: string;
}

const roleBadgeConfig: Record<string, { label: string; badge: string }> = {
  SUPER_ADMIN: {
    label: "👑 Super Admin",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  SALES: {
    label: "💼 Sales Executive",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ACCOUNTS: {
    label: "🧾 Accounts Officer",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  SERVICE: {
    label: "🛠️ Service Engineer",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export function EmployeeListView({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [availableRoles, setAvailableRoles] = useState<{ name: string; displayName: string }[]>([
    { name: "SUPER_ADMIN", displayName: "👑 Super Admin" },
    { name: "SALES", displayName: "💼 Sales Executive" },
    { name: "ACCOUNTS", displayName: "🧾 Accounts Officer" },
    { name: "SERVICE", displayName: "🛠️ Service Engineer" },
  ]);

  useEffect(() => {
    fetch("/api/admin/roles")
      .then((res) => res.json())
      .then((data) => {
        if (data.roles && data.roles.length > 0) {
          setAvailableRoles(
            data.roles.map((r: any) => ({
              name: r.name,
              displayName: r.displayName || r.name,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Create Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("SALES");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("SALES");
  const [editPhone, setEditPhone] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setEditName(emp.name);
    setEditRole(emp.role);
    setEditPhone(emp.phone || "");
    setEditIsActive(emp.isActive);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    setSavingEdit(true);
    setEditError("");

    try {
      const res = await fetch("/api/admin/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEmp.id,
          name: editName,
          role: editRole,
          phone: editPhone,
          isActive: editIsActive,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(
          employees.map((e) => (e.id === editingEmp.id ? { ...e, ...data.employee } : e))
        );
        setEditModalOpen(false);
        showToast(`Staff member ${data.employee.name} updated successfully!`);
      } else {
        setEditError(data.error || "Failed to update staff member.");
      }
    } catch {
      setEditError("Network error occurred.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Reset Password Modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, role, phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees([data.employee, ...employees]);
        setCreateModalOpen(false);
        setName("");
        setUsername("");
        setRole("SALES");
        setPhone("");
        setPassword("");
        showToast(`Staff account created for ${data.employee.name}!`);
      } else {
        setCreateError(data.error || "Failed to create staff member.");
      }
    } catch {
      setCreateError("Network error occurred.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const nextStatus = !emp.isActive;
    try {
      const res = await fetch("/api/admin/employees/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: emp.id, isActive: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(
          employees.map((e) => (e.id === emp.id ? { ...e, isActive: nextStatus } : e))
        );
        showToast(`${emp.name} has been ${nextStatus ? "activated" : "deactivated"}.`);
      } else {
        alert(data.error || "Failed to update status.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleUnlinkTelegram = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to unlink Telegram for ${emp.name}?`)) return;

    try {
      const res = await fetch("/api/admin/employees/unlink-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: emp.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(
          employees.map((e) => (e.id === emp.id ? { ...e, telegramChatId: null } : e))
        );
        showToast(`Telegram unlinked for ${emp.name}.`);
      } else {
        alert(data.error || "Failed to unlink Telegram.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setResetting(true);
    setResetError("");

    try {
      const res = await fetch("/api/admin/employees/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedEmp.id, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetModalOpen(false);
        setNewPassword("");
        showToast(`Password updated for ${selectedEmp.name}!`);
      } else {
        setResetError(data.error || "Failed to reset password.");
      }
    } catch {
      setResetError("Network error.");
    } finally {
      setResetting(false);
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.phone && emp.phone.includes(searchTerm));
    const matchesRole = roleFilter === "ALL" || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toastMessage}
        </div>
      )}

      {/* Header card */}
      <div className="admin-card p-6 border-l-4 border-l-purple-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Staff & Employee Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage roles, login credentials, and automatic Telegram Bot access linked via verified mobile numbers.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
          >
            <UserPlus className="h-4 w-4" /> Add New Employee
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full admin-input py-2 pl-9 pr-3 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="ALL">All Roles ({employees.length})</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="SALES">Sales</option>
              <option value="ACCOUNTS">Accounts</option>
              <option value="SERVICE">Service Engineer</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium self-end sm:self-center">
          <span>Active: <b>{employees.filter((e) => e.isActive).length}</b></span>
          <span>•</span>
          <span>Telegram Linked: <b>{employees.filter((e) => e.telegramChatId).length}</b></span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role & Dept</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">Telegram Bot Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No employees matching your search or filter.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const roleConfig = roleBadgeConfig[emp.role] || {
                    label: emp.role,
                    badge: "bg-slate-100 text-slate-700 border-slate-200",
                  };

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{emp.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${roleConfig.badge}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {emp.phone ? (
                          <div className="flex items-center gap-1 font-mono text-slate-800 font-semibold">
                            <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                            {emp.phone}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {emp.telegramChatId ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Linked
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              ID: {emp.telegramChatId}
                            </span>
                            <button
                              onClick={() => handleUnlinkTelegram(emp)}
                              title="Unlink Telegram Account"
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                            >
                              <Link2Off className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                            ⚪ Not Linked Yet
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            emp.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {emp.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            title="Edit Staff Member"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-sm"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedEmp(emp);
                              setResetModalOpen(true);
                              setResetError("");
                            }}
                            title="Reset Password"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(emp)}
                            title={emp.isActive ? "Deactivate Account" : "Activate Account"}
                            className={`p-1.5 rounded-lg border transition ${
                              emp.isActive
                                ? "border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {emp.isActive ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Employee */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Add New Staff / Employee</h3>
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

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                      className="w-full admin-input rounded-r-none py-2 px-3 text-xs"
                    />
                    <span className="bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg px-2.5 py-2 text-[11px] font-mono font-bold text-slate-600">
                      @garvix.in
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs font-semibold cursor-pointer"
                  >
                    <option value="SALES">💼 Sales Executive</option>
                    <option value="ACCOUNTS">🧾 Accounts Officer</option>
                    <option value="SERVICE">🛠️ Service Engineer</option>
                    <option value="SUPER_ADMIN">👑 Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number (for Telegram Auto-Link) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Jab employee Telegram Bot (@garvix_software_bot) par aayega, ye number verify karke unki Chat ID auto link ho jayegi.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters (e.g. garvix123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save & Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Employee */}
      {editModalOpen && editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit Staff Member</h3>
                  <p className="text-[11px] text-slate-500">Login ID: {editingEmp.username}@garvix.in</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {editError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" /> {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username / Email</label>
                  <input
                    type="text"
                    disabled
                    value={`${editingEmp.username}@garvix.in`}
                    className="w-full admin-input py-2 px-3 text-xs bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full admin-input py-2 px-3 text-xs font-semibold cursor-pointer"
                  >
                    {availableRoles.map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number (for Telegram Auto-Link) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Is mobile number se employee Telegram Bot (@garvix_software_bot) par auto-link hota hai.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editIsActive ? "ACTIVE" : "INACTIVE"}
                  onChange={(e) => setEditIsActive(e.target.value === "ACTIVE")}
                  className="w-full admin-input py-2 px-3 text-xs font-semibold cursor-pointer"
                >
                  <option value="ACTIVE">🟢 Active (Access Allowed)</option>
                  <option value="INACTIVE">🔴 Inactive (Account Suspended)</option>
                </select>
              </div>

              {editingEmp.telegramChatId && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-emerald-800">
                    <span className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Telegram Account Connected
                    </span>
                    <span className="font-mono text-slate-600 text-[10px]">Chat ID: {editingEmp.telegramChatId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleUnlinkTelegram(editingEmp);
                      setEditingEmp({ ...editingEmp, telegramChatId: null });
                    }}
                    className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Link2Off className="h-3 w-3" /> Unlink
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Reset Password for {selectedEmp.name}</h3>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {resetError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" /> {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password * (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  placeholder="Enter strong new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {resetting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
