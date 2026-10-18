"use client";

import React from "react";
import { Compass, Gift, Bike, ArrowRight, Sparkles, Navigation } from "lucide-react";
import { useRental } from "@/context/RentalContext";
import { toast } from "sonner";

export function ZoomcarExploreGrid() {
  const { setSearchCategory } = useRental();

  const handleBikeClick = () => {
    setSearchCategory("bike");
    const el = document.getElementById("fleet-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleIntercityClick = () => {
    toast.info("Intercity Cabs Launching Next Month!", {
      description: "Vadodara to Ahmedabad, Surat, and Mumbai route registrations opening soon.",
    });
  };

  const handleGiftClick = () => {
    toast.success("Gift Vouchers Available at Sayajigunj Hub!", {
      description: "Contact our 24/7 Helpline (+91 95468 83777) to issue custom digital drive gift cards.",
    });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            MORE WAYS TO TRAVEL
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight mt-1">
            Explore Beyond Self-Drive
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-black/50 max-w-md">
          From budget-friendly city two-wheelers to curated road-trip gifts and intercity connectivity.
        </p>
      </div>

      {/* 3 Explore Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Intercity Cabs (Coming Soon) */}
        <div
          onClick={handleIntercityClick}
          className="bg-[#FAFAF9] rounded-3xl border border-black/10 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full">
                COMING SOON
              </span>
              <div className="w-10 h-10 rounded-2xl bg-white border border-black/10 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Navigation className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-black tracking-tight mb-2">
              Intercity Cabs
            </h3>
            <p className="text-xs text-black/60 font-medium leading-relaxed mb-4">
              One-way & round-trip chauffered travel from Vadodara to Ahmedabad Airport, Surat, Statue of Unity, and Mumbai.
            </p>

            <div className="space-y-1.5 text-xs text-black/70 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Verified commercial chauffeurs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Fixed upfront pricing • Zero surge</span>
              </div>
            </div>
          </div>

          <div className="w-full h-11 rounded-2xl bg-white border border-black/15 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:border-black/30">
            <span>Notify Me On Launch</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Gift a Drive */}
        <div
          onClick={handleGiftClick}
          className="bg-[#FAFAF9] rounded-3xl border border-black/10 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full">
                INSTANT VOUCHERS
              </span>
              <div className="w-10 h-10 rounded-2xl bg-white border border-black/10 flex items-center justify-center text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <Gift className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-black tracking-tight mb-2">
              Gift a Drive
            </h3>
            <p className="text-xs text-black/60 font-medium leading-relaxed mb-4">
              Gift a memorable road trip to friends, family, or colleagues. Redeemable across all cars & bikes at our Vadodara Hub.
            </p>

            <div className="space-y-1.5 text-xs text-black/70 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Valid for 12 months from issue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Custom greeting message & card</span>
              </div>
            </div>
          </div>

          <div className="w-full h-11 rounded-2xl bg-white border border-black/15 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:border-black/30">
            <span>Get Gift Voucher</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Bike & Scooter Rentals */}
        <div
          onClick={handleBikeClick}
          className="bg-white rounded-3xl border border-[#FF6B00]/40 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden ring-1 ring-[#FF6B00]/20"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-[#FF6B00] border border-orange-200 px-2.5 py-0.5 rounded-full">
                AVAILABLE NOW • FREE HELMETS
              </span>
              <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                <Bike className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-black tracking-tight mb-2">
              Bike & Scooter Rentals
            </h3>
            <p className="text-xs text-black/60 font-medium leading-relaxed mb-4">
              Honda Activa 6G, Royal Enfield Hunter 350, Classic 350, TVS Ntorq. Navigate Vadodara&apos;s bustling streets with maximum speed and ease.
            </p>

            <div className="space-y-1.5 text-xs text-black/70 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Starts at just ₹49/hour or ₹449/day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>2 ISI-certified helmets included free</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full h-11 rounded-2xl bg-[#FF6B00] text-white hover:bg-[#E56000] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#FF6B00]/20"
          >
            <span>Rent a Two-Wheeler</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
