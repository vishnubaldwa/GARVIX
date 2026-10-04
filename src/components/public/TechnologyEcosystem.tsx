"use client";

import { useState } from "react";
import {
  Radio,
  Scan,
  Cpu,
  Server,
  Database,
  LayoutDashboard,
  BellRing,
  ArrowDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";

export function TechnologyEcosystem() {
  const [selectedNode, setSelectedNode] = useState(2); // default on Integration Layer

  const ecosystemNodes = [
    {
      step: "01",
      category: "HARDWARE",
      title: "RFID Tags & Inlays",
      subtitle: "Silicon microchips + antennas",
      icon: Radio,
      color: "cyan",
      protocols: "EPC Gen2 / ISO 18000-6C (865-867 MHz WPC)",
      details:
        "Specialized tags engineered for jewellery tail wraps, anti-metal mounts, carton corrugated cases, windshields, and laundry textiles with 96-bit to 496-bit EPC memory.",
      features: [
        "Jewellery printable tail tags",
        "Rugged on-metal ABS tags",
        "Passive UHF zero battery required",
        "Windshield tamper-evident FASTags",
      ],
    },
    {
      step: "02",
      category: "HARDWARE",
      title: "RFID Readers & Antennas",
      subtitle: "Fixed, Gate & Handheld units",
      icon: Scan,
      color: "blue",
      protocols: "Impinj E710 / R2000 chips • 33dBm RF power",
      details:
        "High-sensitivity 4-port fixed readers, circular polarized 9dBi IP67 antennas, and Bluetooth/Android handheld scanner guns capturing 900+ tags/second in 360-degree orientation.",
      features: [
        "Fixed 4-Port & 8-Port Readers",
        "Circular Polarized Antennas (9dBi)",
        "Overhead RFID Gate Portals",
        "Android Ergonomic RFID Guns",
      ],
    },
    {
      step: "03",
      category: "PROPRIETARY",
      title: "GARVIX Integration Layer",
      subtitle: "Hardware-to-Cloud Middleware",
      icon: Cpu,
      color: "purple",
      protocols: "TCP/IP • LLRP • WebSockets • MQTT • GPIO",
      details:
        "Our proprietary high-throughput engine converts raw binary reader RF streams into clean, de-duplicated structured events within milliseconds, buffering offline if connectivity drops.",
      features: [
        "Sub-millisecond packet de-duplication",
        "Local offline edge buffering",
        "Hardware health & RSSI telemetry",
        "Native GPIO buzzer/strobe triggers",
      ],
    },
    {
      step: "04",
      category: "SOFTWARE",
      title: "GARVIX Custom Software",
      subtitle: "Business Logic & Workflow Engine",
      icon: Server,
      color: "cyan",
      protocols: "Node.js 22 • Next.js 15 • REST APIs",
      details:
        "Bespoke application layer customized strictly to your company workflow — ERP validation, GST invoicing rules, student rolls, branch serial matching, and asset lifecycles.",
      features: [
        "Software built around your exact workflow",
        "Haryana GST 06 auto-computation",
        "Multi-branch serial number validation",
        "Role-Based Access Control (RBAC)",
      ],
    },
    {
      step: "05",
      category: "INFRASTRUCTURE",
      title: "Cloud / Database Ledger",
      subtitle: "ACID-compliant secure storage",
      icon: Database,
      color: "blue",
      protocols: "PostgreSQL • Redis Caching • SSL/TLS Encryption",
      details:
        "Immutable audit trails, timestamped scan records, transaction histories, and encrypted cloud backups ensuring zero data loss across PAN-India multi-location operations.",
      features: [
        "High-concurrency PostgreSQL ledger",
        "Automated encrypted daily snapshots",
        "Sub-10ms query execution times",
        "Compliant corporate audit logging",
      ],
    },
    {
      step: "06",
      category: "VISIBILITY",
      title: "Live Operations Dashboard",
      subtitle: "Real-time analytics & controls",
      icon: LayoutDashboard,
      color: "purple",
      protocols: "Real-Time WebSocket Sync • Web & Mobile",
      details:
        "Executive dashboards showing instant discrepancy reports, missing stock alerts, live gate throughput, branch inventory heatmaps, and staff productivity metrics.",
      features: [
        "Live tray & warehouse heatmaps",
        "Instant missing inventory highlights",
        "1-Click CA Return GST exports",
        "Multi-device responsive portal",
      ],
    },
    {
      step: "07",
      category: "ACTION",
      title: "Automation & Alerts",
      subtitle: "Physical & digital actuation",
      icon: BellRing,
      color: "emerald",
      protocols: "Telegram Bot • WhatsApp • SMS • Relay Actuators",
      details:
        "Instant real-world execution: automated boom barrier opening, warehouse dock green lights, security sirens on unbilled exit, and Telegram alerts to management.",
      features: [
        "Instant boom barrier relay actuation",
        "Telegram & WhatsApp instant alerts",
        "Anti-theft strobe & siren trigger",
        "Automated dispatch verification",
      ],
    },
  ];

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-[#06080e] relative overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/5 blur-[140px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Full-Stack Hardware + Software Synthesis</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            The GARVIX <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Technology Ecosystem</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Most vendors sell isolated hardware and leave you to figure out the code. Other agencies write software but don&apos;t understand RF physics. <strong>GARVIX bridges both in one seamless unified pipeline.</strong>
          </p>
        </div>

        {/* Pipeline Grid & Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Flow Steps */}
          <div className="lg:col-span-6 space-y-3">
            {ecosystemNodes.map((node, index) => {
              const Icon = node.icon;
              const isSelected = selectedNode === index;

              return (
                <div key={node.step}>
                  <div
                    onClick={() => setSelectedNode(index)}
                    className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                      isSelected
                        ? "border-cyan-400 bg-gradient-to-r from-cyan-950/70 to-[#0e162a] shadow-[0_0_30px_rgba(0,242,254,0.2)] scale-[1.02]"
                        : "border-slate-800/80 bg-[#0a0f1c]/70 hover:border-cyan-500/30 hover:bg-[#0c1324]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-cyan-400">
                          {node.step}
                        </span>
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                              : "border-slate-800 bg-slate-900/60 text-slate-400 group-hover:text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {node.title}
                            </h4>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {node.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {node.subtitle}
                          </p>
                        </div>
                      </div>

                      <ArrowRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isSelected
                            ? "text-cyan-400 translate-x-1"
                            : "text-slate-600 group-hover:text-slate-400"
                        }`}
                      />
                    </div>
                  </div>

                  {index < ecosystemNodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="h-3.5 w-3.5 text-cyan-500/40 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep-Dive Inspector Card */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-cyan-500/40 bg-[#090e1c] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,242,254,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none"></div>

              {/* Node Inspector Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-3 py-1 text-[11px] font-mono font-bold text-cyan-300 mb-2">
                    LAYER {ecosystemNodes[selectedNode].step} • {ecosystemNodes[selectedNode].category}
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    {ecosystemNodes[selectedNode].title}
                  </h3>
                  <p className="text-xs text-cyan-400 font-mono mt-1">
                    {ecosystemNodes[selectedNode].protocols}
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-950/40 text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.25)] shrink-0">
                  {(() => {
                    const CurrentIcon = ecosystemNodes[selectedNode].icon;
                    return <CurrentIcon className="h-7 w-7" />;
                  })()}
                </div>
              </div>

              {/* Detailed Explanation */}
              <p className="text-xs sm:text-sm leading-relaxed text-slate-300 mb-6">
                {ecosystemNodes[selectedNode].details}
              </p>

              {/* Key Deliverables & Features */}
              <div className="space-y-3 mb-8">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Key Capabilities in this Tier:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ecosystemNodes[selectedNode].features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-[#060a14] p-2.5 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quote / Badge */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>100% End-to-End Implementation Handled by GARVIX</span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">Zero Third Parties</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
