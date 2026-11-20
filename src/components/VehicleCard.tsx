"use client";

import React from "react";
import { Star, ShieldCheck, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Vehicle } from "@/data/fleet";
import { useRental } from "@/context/RentalContext";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: Vehicle;
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
        "group relative rounded-3xl overflow-hidden bg-[#161616] border border-white/10 transition-all duration-500 flex flex-col justify-between cursor-pointer",
        !vehicle.available
          ? "opacity-60 cursor-not-allowed"
          : isSlotLocked
          ? "border-amber-500/40 hover:border-amber-500"
          : "hover:border-[#FF6B00]/70 hover:shadow-[0_20px_40px_rgba(255,107,0,0.15)] hover:-translate-y-1.5"
      )}
    >
      <div>
        {/* Image Container with Consistent Aspect Ratio & Bottom Dark Fade */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
          <img
            src={vehicle.images[0]}
            alt={vehicle.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Smooth Fade from Down into Card Body */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-black/25 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            {/* Number plate badge */}
            <div className="inline-flex items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-black text-xs font-bold tracking-wider shadow-md">
              <span className="text-[8px] text-blue-700 font-black mr-1">IND</span>
              <span>{vehicle.plate}</span>
            </div>

            {/* Smart Car Min Duration Badge OR Rating */}
            <div className="flex items-center gap-1.5">
              {showMinCarBadge && (
                <div className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-black shadow-md border border-amber-300">
                  <Clock className="w-3 h-3 text-black" />
                  <span>Min 6 Hrs</span>
                </div>
              )}

              {/* Rating */}
              <div className="inline-flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                <Star className="w-3.5 h-3.5 text-[#FF6B00] fill-[#FF6B00]" />
                <span>{vehicle.rating}</span>
                <span className="text-white/40 font-normal">({vehicle.tripsCount})</span>
              </div>
            </div>
          </div>

          {/* Bottom Overlay Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
            {vehicle.ownerType === "host" ? (
              <div className="inline-flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/10">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Host: {vehicle.hostName}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md text-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Central Hub Certified</span>
              </div>
            )}

            {!vehicle.available ? (
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                Paused
              </span>
            ) : isSlotLocked ? (
              <span className="bg-amber-500 text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                Slot Reserved
              </span>
            ) : null}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 text-white">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF6B00]">
              {vehicle.brand} • {vehicle.category === "bike" ? "Two-Wheeler / Scooter" : "Self-Drive Car"}
            </span>
            {isCar && (
              <span className="text-[9px] font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                Min 6 Hrs
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-[#FF6B00] transition-colors leading-snug">
            {vehicle.name}
          </h3>

          {/* Specs pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-white/60 my-2.5 sm:my-3 font-medium flex-wrap">
            <span>{vehicle.transmission}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{vehicle.fuel}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{vehicle.mileage}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{vehicle.seats} {vehicle.category === "bike" ? "Helmets" : "Seats"}</span>
          </div>

          {/* Features Pills */}
          <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
            {vehicle.features.slice(0, 2).map((feat, i) => (
              <span
                key={i}
                className="text-[9px] sm:text-[10px] bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded-md"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Live Pricing for selected duration - Overlap Protected */}
      <div className="p-4 sm:p-5 pt-0 border-t border-white/5">
        <div className="flex items-end justify-between pt-3 gap-3">
          <div className="flex-1 min-w-0 pr-1">
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-white/40 tracking-wider truncate flex items-center gap-1.5">
              <span>
                {showMinCarBadge
                  ? "Rent for 6 Hrs (Car Min Package)"
                  : `Rent for ${selectedDuration.label}`}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold text-[#FF6B00] tracking-tight tabular-nums">
                {formatINR(pricing.baseRent + pricing.deliveryFee)}
              </span>
              <span className="text-[10px] sm:text-xs text-white/50 font-normal">
                ({pricing.rateText})
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-emerald-400/90 mt-1 truncate font-medium">
              Zero Advance Deposit • Pay on Handover
            </div>
          </div>

          <button
            type="button"
            disabled={!isAvailable}
            className={cn(
              "w-10 h-10 rounded-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 shadow-lg cursor-pointer",
              isAvailable
                ? "bg-[#FF6B00] hover:bg-[#E56000] text-white shadow-[#FF6B00]/25"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            )}
            aria-label="Book Machine"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VehicleCard;
