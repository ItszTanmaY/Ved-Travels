"use client";

import { useState } from "react";
import { useRental, DURATION_PRESETS } from "@/context/RentalContext";
import {
  Car,
  Bike,
  Sparkles,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Flame,
} from "lucide-react";
import { VADODARA_CENTRAL_HUB } from "@/data/fleet";

export default function HeroSearch() {
  const {
    searchCategory,
    setSearchCategory,
    selectedDuration,
    setSelectedDuration,
    doorstepDelivery,
    setDoorstepDelivery,
    pickupTime,
    setPickupTime,
    dropTime,
    setDropTime,
  } = useRental();

  const scrollToFleet = () => {
    const el = document.getElementById("fleet-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-8 pb-16 bg-gradient-to-b from-slate-100/70 via-slate-50 to-[#F8FAFC]">
      {/* Background soft ambient accents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust announcement badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Vadodara&apos;s #1 Self-Drive Rental Platform</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">GJ-06 Verified</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-semibold text-amber-800">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Weekend Booking Slots Filling Fast</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Rent a Bike or Self-Drive Car in{" "}
            <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">
              Vadodara
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-body max-w-2xl mx-auto leading-relaxed">
            By the hour or day. Instant key handover at our{" "}
            <strong className="text-slate-900 font-semibold">Sayajigunj Central Hub</strong> (Opp. Vadodara Junction)
            or doorstep delivery anywhere in Vadodara.
          </p>

          {/* Trust pills line */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% Sanitized Machines
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Instant 60-Min Deposit Refund
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Doorstep Delivery (+₹199)
            </span>
          </div>
        </div>

        {/* Floating Search & Booking Card (Zoomcar + Turo style) */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-7 transition-all">
          {/* 1. Category Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. What would you like to drive?
            </span>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSearchCategory("all")}
                className={`py-2 px-4 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                  searchCategory === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Fleet (8)
              </button>

              <button
                type="button"
                onClick={() => setSearchCategory("bike")}
                className={`py-2 px-4 rounded-xl text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  searchCategory === "bike"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Bikes & Scooters</span>
                <span>🏍️</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchCategory("car")}
                className={`py-2 px-4 rounded-xl text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  searchCategory === "car"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Self-Drive Cars</span>
                <span>🚗</span>
              </button>
            </div>
          </div>

          {/* 2. Duration Preset Pills */}
          <div className="py-4 border-b border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Select Rental Duration:</span>
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tariff auto-calculated on all cards below
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {DURATION_PRESETS.map((preset) => {
                const isSelected = selectedDuration.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedDuration(preset)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-500/20"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-bold">{preset.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {preset.isDaily ? "Flat daily rate" : "Hourly billing"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Pickup Location & Delivery Mode Selection */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      📍 Vadodara Central Hub (Free Pickup)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                      Zero Extra Charge
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sayajigunj Station Circle Bay 04 (Opp. Platform 1) & RC Dutt Rd, Alkapuri
                  </p>
                </div>
              </div>
            </div>

            {/* Doorstep Delivery Toggle Switch */}
            <div className="w-full sm:w-auto">
              <label
                className={`flex items-center justify-between sm:justify-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  doorstepDelivery
                    ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-900 block">
                      Doorstep Delivery
                    </span>
                    <span className="text-[11px] text-amber-700 font-semibold">
                      +₹199 across Vadodara
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={doorstepDelivery}
                  onChange={(e) => setDoorstepDelivery(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 ml-2"
                />
              </label>
            </div>

            {/* Search / Explore CTA Button */}
            <button
              type="button"
              onClick={scrollToFleet}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>Explore Fleet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
