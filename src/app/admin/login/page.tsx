"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radio, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-[#07090e] bg-cyber-grid bg-cyber-grid-pattern flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.3)]">
            <Radio className="h-6 w-6 text-cyan-300 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-widest text-white">GARVIX</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Enterprise ERP Gateway
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-xl font-bold tracking-tight text-white">
          Authorized Staff Login
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your internal credentials. Domain suffix is auto-configured.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0d1424]/90 p-8 shadow-[0_0_50px_rgba(0,242,254,0.1)] backdrop-blur-xl">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username with @garvix.in suffix */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Garvix Username
              </label>
              <div className="relative flex rounded-lg overflow-hidden border border-cyan-500/30 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400">
                <div className="flex items-center pl-3 text-slate-500 bg-[#0a0e18]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0a0e18] py-2.5 px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <div className="flex items-center px-3 bg-cyan-950/60 border-l border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 select-none">
                  @garvix.in
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                Typing &apos;admin&apos; will sign in as &apos;admin@garvix.in&apos;.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative flex rounded-lg overflow-hidden border border-cyan-500/30 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400">
                <div className="flex items-center pl-3 text-slate-500 bg-[#0a0e18]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0e18] py-2.5 px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_25px_rgba(0,242,254,0.3)] transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Access ERP Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 block mb-2">1-Click Quick Fill Credentials:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin", "admin123")}
                className="rounded border border-cyan-500/20 bg-cyan-950/30 py-1.5 px-2 text-[10px] font-mono text-cyan-300 hover:bg-cyan-500/20"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("sales", "sales123")}
                className="rounded border border-slate-700 bg-slate-800/40 py-1.5 px-2 text-[10px] font-mono text-slate-300 hover:bg-slate-800"
              >
                Sales CRM
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("accounts", "accounts123")}
                className="rounded border border-slate-700 bg-slate-800/40 py-1.5 px-2 text-[10px] font-mono text-slate-300 hover:bg-slate-800"
              >
                Accounts / CA
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400 transition">
            ← Return to GARVIX Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
