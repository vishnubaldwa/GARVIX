"use client";

import {
  Cloud,
  Network,
  Radio,
  Activity,
  Globe,
  Smartphone,
  Database,
  Cpu,
  Zap,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function TechCapabilitiesSection() {
  const categories = [
    {
      name: "Cloud Infrastructure",
      icon: Cloud,
      desc: "Containerized deployments on Linux VPS & AWS with high availability, NGINX reverse proxies, and automated zero-downtime PM2 process reloaders.",
      stack: ["Linux Ubuntu Server", "PM2 Cluster Mode", "NGINX SSL Reverse Proxy", "Docker Containers"],
    },
    {
      name: "RFID Hardware Integration",
      icon: Radio,
      desc: "Low-level driver synthesis for Impinj, Zebra, and Chainway UHF modules operating on WPC-compliant 865-867 MHz Indian bands.",
      stack: ["Impinj E710 / R2000", "LLRP & Raw TCP/IP", "RP-TNC 4-Port RF Multiplexing", "Passive EPC Gen2 Inlays"],
    },
    {
      name: "Real-Time Streaming Systems",
      icon: Activity,
      desc: "High-throughput asynchronous event loops handling 900+ tag reads/second with in-memory de-duplication and sub-5ms latency.",
      stack: ["Node.js 22 Asynchronous I/O", "WebSocket Bidirectional Streams", "In-Memory LRU Ring Buffers", "MQTT Brokers"],
    },
    {
      name: "Full-Stack Web Applications",
      icon: Globe,
      desc: "Next.js 15 App Router architecture with React Server Components, TypeScript type-safety, and Tailwind CSS responsive styling.",
      stack: ["Next.js 15 (App Router)", "TypeScript 5.7", "React 19 Server Components", "Tailwind CSS"],
    },
    {
      name: "Mobile & Industrial Android",
      icon: Smartphone,
      desc: "Native Android floor applications designed for rugged handheld guns with laser barcode integration and audible Geiger counter tracking.",
      stack: ["Native Android SDK", "Hardware Laser & RFID API", "Offline SQLite Cache", "Industrial Zebra/Chainway SDKs"],
    },
    {
      name: "Databases & Data Integrity",
      icon: Database,
      desc: "ACID-compliant relational architectures backed by Prisma ORM and PostgreSQL with strict foreign-key integrity and encrypted snapshots.",
      stack: ["PostgreSQL 16", "Prisma 5.22 Schema Engine", "SQLite Local Fallback", "Encrypted Daily Snapshots"],
    },
    {
      name: "REST APIs & Webhooks",
      icon: Network,
      desc: "Clean JSON REST endpoints with HMAC authentication, rate limiting, and two-way Telegram/WhatsApp bot webhook dispatchers.",
      stack: ["RESTful JSON Endpoints", "Telegram Bot API", "HMAC Webhook Signatures", "WhatsApp Cloud API"],
    },
    {
      name: "Automation & Actuation Engines",
      icon: Zap,
      desc: "Direct integration with GPIO relay boards, optical sensors, boom barriers, and electronic strobe sirens for physical access execution.",
      stack: ["Wiegand 26/34 Protocols", "Dry-Contact Relays", "GPIO Strobe Actuators", "FASTag Vehicle Whitelists"],
    },
    {
      name: "Analytics & Business Intelligence",
      icon: BarChart3,
      desc: "Operational telemetry pipelines compiling live inventory heatmaps, shrinkage discrepancy rates, and 1-click GSTR-1/3B Excel workbooks.",
      stack: ["XLSX Multi-Sheet Generation", "Discrepancy Matrix", "Throughput Telemetry", "Real-Time Margin Audits"],
    },
    {
      name: "Security & Role-Based Access (RBAC)",
      icon: ShieldCheck,
      desc: "Granular permission engines with bcrypt salted password hashing, JWT stateless session cookies, and tamper-resistant audit logs.",
      stack: ["Bcrypt Password Hashing", "JWT HTTP-Only Cookies", "Granular RBAC Matrix", "Immutable Audit Trail"],
    },
  ];

  return (
    <section className="py-24 border-t border-cyan-500/20 bg-[#06080e] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <span>Engineering Grounding</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Technologies & Capabilities <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Powering GARVIX</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Every layer of our stack is built for durability, speed, and real-world industrial reliability. We use modern, battle-tested technologies without hype or bloat.
          </p>
        </div>

        {/* 10 Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;

            return (
              <div
                key={cat.name}
                className="rounded-3xl border border-slate-800 bg-[#090e1c]/80 p-6 hover:border-cyan-500/30 hover:bg-[#0c1324] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {cat.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-5">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1.5">
                    {cat.stack.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg bg-slate-900/90 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
