"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radio, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
      } else {
        setError(data.error || "Invalid username or password.");
      }
    } catch {
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Radio className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-widest text-slate-900">GARVIX</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Enterprise ERP Gateway
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
          Staff Admin Login
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to your GARVIX account. Domain suffix is auto-appended.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username with @garvix.in suffix */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Garvix Username
              </label>
              <div className="relative flex rounded-lg overflow-hidden border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                <div className="flex items-center pl-3 text-slate-400 bg-white">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white py-2.5 px-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <div className="flex items-center px-3 bg-slate-50 border-l border-slate-200 text-xs font-mono font-bold text-slate-600 select-none">
                  @garvix.in
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Type &apos;admin&apos; to sign in as &apos;admin@garvix.in&apos;.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative flex rounded-lg overflow-hidden border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                <div className="flex items-center pl-3 text-slate-400 bg-white">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white py-2.5 px-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to ERP</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 block mb-2">1-Click Quick Fill Credentials:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin", "admin123")}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-[10px] font-mono text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("sales", "sales123")}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-[10px] font-mono text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Sales CRM
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("accounts", "accounts123")}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-[10px] font-mono text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Accounts / CA
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-blue-600 transition">
            ← Return to GARVIX Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
