"use client";

import { useState } from "react";
import { Calculator, Clock, TrendingUp, DollarSign, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function RoiCalculator() {
  const [itemCount, setItemCount] = useState<number>(15000);
  const [staffCount, setStaffCount] = useState<number>(3);
  const [hourlyWage, setHourlyWage] = useState<number>(350);
  const [auditsPerMonth, setAuditsPerMonth] = useState<number>(4);

  // Math models:
  // Barcode / Manual scan speed: ~120 items per hour per staff member
  const manualHoursPerAudit = Math.max(1, Math.round(itemCount / (120 * staffCount)));
  // RFID speed: ~25,000 items per hour (single staff member with handheld scanner or fixed reader)
  const rfidMinutesPerAudit = Math.max(5, Math.round((itemCount / 25000) * 60));
  const rfidHoursPerAudit = Math.round((rfidMinutesPerAudit / 60) * 10) / 10;

  // Monthly labor cost:
  const monthlyManualCost = manualHoursPerAudit * staffCount * hourlyWage * auditsPerMonth;
  const monthlyRfidCost = (rfidMinutesPerAudit / 60) * 1 * hourlyWage * auditsPerMonth;
  const annualSavings = Math.round((monthlyManualCost - monthlyRfidCost) * 12);
  const hoursSavedPerYear = Math.round((manualHoursPerAudit * staffCount - rfidHoursPerAudit) * auditsPerMonth * 12);

  return (
    <div id="roi-calculator" className="relative mx-auto max-w-5xl rounded-2xl border border-cyan-500/30 bg-[#0a0f1d]/90 p-6 md:p-10 shadow-[0_0_50px_rgba(0,242,254,0.1)] backdrop-blur-xl">
      <div className="absolute -top-3 left-8 rounded-full border border-cyan-400 bg-cyan-950 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
        Interactive Business Tool
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-extrabold text-white">
          RFID vs Manual Audit <span className="text-cyan-400">ROI Calculator</span>
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Calculate exact labor hours saved, stock discrepancy reduction, and annual ROI by switching from barcode to GARVIX RFID.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
        {/* Sliders Input Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1 */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Total Inventory Items / Stock Pieces</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">
                {itemCount.toLocaleString("en-IN")} pcs
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 rounded-lg bg-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>1,000</span>
              <span>50,000</span>
              <span>1,00,000</span>
            </div>
          </div>

          {/* Slider 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Staff for Audit</span>
                <span className="text-cyan-400 font-mono font-bold">{staffCount} persons</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={staffCount}
                onChange={(e) => setStaffCount(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 rounded-lg bg-slate-800"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Audits / Month</span>
                <span className="text-cyan-400 font-mono font-bold">{auditsPerMonth} times</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={auditsPerMonth}
                onChange={(e) => setAuditsPerMonth(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 rounded-lg bg-slate-800"
              />
            </div>
          </div>

          {/* Slider 3 */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Average Hourly Labor Cost (₹ / Hour)</span>
              <span className="text-cyan-400 font-mono font-bold">₹{hourlyWage}/hr</span>
            </div>
            <input
              type="range"
              min="150"
              max="1200"
              step="50"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 rounded-lg bg-slate-800"
            />
          </div>

          {/* Comparison Bar */}
          <div className="rounded-xl border border-slate-800 bg-[#070b13] p-4 text-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Manual Barcode Audit Time:</span>
              <span className="font-mono font-bold text-rose-400">
                ~{manualHoursPerAudit} Hours / audit
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">GARVIX RFID Scan Time:</span>
              <span className="font-mono font-bold text-emerald-400">
                ~{rfidMinutesPerAudit} Minutes / audit (98% faster)
              </span>
            </div>
          </div>
        </div>

        {/* Results Output Column */}
        <div className="lg:col-span-5 rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-[#0d1726] to-[#080d17] p-6 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl"></div>

          <span className="text-xs uppercase tracking-wider text-cyan-300 font-bold">
            Estimated Annual Value
          </span>

          <div className="my-4">
            <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-400 font-mono">
              ₹{annualSavings.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Direct Labor & Operational Savings / Year</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left my-5 border-y border-cyan-500/20 py-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5 text-cyan-400" /> Time Saved
              </div>
              <p className="text-sm font-bold text-white font-mono mt-1">
                {hoursSavedPerYear.toLocaleString("en-IN")} hrs/yr
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Audit Speed
              </div>
              <p className="text-sm font-bold text-white font-mono mt-1">
                900+ tags/sec
              </p>
            </div>
          </div>

          <Link
            href="#contact"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:opacity-95 transition"
          >
            Claim This ROI For Your Business
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
