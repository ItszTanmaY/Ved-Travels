"use client";

import { useState } from "react";
import { useRental } from "@/context/RentalContext";
import { formatINR } from "@/lib/utils";
import {
  Sparkles,
  Bike,
  Car,
  ShieldCheck,
  MapPin,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function HostSection() {
  const { openAuthModal, openHostDashboard, currentUser } = useRental();
  const [vehicleType, setVehicleType] = useState<"bike" | "car">("car");
  const [daysRented, setDaysRented] = useState<number>(15);

  const dailyYield = vehicleType === "car" ? 2200 : 750;
  const grossMonthly = dailyYield * daysRented;
  const platformFee = Math.round(grossMonthly * 0.25);
  const netMonthly = grossMonthly - platformFee;
  const annualized = netMonthly * 12;

  const handleCta = () => {
    if (currentUser?.role === "host") {
      openHostDashboard();
    } else {
      openAuthModal("host");
    }
  };

  return (
    <section id="host-section" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>VED HOST PARTNER MARKETPLACE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
            Earn Up To <span className="text-amber-600">₹75,000 / Month</span> Sharing Your Vehicle
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-body">
            Turn your parked bike or car in Vadodara into passive income. We manage complete renter verification, 
            ₹10 Lakh commercial insurance cover, and free doorstep GPS tracking.
          </p>
        </div>

        {/* Bento Grid Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Step 1: Type Switcher */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                1. Select Vehicle Type:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVehicleType("bike")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    vehicleType === "bike"
                      ? "bg-amber-50/70 border-amber-400 ring-2 ring-amber-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      vehicleType === "bike"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Share My Bike</div>
                    <div className="text-[11px] text-slate-500">Activa, Classic, Hunter</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleType("car")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    vehicleType === "car"
                      ? "bg-amber-50/70 border-amber-400 ring-2 ring-amber-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      vehicleType === "car"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Share My Car</div>
                    <div className="text-[11px] text-slate-500">Swift, Creta, Thar</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Days Slider */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. Days Shared Per Month:
                  </span>
                  <p className="text-xs text-slate-500">Adjust how many days your vehicle is free</p>
                </div>
                <div className="text-2xl font-heading font-extrabold text-amber-600">
                  {daysRented} <span className="text-sm font-normal text-slate-500">DAYS</span>
                </div>
              </div>

              <input
                type="range"
                min={2}
                max={25}
                value={daysRented}
                onChange={(e) => setDaysRented(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>2 Days (Weekends)</span>
                <span>10 Days</span>
                <span>15 Days (Avg)</span>
                <span>20 Days</span>
                <span>25 Days (Max)</span>
              </div>
            </div>

            {/* Protections line */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-bold text-slate-800 block">₹10 Lakh Cover</span>
                <span className="text-[11px] text-slate-500">Comprehensive insurance</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <MapPin className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-bold text-slate-800 block">Free Doorstep GPS</span>
                <span className="text-[11px] text-slate-500">Fitted in Vadodara</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <CheckCircle className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-bold text-slate-800 block">Verified Drivers</span>
                <span className="text-[11px] text-slate-500">DigiLocker RTO checked</span>
              </div>
            </div>
          </div>

          {/* Metrics display card */}
          <div className="lg:col-span-5 bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                ESTIMATED MONTHLY EARNINGS
              </span>

              <div className="mt-6 space-y-4 text-xs font-medium text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Gross Monthly Bookings:</span>
                  <span className="font-bold text-slate-900 text-sm tabular-nums">
                    {formatINR(grossMonthly)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span>Platform & Insurance Fee (25%):</span>
                  <span className="font-bold text-red-600 text-sm tabular-nums">
                    - {formatINR(platformFee)}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block">
                    Net Monthly Payout to Your Bank:
                  </span>
                  <div className="text-4xl sm:text-5xl font-heading font-extrabold text-emerald-700 tracking-tight mt-1 tabular-nums">
                    {formatINR(netMonthly)}
                    <span className="text-sm font-normal text-slate-400"> /mo</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center mt-3">
                  <span className="text-xs font-semibold text-slate-600">Annualized Passive Income:</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    {formatINR(annualized)}/yr
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCta}
              className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>{currentUser?.role === "host" ? "Open Host Dashboard" : "Attach My Vehicle (2 Mins)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
