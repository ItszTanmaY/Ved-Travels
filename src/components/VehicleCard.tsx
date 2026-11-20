"use client";

import React from "react";
import { Star, ShieldCheck, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Vehicle } from "@/data/fleet";
import { useRental } from "@/context/RentalContext";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { selectedDuration, doorstepDelivery, calculateTariff, openBookingModal, isVehicleSlotLocked } = useRental();

  const pricing = calculateTariff(vehicle, selectedDuration, doorstepDelivery);
  const isSlotLocked = isVehicleSlotLocked(vehicle.id, selectedDuration);
  const isAvailable = vehicle.available && !isSlotLocked;
  const isCar = vehicle.category === "car" || vehicle.minHours >= 6;
  const showMinCarBadge = isCar && selectedDuration.hours < 6;

  return (
    <div
      onClick={() => openBookingModal(vehicle)}
      className={cn(
        "group relative rounded-3xl overflow-hidden bg-white border border-slate-200/90 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl hover:border-emerald-500/50 hover:-translate-y-1",
        !vehicle.available
          ? "opacity-60 cursor-not-allowed"
          : isSlotLocked
          ? "border-amber-400 bg-amber-50/20"
          : ""
      )}
    >
      <div>
        {/* Image Container with Consistent Aspect Ratio */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <img
            src={vehicle.images[0]}
            alt={vehicle.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Soft vignette for badge legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            {/* Number plate badge */}
            <div className="inline-flex items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-slate-900 text-xs font-mono font-bold tracking-wider shadow-sm border border-slate-200/80">
              <span className="text-[8px] text-blue-700 font-black mr-1">IND</span>
              <span>{vehicle.plate}</span>
            </div>

            {/* Smart Car Min Duration Badge OR Rating */}
            <div className="flex items-center gap-1.5">
              {showMinCarBadge && (
                <div className="inline-flex items-center gap-1 bg-amber-500 text-slate-900 font-extrabold px-2.5 py-1 rounded-full text-[10px] shadow-sm">
                  <Clock className="w-3 h-3 text-slate-900" />
                  <span>Min 6 Hrs</span>
                </div>
              )}

              {/* Rating */}
              <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-slate-200/80">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{vehicle.rating}</span>
                <span className="text-slate-400 font-normal">({vehicle.tripsCount})</span>
              </div>
            </div>
          </div>

          {/* Bottom Overlay Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
            {vehicle.ownerType === "host" ? (
              <div className="inline-flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-medium shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Host: {vehicle.hostName}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Central Hub Certified</span>
              </div>
            )}

            {!vehicle.available ? (
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow-sm">
                Paused
              </span>
            ) : isSlotLocked ? (
              <span className="bg-amber-500 text-slate-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow-sm">
                Slot Reserved
              </span>
            ) : null}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 text-slate-900">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700">
              {vehicle.brand} • {vehicle.category === "bike" ? "Two-Wheeler / Scooter" : "Self-Drive Car"}
            </span>
            {isCar && (
              <span className="text-[9px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Min 6 Hrs
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
            {vehicle.name}
          </h3>

          {/* Specs pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 my-2.5 sm:my-3 font-medium flex-wrap">
            <span>{vehicle.transmission}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{vehicle.fuel}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{vehicle.mileage}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{vehicle.seats} {vehicle.category === "bike" ? "Helmets" : "Seats"}</span>
          </div>

          {/* Features Pills */}
          <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
            {vehicle.features.slice(0, 2).map((feat, i) => (
              <span
                key={i}
                className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Live Pricing for selected duration */}
      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100">
        <div className="flex items-end justify-between pt-3 gap-3">
          <div className="flex-1 min-w-0 pr-1">
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate flex items-center gap-1.5">
              <span>
                {showMinCarBadge
                  ? "Rent for 6 Hrs (Car Min Package)"
                  : `Rent for ${selectedDuration.label}`}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
                {formatINR(pricing.baseRent + pricing.deliveryFee)}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-normal">
                ({pricing.rateText})
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-emerald-700 mt-1 truncate font-semibold">
              Zero Advance Deposit • Pay on Handover
            </div>
          </div>

          <button
            type="button"
            disabled={!isAvailable}
            className={cn(
              "w-10 h-10 rounded-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 shadow-md cursor-pointer",
              isAvailable
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
            aria-label="Book Vehicle"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VehicleCard;
