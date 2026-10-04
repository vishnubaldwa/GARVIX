"use client";

import { useState } from "react";
import {
  Radio,
  Wifi,
  Scan,
  Cpu,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  ShieldAlert,
  MapPin,
  FileCheck,
  UserCheck,
} from "lucide-react";

export function RfidWorkflowSection() {
  const [selectedAction, setSelectedAction] = useState(0);

  const workflowSteps = [
    { title: "TAG", desc: "Passive UHF EPC Gen2 Inlay", icon: Radio },
    { title: "ANTENNA", desc: "9dBi Circular Polarized RF Field", icon: Wifi },
    { title: "READER", desc: "4-Port Impinj E710 Core (33dBm)", icon: Scan },
    { title: "GARVIX ENGINE", desc: "High-Throughput Socket Middleware", icon: Cpu },
    { title: "SOFTWARE", desc: "Business Rules & ERP Validation", icon: Server },
    { title: "AUTOMATION", desc: "Physical Relay & Digital Execution", icon: Zap },
  ];

  const automationExamples = [
    {
      id: "inventory",
      title: "Inventory Updated",
      icon: FileCheck,
      color: "cyan",
      badge: "Real-Time Stock Audit",
      latency: "1.4 ms",
      trigger: "Handheld scanner sweeps across jewellery showcase tray (250 items).",
      action: "All 250 items matched against current database ledger in 2.1 seconds. Discrepancies flagged instantly.",
      outputEvent: "Ledger status set to 'AUDITED_OK'. No manual barcode scans required.",
    },
    {
      id: "attendance",
      title: "Attendance Recorded",
      icon: UserCheck,
      color: "blue",
      badge: "Smart Gate Entry",
      latency: "2.1 ms",
      trigger: "Student or employee walks through the main campus RFID gate portal wearing an RFID ID card.",
      action: "Overhead antennas read tag from 4 meters away without stopping or tapping. Roll marked as 'PRESENT'.",
      outputEvent: "Instant WhatsApp message dispatched to parent: 'Aarav entered campus at 08:04 AM'.",
    },
    {
      id: "theft",
      title: "Unauthorized Exit Detected",
      icon: ShieldAlert,
      color: "rose",
      badge: "Retail Anti-Theft",
      latency: "0.8 ms",
      trigger: "Unsold garment or jewellery piece passes retail exit gate antennas without cashier POS deactivation.",
      action: "GARVIX engine verifies status is 'IN_STOCK_UNPAID' and fires local GPIO relay in under 40 milliseconds.",
      outputEvent: "Strobe light flashes red, loud 105dB security buzzer sounds, and CCTV clip is bookmarked.",
    },
    {
      id: "asset",
      title: "Asset Located",
      icon: MapPin,
      color: "purple",
      badge: "IT & Fixed Asset",
      latency: "3.0 ms",
      trigger: "Staff searches for misplaced IT laptop or calibration tool using Android handheld scanner gun.",
      action: "Handheld gun operates in Geiger counter audio mode, beeping faster and louder as distance narrows.",
      outputEvent: "Target asset located behind Server Rack #04 in Room 302 within 45 seconds.",
    },
    {
      id: "movement",
      title: "Stock Movement Recorded",
      icon: Clock,
      color: "emerald",
      badge: "Warehouse Logistics",
      latency: "1.8 ms",
      trigger: "Forklift drives loaded pallet with 48 tagged cartons through Warehouse Dock Door #02.",
      action: "Fixed reader captures all 48 carton tags simultaneously, checks destination truck schedule, and verifies E-Way Bill.",
      outputEvent: "Delivery Challan auto-generated. Stock moved from 'Aisle 4' to 'Transit - Truck HR55-9012'.",
    },
    {
      id: "security",
      title: "Security Alert Triggered",
      icon: AlertTriangle,
      color: "amber",
      badge: "Access & Perimeter",
      latency: "1.2 ms",
      trigger: "Vehicle FASTag detected at residential or commercial boom barrier with expired access pass.",
      action: "System blocks relay opening, keeps barrier closed, and logs high-resolution snapshot of vehicle license plate.",
      outputEvent: "Security desk screen flashes alert: 'Expired Pass - Manual Verification Required'.",
    },
  ];

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-[#06080d] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span>High-Speed Physical-to-Digital Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            From RFID Tag to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Real-Time Action
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Every millisecond counts. See how a microscopic radio signal captured by GARVIX hardware turns into instant enterprise decisions, physical relay triggers, and automated communications.
          </p>
        </div>

        {/* The 6-Step Horizontal Pipeline */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-cyan-500/20 bg-[#090e1c]/80 p-4 text-center group hover:border-cyan-400 transition-all duration-300"
                >
                  <div className="flex h-11 w-11 mx-auto items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    STEP 0{idx + 1}
                  </div>
                  <h4 className="text-sm font-black text-white mt-0.5 tracking-wider">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6 Real-World Automation Scenarios */}
        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">
                Live Automation Triggers & Scenarios
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any scenario below to inspect how the hardware and software respond in real time.
              </p>
            </div>
            <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full w-fit">
              Response Time: &lt; 5 milliseconds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {automationExamples.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedAction === index;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAction(index)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(0,242,254,0.2)] scale-[1.02]"
                      : "border-slate-800/80 bg-[#090e1c]/60 hover:border-slate-700 hover:bg-[#0c1324]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      {item.latency}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                    {item.badge}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.trigger}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Expanded Selected Scenario View */}
          <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-[#0a1022] to-[#070b16] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,242,254,0.12)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  TRIGGER EVENT
                </span>
                <h5 className="text-lg font-bold text-white">
                  Physical Real-World Action
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {automationExamples[selectedAction].trigger}
                </p>
              </div>

              <div className="space-y-2 md:border-l md:border-r border-slate-800 md:px-6">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">
                  GARVIX COMPUTATION
                </span>
                <h5 className="text-lg font-bold text-white">
                  Sub-Second Logic Execution
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {automationExamples[selectedAction].action}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                  AUTOMATED OUTCOME
                </span>
                <h5 className="text-lg font-bold text-white">
                  Instant Physical / Digital Result
                </h5>
                <p className="text-xs text-emerald-300/90 leading-relaxed font-mono">
                  ✓ {automationExamples[selectedAction].outputEvent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
