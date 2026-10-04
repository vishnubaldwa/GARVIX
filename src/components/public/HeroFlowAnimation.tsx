"use client";

import { useState, useEffect } from "react";
import {
  Radio,
  Cpu,
  Cloud,
  Layers,
  Activity,
  CheckCircle,
  Zap,
  ShieldCheck,
  Server,
  ArrowRight,
  Database,
  Gauge,
} from "lucide-react";

export function HeroFlowAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [packetCount, setPacketCount] = useState(48210);
  const [latestTag, setLatestTag] = useState("GX-E280-1170-4A9B");
  const [statusText, setStatusText] = useState("Continuous Stream Active (900+ reads/sec)");

  const tagPool = [
    { epc: "GX-E280-1170-4A9B", type: "Diamond Solitaire Ring 18K", loc: "Showcase Tray 04" },
    { epc: "GX-F092-2281-9C3E", type: "Heavy Pallet #4102 - FMCG", loc: "Dock Gate #02" },
    { epc: "GX-A714-8832-1D5F", type: "Student RFID Smart Card", loc: "Main Campus Gate" },
    { epc: "GX-C339-4410-7B8A", type: "FASTag Windshield Tag", loc: "Boom Barrier North" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
      setPacketCount((prev) => prev + Math.floor(Math.random() * 6) + 4);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const triggerManualSimulation = (idx: number) => {
    setActiveStep(idx);
    const randomTag = tagPool[Math.floor(Math.random() * tagPool.length)];
    setLatestTag(randomTag.epc);
    setStatusText(`Simulated: ${randomTag.type} verified at ${randomTag.loc}`);
  };

  const steps = [
    {
      id: "tag",
      label: "1. RFID Tag",
      sub: "WPC UHF Inlay",
      icon: Radio,
      desc: "Microchip with 96-bit EPC memory",
      color: "from-cyan-500 to-blue-500",
      activeText: "Tag Detected: 865-867 MHz",
    },
    {
      id: "reader",
      label: "2. Reader & Antennas",
      sub: "Impinj E710 Core",
      icon: Activity,
      desc: "Fixed / Handheld 33dBm 4-Port",
      color: "from-blue-500 to-cyan-400",
      activeText: "Captured in 1.4ms (RSSI: -42dBm)",
    },
    {
      id: "middleware",
      label: "3. GARVIX Engine",
      sub: "High-Speed Sockets",
      icon: Cpu,
      desc: "TCP / LLRP Socket Middleware",
      color: "from-cyan-400 to-purple-500",
      activeText: "De-duplicating 900+ reads/sec",
    },
    {
      id: "cloud",
      label: "4. Cloud Database",
      sub: "PostgreSQL & Ledger",
      icon: Database,
      desc: "ACID compliant real-time state",
      color: "from-purple-500 to-blue-600",
      activeText: "Inventory Ledger Synchronized",
    },
    {
      id: "dashboard",
      label: "5. Live Dashboard",
      sub: "Automation & Alerts",
      icon: Gauge,
      desc: "Instant ERP Dispatches & Telegram",
      color: "from-emerald-400 to-cyan-400",
      activeText: "Action: Barrier Open / Audit Verified",
    },
  ];

  return (
    <div className="relative rounded-3xl border border-cyan-500/30 bg-[#090e1c]/90 p-5 sm:p-7 shadow-[0_0_60px_rgba(0,242,254,0.18)] backdrop-blur-2xl overflow-hidden">
      {/* Glow elements */}
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-600/10 blur-[60px] pointer-events-none"></div>

      {/* Terminal Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="font-mono text-slate-300 font-bold ml-2">
            GARVIX-INTELLIGENT-FLOW
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full">
            <Zap className="h-3 w-3 animate-pulse" />
            <span>{packetCount.toLocaleString()} Tags Processed</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            Live
          </span>
        </div>
      </div>

      {/* Step Sequence Cards */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === idx;
          const isPassed = activeStep > idx;

          return (
            <div
              key={step.id}
              onClick={() => triggerManualSimulation(idx)}
              className={`group cursor-pointer rounded-2xl border p-3 sm:p-4 transition-all duration-300 ${
                isActive
                  ? "border-cyan-400/80 bg-gradient-to-r from-cyan-950/60 via-[#0d162d] to-cyan-950/40 shadow-[0_0_25px_rgba(0,242,254,0.2)] scale-[1.01]"
                  : isPassed
                  ? "border-cyan-500/20 bg-[#0c1222]/60 hover:border-cyan-500/40"
                  : "border-slate-800/80 bg-[#080d1a]/60 opacity-60 hover:opacity-90 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.4)]"
                        : isPassed
                        ? "border-blue-500/30 bg-blue-950/30 text-blue-400"
                        : "border-slate-700 bg-slate-900/60 text-slate-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {step.label}
                      </span>
                      <span className="hidden sm:inline-block rounded bg-cyan-950/80 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                        {step.sub}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {isActive ? (
                        <span className="text-cyan-300 font-medium animate-pulse">
                          ⚡ {step.activeText}
                        </span>
                      ) : (
                        step.desc
                      )}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isActive ? (
                    <span className="flex h-6 items-center rounded-full bg-cyan-500/20 border border-cyan-400 px-2.5 text-[10px] font-mono font-bold text-cyan-300">
                      Processing
                    </span>
                  ) : isPassed ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600">Standby</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Stream Status Bar */}
      <div className="mt-5 rounded-2xl border border-slate-800 bg-[#060a14] p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="font-mono text-[11px] text-slate-300 truncate">
            Current EPC: <strong className="text-cyan-300">{latestTag}</strong>
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          Latency: <span className="text-emerald-400 font-bold">1.2ms</span> • Packet Loss: <span className="text-emerald-400 font-bold">0.00%</span>
        </div>
      </div>
    </div>
  );
}
