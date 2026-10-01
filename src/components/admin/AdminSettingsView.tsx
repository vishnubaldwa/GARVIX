"use client";

import { useState } from "react";
import {
  Lock,
  Building2,
  Landmark,
  QrCode,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Bot,
  RefreshCw,
  Edit3,
  Save,
  X,
} from "lucide-react";

export function AdminSettingsView({
  sessionEmail,
  sessionUsername,
  companyInfo,
}: {
  sessionEmail: string;
  sessionUsername: string;
  companyInfo: {
    name: string;
    tagline: string;
    state: string;
    stateCode: string;
    gstin: string;
    email: string;
    phone: string;
    address: string;
    upiId: string;
    upiName: string;
  };
}) {
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  // Telegram test state
  const [tgLoading, setTgLoading] = useState(false);
  const [tgSuccess, setTgSuccess] = useState("");
  const [tgError, setTgError] = useState("");

  // Telegram webhook registration state
  const [whLoading, setWhLoading] = useState(false);
  const [whSuccess, setWhSuccess] = useState("");
  const [whError, setWhError] = useState("");

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(companyInfo);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileSuccess("Company profile & UPI settings updated in database!");
        setEditingProfile(false);
      } else {
        setProfileError(data.error || "Failed to update settings.");
      }
    } catch {
      setProfileError("Network error occurred.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRegisterWebhook = async () => {
    setWhLoading(true);
    setWhSuccess("");
    setWhError("");
    try {
      const res = await fetch("/api/admin/telegram/webhook-register", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWhSuccess(
          "Two-Way Interactive Webhook Activated! You can now send commands like 'quotation', 'invoice', 'leads', 'summary' or tap buttons in your Telegram chat."
        );
      } else {
        setWhError(
          data.error || data.result?.description || "Failed to register webhook."
        );
      }
    } catch {
      setWhError("Network error occurred while connecting webhook.");
    } finally {
      setWhLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPwError("Please fill in both current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New password and confirm password do not match.");
      return;
    }

    setPwLoading(true);
    setPwError("");
    setPwSuccess("");

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwSuccess("Password changed successfully! Keep it safe.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwError(data.error || "Failed to update password.");
      }
    } catch {
      setPwError("Network error occurred.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleSendTelegramTest = async () => {
    setTgLoading(true);
    setTgSuccess("");
    setTgError("");

    try {
      const res = await fetch("/api/admin/telegram/test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTgSuccess("Test notification sent! Check your Telegram app right now.");
      } else {
        setTgError(data.error || "Failed to send Telegram test message.");
      }
    } catch {
      setTgError("Network error occurred.");
    } finally {
      setTgLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Section: Telegram Bot Alert Integration */}
      <div className="admin-card p-6 border-l-4 border-l-blue-600 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Telegram Bot & Interactive Command Center</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Connected Bot: <code className="font-bold text-blue-600">@garvix_software_bot</code> • Authorized Chat ID: <code className="font-mono font-bold text-slate-700">8543269562</code>
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                  ⚡ Push Alerts
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                  💬 /start Menu
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                  📋 &quot;quotation&quot;
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                  🧾 &quot;invoice&quot;
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                  👥 &quot;leads&quot;
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                  📊 &quot;summary&quot;
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button
              type="button"
              onClick={handleRegisterWebhook}
              disabled={whLoading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
            >
              <Bot className="h-4 w-4" /> {whLoading ? "Connecting..." : "Activate Two-Way Webhook"}
            </button>
            <button
              type="button"
              onClick={handleSendTelegramTest}
              disabled={tgLoading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {tgLoading ? "Sending..." : "Send Test Ping"}
            </button>
          </div>
        </div>

        {whSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {whSuccess}
          </div>
        )}
        {whError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" /> {whError}
          </div>
        )}

        {tgSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {tgSuccess}
          </div>
        )}
        {tgError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" /> {tgError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Company, GST & Bank Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Company Details */}
          <div className="admin-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Company & GST Profile
                </h3>
              </div>
              {!editingProfile ? (
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                >
                  <Edit3 className="h-3.5 w-3.5 text-blue-600" /> Edit Settings
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileData(companyInfo);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              )}
            </div>

            {profileSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" /> {profileError}
              </div>
            )}

            {editingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Company Registered Name *</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full admin-input py-2 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tagline</label>
                    <input
                      type="text"
                      value={profileData.tagline}
                      onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
                      className="w-full admin-input py-2 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={profileData.gstin}
                      onChange={(e) => {
                        const gstin = e.target.value.toUpperCase();
                        const stateCode = gstin.length >= 2 ? gstin.slice(0, 2) : profileData.stateCode;
                        setProfileData({ ...profileData, gstin, stateCode });
                      }}
                      placeholder="e.g. 06AAACG1234F1Z5"
                      className="w-full admin-input py-2 px-3 text-xs font-mono uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Home State</label>
                      <input
                        type="text"
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        className="w-full admin-input py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">State Code</label>
                      <input
                        type="text"
                        value={profileData.stateCode}
                        onChange={(e) => setProfileData({ ...profileData, stateCode: e.target.value })}
                        className="w-full admin-input py-2 px-3 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Phone *</label>
                    <input
                      type="text"
                      required
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full admin-input py-2 px-3 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full admin-input py-2 px-3 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Registered Address *</label>
                    <textarea
                      rows={2}
                      required
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full admin-input py-2 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Business UPI ID * (for Dynamic QR)</label>
                    <input
                      type="text"
                      required
                      value={profileData.upiId}
                      onChange={(e) => setProfileData({ ...profileData, upiId: e.target.value })}
                      placeholder="e.g. garvix@upi"
                      className="w-full admin-input py-2 px-3 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">UPI Payee Display Name</label>
                    <input
                      type="text"
                      value={profileData.upiName}
                      onChange={(e) => setProfileData({ ...profileData, upiName: e.target.value })}
                      className="w-full admin-input py-2 px-3 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" /> {savingProfile ? "Saving..." : "Save Settings"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileData(companyInfo);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Company Registered Name</label>
                  <div className="font-bold text-slate-900 text-sm">{profileData.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{profileData.tagline}</div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">GSTIN & Home State</label>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {profileData.gstin} ({profileData.state} - {profileData.stateCode})
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Official Phone</label>
                  <div className="font-mono text-slate-800">{profileData.phone}</div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Official Email</label>
                  <div className="font-mono text-slate-800">{profileData.email}</div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">Registered Business Address</label>
                  <div className="text-slate-800">{profileData.address}</div>
                </div>
              </div>
            )}
          </div>

          {/* Bank & Payment Details */}
          <div className="admin-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Landmark className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Bank & Dynamic UPI Payment Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Business UPI ID</label>
                <div className="font-mono font-bold text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  {profileData.upiId}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">UPI Payee Name</label>
                <div className="font-bold text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-lg p-2">
                  {profileData.upiName}
                </div>
              </div>

              <div className="sm:col-span-2">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  💡 This UPI ID is automatically encoded into the <b>Dynamic NPCI QR code</b> generated on every Tax Invoice and Client Payment Portal link for instant settlement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Security & Change Password */}
        <div className="lg:col-span-5 space-y-6">
          <div className="admin-card p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="h-5 w-5 text-rose-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Change Account Password
                </h3>
                <p className="text-[11px] text-slate-500">Logged in as: {sessionEmail}</p>
              </div>
            </div>

            {pwSuccess && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-semibold">
                {pwSuccess}
              </div>
            )}
            {pwError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold">
                {pwError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password (e.g. admin123)"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password * (Min 6 Characters)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter strong new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full admin-input py-2 px-3 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" /> {pwLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
