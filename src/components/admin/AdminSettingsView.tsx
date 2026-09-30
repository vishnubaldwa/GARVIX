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
      <div className="admin-card p-6 border-l-4 border-l-blue-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Telegram Bot Push Alerts</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Connected Bot: <code className="font-bold text-blue-600">@garvix_software_bot</code> • Alerts sent on Leads, Quotations, Invoices, Payments, and Service Desk.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendTelegramTest}
            disabled={tgLoading}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {tgLoading ? "Sending Test..." : "Send Test Telegram Alert"}
          </button>
        </div>

        {tgSuccess && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {tgSuccess}
          </div>
        )}
        {tgError && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-rose-600" /> {tgError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Company, GST & Bank Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Company Details */}
          <div className="admin-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Company & GST Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Company Registered Name</label>
                <div className="font-bold text-slate-900 text-sm">{companyInfo.name}</div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">GSTIN & Home State</label>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {companyInfo.gstin} ({companyInfo.state} - {companyInfo.stateCode})
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Official Phone</label>
                <div className="font-mono text-slate-800">{companyInfo.phone}</div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Official Email</label>
                <div className="font-mono text-slate-800">{companyInfo.email}</div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Registered Business Address</label>
                <div className="text-slate-800">{companyInfo.address}</div>
              </div>
            </div>
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
                  {companyInfo.upiId}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">UPI Payee Name</label>
                <div className="font-bold text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-lg p-2">
                  {companyInfo.upiName}
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
