"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radio, Lock, User, ArrowRight, AlertCircle, ShieldCheck, Smartphone } from "lucide-react";
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
      setError("Please enter your username or email and password.");
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
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Unable to reach the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-[400px] text-center">
        {/* Minimal Apple-Style Brand Mark */}
        <Link href="/" className="inline-flex flex-col items-center gap-3 group">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform">
            <Radio className="h-7 w-7 text-[#2997ff]" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-[#1d1d1f] block">
              GARVIX ERP
            </span>
            <span className="text-xs font-medium text-[#86868b]">
              Admin & Employee Sign In
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="rounded-3xl border border-black/[0.06] bg-white p-7 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-medium text-[#424245] mb-1.5">
                Username or Email
              </label>
              <div className="relative flex items-center rounded-xl border border-black/[0.1] bg-[#f5f5f7]/60 focus-within:bg-white focus-within:border-[#0071e3] focus-within:ring-3 focus-within:ring-[#0071e3]/15 transition">
                <User className="h-4 w-4 text-[#86868b] ml-3.5 shrink-0" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="admin or employee@garvix.in"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent py-3 px-3 text-sm text-[#1d1d1f] placeholder-[#86868b] focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#86868b]">
                Enter your username (e.g. <span className="font-mono text-[#424245]">admin</span>) or full <span className="font-mono text-[#424245]">@garvix.in</span> email.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#424245] mb-1.5">
                Password
              </label>
              <div className="relative flex items-center rounded-xl border border-black/[0.1] bg-[#f5f5f7]/60 focus-within:bg-white focus-within:border-[#0071e3] focus-within:ring-3 focus-within:ring-[#0071e3]/15 transition">
                <Lock className="h-4 w-4 text-[#86868b] ml-3.5 shrink-0" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-3 px-3 text-sm text-[#1d1d1f] placeholder-[#86868b] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-3 text-sm font-medium text-white shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-black/[0.06] flex items-center justify-center gap-1.5 text-[11px] text-[#86868b]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Role-Based Access • Encrypted Session</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 text-center">
          <Link
            href="/download-app"
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white hover:bg-[#fbfbfd] px-4 py-2 text-xs font-medium text-[#1d1d1f] shadow-xs transition"
          >
            <Smartphone className="h-3.5 w-3.5 text-[#0071e3]" />
            <span>Download Android App (.apk)</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] transition"
          >
            ← Back to garvix.in
          </Link>
        </div>
      </div>
    </div>
  );
}