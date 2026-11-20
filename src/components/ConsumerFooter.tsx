"use client";

import { Phone, Mail, MapPin, ShieldCheck, Heart, UserCheck } from "lucide-react";
import { VADODARA_CENTRAL_HUB, VADODARA_LOCATIONS, VED_BUSINESS_CONFIG } from "@/data/fleet";

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
              Vadodara&apos;s leading self-drive bike & car rental marketplace. Managed by{" "}
              <strong className="text-slate-800">{VED_BUSINESS_CONFIG.owner}</strong>. Slab-based transparent tariff, paperless KYC, and zero advance deposit.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{VED_BUSINESS_CONFIG.availabilityBadge} • Support Desk</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Our 6 Vadodara Hubs
            </h4>
            <ul className="space-y-1.5 text-xs font-medium">
              {VADODARA_LOCATIONS.map((loc) => (
                <li key={loc.id} className="text-slate-600 hover:text-emerald-600 transition-colors">
                  <button
                    onClick={() => scrollTo("fleet-section")}
                    className="text-left hover:text-emerald-600 transition-colors"
                  >
                    • {loc.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Host & Partner */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Fleet & Tariff Slabs
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => scrollTo("fleet-section")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Two-Wheelers: 1h, 3h, 6h, 12h, 24h
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("fleet-section")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Cars: Min 6h, 12h & 24h+ Slabs
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("host-section")}
                  className="hover:text-amber-600 transition-colors text-amber-700 font-bold"
                >
                  Host & Earn (Attach Your Car/Bike)
                </button>
              </li>
              <li>
                <span className="text-slate-500">Doorstep Delivery (+₹199) Across Vadodara</span>
              </li>
            </ul>
          </div>

          {/* Contact & Official Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Official Contact & Desk
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={`tel:${VED_BUSINESS_CONFIG.phone}`}
                className="flex items-center gap-2 text-slate-700 hover:text-emerald-600 font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{VED_BUSINESS_CONFIG.phone} ({VED_BUSINESS_CONFIG.availabilityBadge})</span>
              </a>

              <a
                href={`mailto:${VED_BUSINESS_CONFIG.email}`}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-semibold"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>{VED_BUSINESS_CONFIG.email}</span>
              </a>

              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lead: {VED_BUSINESS_CONFIG.owner}</span>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Central Hub: Station Circle Bay 04, Opp. Vadodara Junction Platform 1 & RC Dutt Road, Vadodara.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 Ved Travels. Vadodara, Gujarat (GJ-06). All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-emerald-700 font-semibold">• {VED_BUSINESS_CONFIG.availabilityBadge}</span>
            <span>Shantanu Shekhar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
