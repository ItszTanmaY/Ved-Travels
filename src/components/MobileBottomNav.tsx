"use client";

import React from "react";
import { Home, Luggage, User, Car, Sparkles, CheckCircle2 } from "lucide-react";
import { useRental } from "@/context/RentalContext";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const {
    currentUser,
    bookings,
    openAuthModal,
    openMyTripsModal,
    openHostDashboard,
    openAdminDashboard,
  } = useRental();

  const activeBookingsCount = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_trip"
  ).length;

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTripsClick = () => {
    if (currentUser) {
      openMyTripsModal();
    } else {
      openAuthModal("renter");
    }
  };

  const handleProfileClick = () => {
    if (currentUser) {
      openMyTripsModal();
    } else {
      openAuthModal("renter");
    }
  };

  const handleHostClick = () => {
    if (currentUser?.role === "admin") {
      openAdminDashboard();
    } else if (currentUser?.role === "host") {
      openHostDashboard();
    } else {
      openAuthModal("host");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around safe-area-bottom">
      {/* 1. Home Button (Active with emerald green) */}
      <button
        type="button"
        onClick={handleHomeClick}
        className="flex flex-col items-center justify-center py-1 px-3 text-emerald-600 transition-colors active:scale-95 cursor-pointer"
      >
        <Home className="w-5 h-5 text-emerald-600 stroke-[2.2]" />
        <span className="text-[10px] font-extrabold tracking-tight mt-0.5 text-emerald-700">
          Home
        </span>
      </button>

      {/* 2. My Trips Button */}
      <button
        type="button"
        onClick={handleTripsClick}
        className="relative flex flex-col items-center justify-center py-1 px-3 text-slate-600 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer"
      >
        <div className="relative">
          <Luggage className="w-5 h-5 stroke-[1.8]" />
          {activeBookingsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#FF6B00] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs">
              {activeBookingsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-tight mt-0.5">
          My Trips
        </span>
      </button>

      {/* 3. Profile Button */}
      <button
        type="button"
        onClick={handleProfileClick}
        className="relative flex flex-col items-center justify-center py-1 px-3 text-slate-600 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer"
      >
        <div className="relative">
          <User className="w-5 h-5 stroke-[1.8]" />
          {currentUser?.kycStatus === "verified" && (
            <span className="absolute -top-0.5 -right-1 bg-emerald-500 rounded-full w-2 h-2 ring-2 ring-white" />
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-tight mt-0.5 truncate max-w-[50px]">
          {currentUser ? currentUser.name.split(" ")[0] : "Profile"}
        </span>
      </button>

      {/* 4. Host & Earn / Admin Desk CTA Card */}
      <button
        type="button"
        onClick={handleHostClick}
        className={cn(
          "text-white px-3.5 py-1.5 rounded-2xl shadow-md font-bold text-[11px] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer ring-1",
          currentUser?.role === "admin"
            ? "bg-emerald-700 ring-emerald-400/40"
            : "bg-gradient-to-r from-amber-500 via-[#FF6B00] to-orange-600 ring-amber-400/40"
        )}
      >
        <Car className="w-3.5 h-3.5 shrink-0" />
        <span className="tracking-tight whitespace-nowrap">
          {currentUser?.role === "admin" ? "Admin Desk" : "Host & Earn"}
        </span>
        <Sparkles className="w-3 h-3 text-amber-200 shrink-0" />
      </button>
    </nav>
  );
}
