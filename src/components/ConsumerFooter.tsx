"use client";

import { Phone, Mail, MapPin, ShieldCheck, Heart } from "lucide-react";
import { VADODARA_CENTRAL_HUB } from "@/data/fleet";

export default function ConsumerFooter() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                V
              </div>
              <span className="font-heading font-extrabold text-lg text-slate-900">
                VED <span className="text-emerald-600">TRAVELS</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-body">
              Vadodara&apos;s leading self-drive bike & car rental and host marketplace. Clean vehicles,
              transparent pricing, paperless KYC, and instant deposit refunds.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Gujarat RTO Approved Commercial Fleet</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Explore Fleet
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => scrollTo("fleet-section")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Bikes on Rent (Activa, Classic, Hunter)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("fleet-section")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Self-Drive Cars (Swift, Creta, Thar)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("how-it-works")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Zero-Counter Handover & KYC Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("hub-details")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Doorstep Delivery (+₹199) Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Host & Partner */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Host & Earn
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => scrollTo("host-section")}
                  className="hover:text-amber-600 transition-colors text-amber-700 font-bold"
                >
                  Attach Your Bike/Car (Earn ₹75k/mo)
                </button>
              </li>
              <li>
                <span className="text-slate-500">₹10 Lakh Insurance Coverage</span>
              </li>
              <li>
                <span className="text-slate-500">Free Doorstep GPS Installation</span>
              </li>
              <li>
                <span className="text-slate-500">Weekly Monday Direct Bank Payouts</span>
              </li>
            </ul>
          </div>

          {/* Contact & Central Hub */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Vadodara Central Desk
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href="tel:+919546883777"
                className="flex items-center gap-2 text-slate-700 hover:text-emerald-600 font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91 95468 83777 (24/7 Helpline)</span>
              </a>

              <a
                href="mailto:support@vedtravels.in"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>support@vedtravels.in</span>
              </a>

              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Station Circle Bay 04, Opp. Vadodara Junction Platform 1 & RC Dutt Road, Alkapuri, Vadodara.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 Ved Travels Mobility Pvt. Ltd. Vadodara (GJ-06). All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span>RTO REG: GJ-06-COMMERCIAL</span>
            <span>Sayajigunj • Alkapuri Central</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
