"use client";

import React from "react";
import { Clock, Calendar, Briefcase, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useRental, DURATION_PRESETS } from "@/context/RentalContext";

export function ZoomcarCategoriesGrid() {
  const { setSelectedDuration, setSearchCategory } = useRental();

  const handleSelectDaily = () => {
    setSelectedDuration(DURATION_PRESETS[2]); // 6 Hrs
    setSearchCategory("all");
    const el = document.getElementById("fleet-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectSubscription = () => {
    setSelectedDuration(DURATION_PRESETS[4]); // 24 Hrs
    setSearchCategory("car");
    const el = document.getElementById("fleet-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectWeekday = () => {
    setSelectedDuration(DURATION_PRESETS[3]); // 12 Hrs
    setSearchCategory("all");
    const el = document.getElementById("fleet-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            FLEXIBLE SELF-DRIVE PLANS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight mt-1">
            Drive On Your Terms in Vadodara
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-black/50 max-w-md">
          Choose from short hourly trips, weekly commuter passes, or long-term subscriptions with zero down-payment.
        </p>
      </div>

      {/* 3 Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Daily Drive */}
        <div
          onClick={handleSelectDaily}
          className="bg-white rounded-3xl border border-black/10 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:border-[#FF6B00]/40"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                MOST POPULAR
              </span>
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-black tracking-tight mb-2">
              Daily Drive (4+ Hours)
            </h3>
            <p className="text-xs text-black/60 font-medium leading-relaxed mb-5">
              Hourly & full-day bookings for city errands, business meetings, shopping runs, or day trips to Pavagadh & Ajwa.
            </p>

            <ul className="space-y-2 mb-6">
              {[
                "Instant 4-digit OTP handover",
                "2 Sanitized ISI Helmets with bikes",
                "Free pickup across 6 Vadodara Hubs",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs font-medium text-black/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="w-full h-11 rounded-2xl bg-black text-white hover:bg-black/90 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:bg-[#FF6B00] cursor-pointer"
          >
            <span>Book Daily Drive</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Card 2: Subscription */}
        <div
          onClick={handleSelectSubscription}
          className="bg-white rounded-3xl border border-black/10 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:border-[#FF6B00]/40"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                SAVE UP TO 35%
              </span>
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-black tracking-tight mb-2">
              Subscription (7+ Days)
            </h3>
            <p className="text-xs text-black/60 font-medium leading-relaxed mb-5">
              Long-term car & bike rentals for weeks or months. Enjoy personal mobility without the headache of EMI, road tax, or insurance.
            </p>

            <ul className="space-y-2 mb-6">
              {[
                "Zero down payment or EMI",
                "Full commercial insurance included",
                "Free doorstep routine servicing",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs font-medium text-black/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="w-full h-11 rounded-2xl bg-black text-white hover:bg-black/90 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:bg-[#FF6B00] cursor-pointer"
          >
            <span>Explore Subscription</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Card 3: Weekday Pass */}
        <div
          onClick={handleSelectWeekday}
          className="bg-white rounded-3xl border border-black/10 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:border-[#FF6B00]/40"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                COMMUTER PASS
              </span>
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-black tracking-tight mb-2">
              Weekday Pass (Mon - Fri)
            </h3>
            <p className="text-xs text-black/60 font-medium leading-relaxed mb-5">
              Work commute special from Monday morning to Friday night. Dedicated reserved vehicle at your nearest Vadodara hub or doorstep.
            </p>

            <ul className="space-y-2 mb-6">
              {[
                "Flat 25% off regular hourly tariffs",
                "Fuel and non-fuel packages available",
                "Reschedule trips anytime with zero fee",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs font-medium text-black/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="w-full h-11 rounded-2xl bg-black text-white hover:bg-black/90 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:bg-[#FF6B00] cursor-pointer"
          >
            <span>Get Weekday Pass</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
