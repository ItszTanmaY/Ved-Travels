"use client";

import { VADODARA_CENTRAL_HUB, VADODARA_LOCATIONS, VED_BUSINESS_CONFIG } from "@/data/fleet";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Mail,
  UserCheck,
} from "lucide-react";

export default function HubDetailsSection() {
  return (
    <section id="hub-details" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Hub Information */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{VED_BUSINESS_CONFIG.availabilityBadge} • 6 VADODARA SERVICE POINTS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Vadodara Central Operations <br />
              <span className="text-emerald-600">Ved Travels (GJ-06)</span>
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed font-body">
              Managed personally by <strong className="text-slate-900">{VED_BUSINESS_CONFIG.owner}</strong>. We provide
              seamless vehicle handover across all major Vadodara transit nodes and university corridors with zero waiting time.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block text-xs">Primary Station Hub:</strong>
                  <span className="text-slate-600 leading-normal block mt-0.5">
                    {VADODARA_CENTRAL_HUB.address}
                  </span>
                  <span className="text-slate-400 text-[11px] block mt-1">
                    Landmark: {VADODARA_CENTRAL_HUB.landmark}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700">
                  Operational Timings: <strong className="text-slate-900">{VADODARA_CENTRAL_HUB.timings}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700">
                  Direct Line & WhatsApp: <strong className="text-slate-900">{VED_BUSINESS_CONFIG.phone}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700">
                  Official Email: <strong className="text-slate-900">{VED_BUSINESS_CONFIG.email}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700">
                  Owner / Support Lead: <strong className="text-slate-900">{VED_BUSINESS_CONFIG.owner}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={VADODARA_CENTRAL_HUB.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Open in Google Maps</span>
              </a>

              <a
                href={`https://wa.me/${VED_BUSINESS_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call {VED_BUSINESS_CONFIG.owner}</span>
              </a>
            </div>
          </div>

          {/* Right Column: 6 Vadodara Service Locations */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Our 6 Vadodara Service Points
                </h3>
                <span className="text-xs text-slate-500">
                  Instant pickup or doorstep delivery (+₹199) across all 6 zones:
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VADODARA_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-1 shadow-2xs hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{loc.name}</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {loc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5">{loc.landmark}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200/80 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero paperwork with Aadhaar & Driving License</span>
              </div>
              <span className="font-bold text-emerald-700">24×7 Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
