"use client";

import { useState } from "react";
import {
  Radio,
  Scan,
  Cpu,
  Database,
  LayoutDashboard,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  BellRing,
  ShieldCheck,
} from "lucide-react";

export function RealTimeSimulator() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [scenario, setScenario] = useState("JEWELLERY");

  const scenariosData: Record<string, {
    title: string;
    item: string;
    epc: string;
    actionOut: string;
    steps: { name: string; detail: string; latency: string }[];
  }> = {
    JEWELLERY: {
      title: "Diamond Jewellery Showcase Audit",
      item: "Solitaire Engagement Ring 18K White Gold",
      epc: "GX-JW-E280-491A",
      actionOut: "Tray #04 validated. Missing count: 0. Discrepancy report: Cleared.",
      steps: [
        { name: "RFID Tag Detected", detail: "WPC UHF printable tail tag enters 865 MHz field", latency: "0.2 ms" },
        { name: "Reader Captures EPC", detail: "Impinj E710 reader demodulates 96-bit EPC GX-JW-E280-491A", latency: "0.8 ms" },
        { name: "GARVIX Engine Identifies Product", detail: "Resolved in memory cache: Solitaire Ring (₹1,45,000 / HSN 7113)", latency: "1.1 ms" },
        { name: "Inventory Updated", detail: "Database record updated to AUDITED_CURRENT with timestamp", latency: "1.9 ms" },
        { name: "Dashboard Updated", detail: "Showcase tray GUI changes from yellow to glowing emerald green", latency: "2.4 ms" },
        { name: "Automation Triggered", detail: "Daily audit summary compiled and Telegram notification pushed", latency: "3.2 ms" },
      ],
    },
    WAREHOUSE: {
      title: "Warehouse Pallet Dock Dispatch",
      item: "Master Carton #4102 - 48 Units Power Inverters",
      epc: "GX-WH-9081-332D",
      actionOut: "Dock Door #02 traffic light switched to GREEN. Truck loading verified.",
      steps: [
        { name: "RFID Tag Detected", detail: "Carton tag passes 4-port dock door circular antennas", latency: "0.3 ms" },
        { name: "Reader Captures EPC", detail: "Dock reader captures 48 carton tags simultaneously", latency: "0.9 ms" },
        { name: "GARVIX Engine Identifies Product", detail: "Verified against Customer Dispatch Order #SO-8812 & E-Way Bill", latency: "1.4 ms" },
        { name: "Inventory Updated", detail: "Status flipped from WAREHOUSE_RACK to OUTWARD_IN_TRANSIT", latency: "2.2 ms" },
        { name: "Dashboard Updated", detail: "WMS shows Truck HR55-9012 at 100% manifest completion", latency: "2.8 ms" },
        { name: "Automation Triggered", detail: "Dock traffic light turns green; Delivery Challan PDF auto-printed", latency: "3.5 ms" },
      ],
    },
    CAMPUS: {
      title: "School Campus Smart Gate Entry",
      item: "Student Smart RFID ID Card - Aarav Sharma (Class 10-A)",
      epc: "GX-ED-1104-778C",
      actionOut: "Attendance marked PRESENT. Instant WhatsApp delivered to parent.",
      steps: [
        { name: "RFID Tag Detected", detail: "Student walks past overhead gate portal without stopping", latency: "0.2 ms" },
        { name: "Reader Captures EPC", detail: "Overhead 9dBi antenna reads card from 3.5 meter distance", latency: "0.7 ms" },
        { name: "GARVIX Engine Identifies Product", detail: "Matched student roll #24 - Aarav Sharma (Class 10-A)", latency: "1.2 ms" },
        { name: "Inventory Updated", detail: "School ERP attendance ledger marks status = PRESENT", latency: "1.8 ms" },
        { name: "Dashboard Updated", detail: "Principal & class teacher dashboard attendance count +1", latency: "2.3 ms" },
        { name: "Automation Triggered", detail: "WhatsApp message dispatched to parent: 'Aarav entered campus at 08:02 AM'", latency: "3.0 ms" },
      ],
    },
  };

  const currentData = scenariosData[scenario];

  const runSimulation = () => {
    setIsSimulating(true);
    setActiveStep(0);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 5) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setIsSimulating(false);
          return 5;
        }
      });
    }, 700);
  };

  const icons = [Radio, Scan, Cpu, Database, LayoutDashboard, Zap];

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-[#07090e] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Interactive Technology Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Real-Time Automation <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Event Simulator</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Experience the sub-second mechanics of GARVIX. Trigger a simulated real-world event and watch the execution sequence cascade across the entire stack.
          </p>
        </div>

        {/* Simulator Console Container */}
        <div className="rounded-3xl border border-cyan-500/30 bg-[#090e1c] p-6 sm:p-10 shadow-[0_0_70px_rgba(0,242,254,0.15)]">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2">Select Scenario:</span>
              <button
                type="button"
                onClick={() => {
                  setScenario("JEWELLERY");
                  setActiveStep(0);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  scenario === "JEWELLERY"
                    ? "border border-cyan-400 bg-cyan-950/70 text-cyan-300 shadow-md"
                    : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                }`}
              >
                💎 Jewellery Audit
              </button>

              <button
                type="button"
                onClick={() => {
                  setScenario("WAREHOUSE");
                  setActiveStep(0);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  scenario === "WAREHOUSE"
                    ? "border border-cyan-400 bg-cyan-950/70 text-cyan-300 shadow-md"
                    : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                }`}
              >
                📦 Warehouse Dock
              </button>

              <button
                type="button"
                onClick={() => {
                  setScenario("CAMPUS");
                  setActiveStep(0);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  scenario === "CAMPUS"
                    ? "border border-cyan-400 bg-cyan-950/70 text-cyan-300 shadow-md"
                    : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                }`}
              >
                🎓 Campus RFID Gate
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={runSimulation}
                disabled={isSimulating}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black shadow-lg hover:opacity-90 transition disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-black" />
                <span>{isSimulating ? "Simulating Event..." : "Trigger Simulation"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(0)}
                disabled={isSimulating}
                className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 hover:text-white transition disabled:opacity-50"
                title="Reset simulation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Scenario Overview */}
          <div className="rounded-2xl border border-slate-800 bg-[#060a14] p-4 sm:p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                ACTIVE TEST BENCH
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {currentData.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Target Entity: <strong className="text-slate-200">{currentData.item}</strong> (EPC: <span className="font-mono text-cyan-300">{currentData.epc}</span>)
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Cascade Time</span>
              <span className="font-mono text-xl font-black text-emerald-400">&lt; 3.5 milliseconds</span>
            </div>
          </div>

          {/* Step Sequence Trace */}
          <div className="space-y-3 mb-8">
            {currentData.steps.map((st, i) => {
              const Icon = icons[i];
              const isCurrent = activeStep === i;
              const isDone = activeStep > i;

              return (
                <div
                  key={st.name}
                  className={`rounded-2xl border p-4 transition-all duration-300 flex items-center justify-between gap-4 ${
                    isCurrent
                      ? "border-cyan-400 bg-cyan-950/60 shadow-[0_0_20px_rgba(0,242,254,0.25)] scale-[1.01]"
                      : isDone
                      ? "border-emerald-500/30 bg-emerald-950/20 text-slate-300"
                      : "border-slate-800/80 bg-[#080d1a]/60 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                        isCurrent
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                          : isDone
                          ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400"
                          : "border-slate-800 bg-slate-900 text-slate-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">0{i + 1}.</span>
                        <h5 className="text-sm font-bold text-white truncate">
                          {st.name}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {st.detail}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-400">
                      {st.latency}
                    </span>
                    {isCurrent ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    ) : isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-700"></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Outcome Confirmation Box */}
          <div
            className={`rounded-2xl border p-5 transition-all duration-300 flex items-center gap-4 ${
              activeStep === 5
                ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                : "border-slate-800 bg-[#060a14] text-slate-500"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current bg-current/10">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider block">
                Final Automated Outcome:
              </span>
              <p className="text-xs sm:text-sm font-semibold mt-0.5">
                {activeStep === 5
                  ? currentData.actionOut
                  : "Awaiting simulation trigger above..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
