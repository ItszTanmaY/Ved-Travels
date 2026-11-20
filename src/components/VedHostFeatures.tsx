"use client";

import React from "react";
import { TrendingUp, ShieldCheck, Calculator, ArrowRight, CheckCircle2, Sparkles, Car } from "lucide-react";
import { useRental } from "@/context/RentalContext";

export function VedHostFeatures() {
  const { currentUser, openHostDashboard, openAuthModal } = useRental();

  const handleRegisterClick = () => {
    if (currentUser?.role === "host") {
      openHostDashboard();
    } else {
      openAuthModal("host");
    }
  };

  const handleCalculatorClick = () => {
    const el = document.getElementById("host-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Banner Box */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1A1A1A] to-slate-950 text-white rounded-[2.5rem] p-6 sm:p-10 lg:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Section Heading & Register Now Arrow */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#FF6B00]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VED TRAVELS HOST PARTNER PROGRAM IN VADODARA</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Why Vadodara Vehicle Owners Host with Ved Travels
            </h2>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-light">
              Turn your parked vehicle into a high-yield passive business. Zero upfront investment, verified renters, and guaranteed timely Monday payouts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRegisterClick}
            className="self-start md:self-auto h-12 px-6 rounded-full bg-[#FF6B00] hover:bg-[#E56000] active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#FF6B00]/30 transition-all cursor-pointer shrink-0"
          >
            <span>Register Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Distinct Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Card 1: Earn from your Car */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Earn from your Car / Bike
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-light mb-4">
                Generate ₹35,000 to ₹85,000 per month effortlessly. Your vehicle only goes out to KYC-verified renters with secure 4-digit handover OTP verification.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
              <span className="font-semibold">Weekly Direct Bank Transfer</span>
              <span className="text-[#FF6B00] font-bold">Every Monday</span>
            </div>
          </div>

          {/* Card 2: Hassle-free vehicle repairs */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Hassle-free vehicle repairs
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-light mb-4">
                Full ₹10 Lakh commercial insurance policy. In the rare event of damage, our Vadodara authorized service center handles 100% of claims with zero cost to you.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
              <span className="font-semibold">GPS Speed Monitoring</span>
              <span className="text-emerald-400 font-bold">Speed Capped &lt;85 km/h</span>
            </div>
          </div>

          {/* Card 3: Calculate your future earning */}
          <div
            onClick={handleCalculatorClick}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF6B00] transition-colors">
                Calculate your future earning
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-light mb-4">
                Check potential returns based on car model (Swift, Creta, Thar) or bike (Hunter 350, Activa 6G) and sharing days per month with our live estimator.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
              <span className="font-semibold">Instant Yield Simulator</span>
              <span className="text-[#FF6B00] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Try Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
