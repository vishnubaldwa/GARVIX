import Link from "next/link";
import { Radio, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 bg-[#05070a] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
                <Radio className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-widest text-white">GARVIX</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Pioneering enterprise RFID hardware infrastructure and bespoke high-concurrency software architectures across India.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Registered in Haryana (Code: 06) • GST Compliant</span>
            </div>
          </div>

          {/* RFID Verticals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">RFID Solutions</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/solutions/rfid#jewellery" className="hover:text-cyan-400 transition">
                  Jewellery Stock Audit System
                </Link>
              </li>
              <li>
                <Link href="/solutions/rfid#warehouse" className="hover:text-cyan-400 transition">
                  Warehouse & Pallet Tracking
                </Link>
              </li>
              <li>
                <Link href="/solutions/rfid#assets" className="hover:text-cyan-400 transition">
                  IT & Fixed Asset Lifecycle
                </Link>
              </li>
              <li>
                <Link href="/solutions/rfid#fastag" className="hover:text-cyan-400 transition">
                  FASTag Parking & Toll Gate
                </Link>
              </li>
              <li>
                <Link href="/solutions/rfid#hardware" className="hover:text-cyan-400 transition">
                  Fixed Readers, Antennas & Tags
                </Link>
              </li>
            </ul>
          </div>

          {/* Software Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Custom Software</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/solutions/software#erp" className="hover:text-cyan-400 transition">
                  Custom ERP & CRM Engines
                </Link>
              </li>
              <li>
                <Link href="/solutions/software#web" className="hover:text-cyan-400 transition">
                  Full-Stack Web Applications
                </Link>
              </li>
              <li>
                <Link href="/solutions/software#iot" className="hover:text-cyan-400 transition">
                  RFID Hardware Middleware APIs
                </Link>
              </li>
              <li>
                <Link href="/solutions/software#mobile" className="hover:text-cyan-400 transition">
                  Handheld Scanner Android Apps
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-cyan-400 transition">
                  Staff Admin Login (/admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Corporate Office & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact GARVIX</h4>
            <div className="flex items-start gap-2.5 text-xs">
              <MapPin className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
              <span>Cyber Hub, DLF Cyber City, Gurugram, Haryana - 122002</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Phone className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Mail className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>contact@garvix.in</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              GSTIN: 06AAACG1234F1Z5
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GARVIX Technologies. All rights reserved.</p>
          <p className="flex items-center gap-4 mt-2 md:mt-0">
            <span>Powered by Next.js 15 & Node.js</span>
            <Link href="/admin/login" className="text-cyan-400 hover:underline">
              Admin Portal
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
