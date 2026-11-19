"use client";

import React, { useState } from "react";
import { PhoneCall, MessageCircle, X, Sparkles } from "lucide-react";
import { VED_BUSINESS_CONFIG } from "@/data/fleet";

export function FloatingWhatsAppSupport() {
  const [isOpen, setIsOpen] = useState(false);

  const phone = VED_BUSINESS_CONFIG.phone; // "+91 95468 83777"
  const waNumber = VED_BUSINESS_CONFIG.whatsappNumber; // "9546883777"
  const cleanPhone = phone.replace(/[^0-9+]/g, "");

  const defaultWaMessage = encodeURIComponent(
    `Hello Ved Travels! I would like to inquire about self-drive bike/car rentals in Vadodara.`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${defaultWaMessage}`;

  return (
    <aside aria-label="Quick contact" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Expanded Quick Contact Card */}
      {isOpen && (
        <div className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-200/80 w-72 sm:w-80 animate-in fade-in slide-in-from-bottom-4 duration-200 mb-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold text-sm">
                VT
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>Ved Travels Helpline</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Direct Support with Shantanu Shekhar
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close support menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-3 space-y-2">
            <p className="text-xs text-slate-600 leading-relaxed">
              Have questions about vehicle tariffs, doorstep delivery, or instant bookings? Reach out 24×7!
            </p>

            <div className="space-y-2 pt-1">
              {/* WhatsApp Action */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/25 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>

              {/* Call Action */}
              <a
                href={`tel:${cleanPhone}`}
                className="w-full h-10 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call {phone}</span>
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              Sayajigunj • Waghodia • Ajwa • Airport • Parul
            </span>
          </div>
        </div>
      )}

      {/* Persistent Floating Pills / Buttons */}
      <div className="flex items-center gap-2">
        {/* Roaming Quick Call Pill (Desktop & Tablet) */}
        <a
          href={`tel:${cleanPhone}`}
          className="hidden md:inline-flex items-center gap-2 h-12 px-4 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 shadow-xl hover:shadow-2xl hover:border-slate-300 active:scale-95 transition-all group font-bold text-xs"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#059669]/10 text-[#059669] flex items-center justify-center transition-colors">
            <PhoneCall className="w-3.5 h-3.5" />
          </div>
          <span>Call 24×7: {phone}</span>
        </a>

        {/* Roaming Floating WhatsApp Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-12 px-4 sm:px-5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-xl hover:shadow-2xl shadow-[#25D366]/30 active:scale-95 transition-all group cursor-pointer"
          aria-label="Chat on WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 fill-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-900" />
            </span>
          </div>
          <span className="tracking-wide">WhatsApp Us</span>
        </a>

        {/* Quick Menu Toggle for extra details */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
          aria-label="Toggle contact helpline options"
        >
          {isOpen ? <X className="w-5 h-5" /> : <PhoneCall className="w-4 h-4 text-[#059669]" />}
        </button>
      </div>
    </aside>
  );
}
