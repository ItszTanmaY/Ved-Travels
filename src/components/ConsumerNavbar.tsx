"use client";

import { useState } from "react";
import { useRental } from "@/context/RentalContext";
import {
  Car,
  Bike,
  ShieldCheck,
  User,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Phone,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export default function ConsumerNavbar() {
  const {
    currentUser,
    logout,
    openAuthModal,
    openMyTripsModal,
    openHostDashboard,
    bookings,
  } = useRental();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const activeBookingsCount = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_trip"
  ).length;

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                VED <span className="text-emerald-600">TRAVELS</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Vadodara Self-Drive • Bikes & Cars
              </span>
            </div>
          </a>

          {/* Hub Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">
              Vadodara Central Hub (Sayajigunj)
            </span>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              Free Pickup
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <button
            onClick={() => scrollTo("fleet-section")}
            className="hover:text-emerald-600 transition-colors cursor-pointer"
          >
            Explore Fleet
          </button>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="hover:text-emerald-600 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo("host-section")}
            className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Attach Bike/Car & Earn</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
              UP TO ₹75K
            </span>
          </button>
          <button
            onClick={() => scrollTo("hub-details")}
            className="hover:text-emerald-600 transition-colors cursor-pointer"
          >
            Hub & Delivery
          </button>
          <button
            onClick={() => scrollTo("reviews-section")}
            className="hover:text-emerald-600 transition-colors cursor-pointer"
          >
            Reviews
          </button>
        </nav>

        {/* Right side CTAs / User Session */}
        <div className="hidden sm:flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              {currentUser.role === "host" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openHostDashboard}
                    className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Host Dashboard</span>
                  </button>

                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="h-11 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {currentUser.name[0]}
                    </div>
                    <span className="max-w-[100px] truncate">{currentUser.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openMyTripsModal}
                    className="h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span>My Trips & OTP</span>
                    {activeBookingsCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">
                        {activeBookingsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="h-11 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs">
                      {currentUser.name[0]}
                    </div>
                    <span className="max-w-[100px] truncate">{currentUser.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-slate-700 text-xs font-medium">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Role: {currentUser.role === "host" ? "Vehicle Host" : "Customer"}</span>
                    </div>
                  </div>

                  {currentUser.role === "host" ? (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        openHostDashboard();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      <span>Host Dashboard & Earnings</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        openMyTripsModal();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      <span>My Trips & KYC</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("renter")}
                className="h-11 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Login / Sign Up</span>
              </button>

              <button
                onClick={() => openAuthModal("host")}
                className="h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Host Portal</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
            <button
              onClick={() => scrollTo("fleet-section")}
              className="text-left py-2 hover:text-emerald-600"
            >
              Explore Fleet
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-left py-2 hover:text-emerald-600"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("host-section")}
              className="text-left py-2 text-amber-600 flex items-center justify-between"
            >
              <span>Attach Bike/Car & Earn</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                Up to ₹75K/mo
              </span>
            </button>
            <button
              onClick={() => scrollTo("hub-details")}
              className="text-left py-2 hover:text-emerald-600"
            >
              Vadodara Hub & Delivery
            </button>
            <button
              onClick={() => scrollTo("reviews-section")}
              className="text-left py-2 hover:text-emerald-600"
            >
              Customer Reviews
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {currentUser ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="font-bold text-slate-900 text-xs">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.phone}</p>
                </div>

                {currentUser.role === "host" ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openHostDashboard();
                    }}
                    className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open Host Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openMyTripsModal();
                    }}
                    className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span>My Trips & 4-Digit OTP</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full h-10 rounded-xl border border-red-200 text-red-600 font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("renter");
                  }}
                  className="h-11 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Renter Login</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("host");
                  }}
                  className="h-11 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Host Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
