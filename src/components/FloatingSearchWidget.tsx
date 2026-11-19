"use client";

import React, { useState } from "react";
import { ArrowRight, MapPin, Clock, Truck, ChevronDown, CheckCircle2 } from "lucide-react";
import { useRental, DURATION_PRESETS } from "@/context/RentalContext";
import { VADODARA_LOCATIONS } from "@/data/fleet";
import { cn } from "@/lib/utils";

export function FloatingSearchWidget() {
  const {
    searchCategory,
    setSearchCategory,
    selectedDuration,
    setSelectedDuration,
    selectedLocation,
    setSelectedLocation,
    doorstepDelivery,
    setDoorstepDelivery,
  } = useRental();

  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById("fleet-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-[#1A1A1A]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgb(0,0,0,0.6)] p-4 sm:p-5 flex flex-col gap-4 max-w-5xl w-full mx-auto relative z-20"
    >
      {/* Category selector row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF6B00]">
            6 VADODARA HUBS ACTIVE
          </span>
          <span className="text-white/30">•</span>
          <span className="text-white/60 text-xs">24×7 Instant Key Handover</span>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSearchCategory("all")}
            className={cn(
              "py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
              searchCategory === "all"
                ? "bg-white text-black shadow-xs"
                : "text-white/60 hover:text-white"
            )}
          >
            All Fleet (10)
          </button>
          <button
            type="button"
            onClick={() => setSearchCategory("bike")}
            className={cn(
              "py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1",
              searchCategory === "bike"
                ? "bg-[#FF6B00] text-white shadow-xs"
                : "text-white/60 hover:text-white"
            )}
          >
            <span>Bikes (3)</span>
            <span>🏍️</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchCategory("car")}
            className={cn(
              "py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1",
              searchCategory === "car"
                ? "bg-[#FF6B00] text-white shadow-xs"
                : "text-white/60 hover:text-white"
            )}
          >
            <span>Cars (7)</span>
            <span>🚗</span>
          </button>
        </div>
      </div>

      {/* Main Input Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Column 1: Vadodara 6 Locations Dropdown */}
        <div className="md:col-span-4 relative">
          <button
            type="button"
            onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 gap-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <div className="flex flex-col min-w-0">
                <label className="text-[9px] uppercase font-bold text-white/50 tracking-wider">
                  Pickup / Delivery Hub
                </label>
                <span className="text-xs font-bold text-white truncate">
                  {selectedLocation}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-white/50 shrink-0" />
          </button>

          {/* Locations popup */}
          {locationDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1E] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-white/40 tracking-wider">
                Select from our 6 Vadodara Hubs:
              </div>
              {VADODARA_LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc.name);
                    setLocationDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer",
                    selectedLocation === loc.name
                      ? "bg-[#059669] text-white"
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  <div>
                    <span className="font-bold block">{loc.name}</span>
                    <span className="text-[10px] text-white/50 block">{loc.landmark}</span>
                  </div>
                  {selectedLocation === loc.name && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Duration Selector Presets (1h, 3h, 6h, 12h, 24h) */}
        <div className="md:col-span-5 flex items-center px-3 py-2 gap-2 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto">
          <Clock className="w-4 h-4 text-white/50 shrink-0 ml-1" />
          <div className="flex items-center gap-1 min-w-max">
            {DURATION_PRESETS.map((p) => {
              const isSelected = selectedDuration.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedDuration(p)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#FF6B00] text-white shadow-xs"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 3: Doorstep Delivery toggle & CTA button */}
        <div className="md:col-span-3 flex items-center gap-2">
          {/* Doorstep Delivery Toggle */}
          <label
            className={cn(
              "flex-1 flex items-center justify-between px-3 py-2 rounded-2xl border cursor-pointer transition-all",
              doorstepDelivery
                ? "bg-[#FF6B00]/20 border-[#FF6B00] text-white"
                : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-1.5 text-left">
              <Truck className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
              <div className="text-[10px] leading-tight">
                <span className="font-bold block text-white">Doorstep</span>
                <span className="text-white/50">+₹199</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={doorstepDelivery}
              onChange={(e) => setDoorstepDelivery(e.target.checked)}
              className="accent-[#FF6B00] w-3.5 h-3.5 cursor-pointer ml-1"
            />
          </label>

          {/* Search Arrow Button */}
          <button
            type="submit"
            className="bg-[#FF6B00] hover:bg-[#E56000] text-white p-3.5 rounded-2xl transition-transform hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center shadow-lg shadow-[#FF6B00]/30 cursor-pointer"
            aria-label="Search Vehicles"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
