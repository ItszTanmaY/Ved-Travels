"use client";

import { VADODARA_CENTRAL_HUB } from "@/data/fleet";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Compass,
} from "lucide-react";

export default function HubDetailsSection() {
  const deliveryAreas = [
    "Alkapuri & RC Dutt Rd",
    "Vadodara Junction Platforms",
    "Gotri & Sevasi",
    "Manjalpur & Makarpura",
    "Fatehgunj & MSU Campus",
    "Akota & Old Padra Rd",
    "Waghodia Highway Corridor",
    "Karelibaug & Sama",
  ];

  return (
    <section id="hub-details" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Hub Information */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>SINGLE CENTRAL CONVENIENCE HUB</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Vadodara Central Hub <br />
              <span className="text-emerald-600">(Sayajigunj / Alkapuri)</span>
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed font-body">
              Strategically situated right opposite Vadodara Railway Junction (Platform 1) and connecting
              directly to RC Dutt Road, Alkapuri. Zero confusing branch offices—all machines are prepared, sanitized,
              and inspected at this central station.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block text-xs">Central Station Address:</strong>
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
                  Operational Timings: <strong className="text-slate-900">24/7 Around The Clock</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700">
                  Concierge Desk: <strong className="text-slate-900">+91 95468 83777</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={VADODARA_CENTRAL_HUB.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Open in Google Maps</span>
              </a>

              <a
                href="https://wa.me/919546883777"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Bay Manager</span>
              </a>
            </div>
          </div>

          {/* Right Column: Doorstep Delivery Coverage */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Doorstep Delivery Available Across Vadodara (+₹199)
                </h3>
                <span className="text-xs text-slate-500">
                  Don&apos;t feel like visiting the hub? We deliver to you.
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Check &quot;Add Doorstep Delivery (+₹199)&quot; when booking any vehicle. Our executive will deliver
              the machine with your 4-digit OTP handover right to your location:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              {deliveryAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center gap-2 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{area}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Full tank to full tank fuel policy • Sanitized helmets provided with bikes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
