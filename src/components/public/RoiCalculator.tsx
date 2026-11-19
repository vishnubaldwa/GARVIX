"use client";

import { useState } from "react";
import { Calculator, Clock, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
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
    <div id="roi-calculator" className="relative mx-auto max-w-5xl rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-3">
          <Calculator className="h-3.5 w-3.5 text-blue-600" />
          <span>Interactive Business Value Calculator</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Calculate Your RFID Return on Investment
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          See exactly how many labor hours and lakhs in stock shrinkage your enterprise saves every year by upgrading from manual barcodes to GARVIX RFID automation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
        {/* Sliders Input Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1 */}
          <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-2">
              <span>Total Inventory Items / Stock Units</span>
              <span className="text-blue-600 font-mono font-bold text-sm">
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
              className="w-full accent-blue-600 cursor-pointer h-2 rounded-lg bg-slate-200"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1,000 pcs (Retail Store)</span>
              <span>1,00,000+ pcs (Warehouse)</span>
            </div>
          </div>

          {/* Slider 2 */}
          <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-2">
              <span>Audit Staff Members Involved</span>
              <span className="text-blue-600 font-mono font-bold text-sm">
                {staffCount} {staffCount === 1 ? "person" : "people"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={staffCount}
              onChange={(e) => setStaffCount(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 rounded-lg bg-slate-200"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 person</span>
              <span>15 staff members</span>
            </div>
          </div>

          {/* Slider 3 */}
          <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-2">
              <span>Stock Audits Per Month</span>
              <span className="text-blue-600 font-mono font-bold text-sm">
                {auditsPerMonth} times/month
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={auditsPerMonth}
              onChange={(e) => setAuditsPerMonth(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 rounded-lg bg-slate-200"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Monthly (1 time)</span>
              <span>Daily (30 times)</span>
            </div>
          </div>

          {/* Slider 4 */}
          <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-2">
              <span>Average Hourly Staff Cost (₹)</span>
              <span className="text-blue-600 font-mono font-bold text-sm">
                ₹{hourlyWage}/hr
              </span>
            </div>
            <input
              type="range"
              min="150"
              max="1500"
              step="50"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 rounded-lg bg-slate-200"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-[#f5f5f7] p-6 space-y-5">
          <div className="text-center pb-4 border-b border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Estimated Annual Savings
            </span>
            <div className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900">
              ₹{(annualSavings / 100000).toFixed(2)}{" "}
              <span className="text-base font-semibold text-emerald-600">Lakhs / yr</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Direct operational labor savings alone
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-3.5 border border-slate-200/60 shadow-sm text-center">
              <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-slate-500">Audit Time Saved</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {hoursSavedPerYear.toLocaleString("en-IN")} hrs
              </div>
              <div className="text-[10px] text-slate-400">per year</div>
            </div>

            <div className="rounded-xl bg-white p-3.5 border border-slate-200/60 shadow-sm text-center">
              <TrendingUp className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-slate-500">Speed Increase</div>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">
                {(manualHoursPerAudit / (rfidMinutesPerAudit / 60)).toFixed(0)}x Faster
              </div>
              <div className="text-[10px] text-slate-400">instant bulk read</div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Barcode Audit: ~{manualHoursPerAudit} hours per session</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>GARVIX RFID: ~{rfidMinutesPerAudit} minutes per session</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>99.9% reduction in inventory shrinkage</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/contact#contact"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-black py-3 text-xs font-semibold text-white shadow-sm transition"
            >
              <span>Get Customized Business Proposal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}