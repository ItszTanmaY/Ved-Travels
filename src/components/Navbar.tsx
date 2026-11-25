"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useScroll, motion, AnimatePresence } from "framer-motion";
import { Menu, X, KeyRound, LayoutDashboard, User, LogOut, ChevronDown, ShieldAlert } from "lucide-react";
import { useRental } from "@/context/RentalContext";
import { VedLogo } from "@/components/VedLogo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const {
    currentUser,
    logout,
    openAuthModal,
    openMyTripsModal,
    openHostDashboard,
    openAdminDashboard,
    bookings,
    setSearchCategory,
  } = useRental();

  const activeBookingsCount = currentUser?.role === "admin"
    ? bookings.filter((b) => b.status === "confirmed" || b.status === "in_trip").length
    : currentUser
    ? bookings.filter((b) => {
        const bEmail = (b.renterEmail || "").trim().toLowerCase();
        const bUid = b.renterUid || b.renterId || "";
        const uEmail = (currentUser.email || "").trim().toLowerCase();
        const uUid = currentUser.uid || currentUser.id || "";
        const matches = Boolean(
          (uEmail && bEmail === uEmail) ||
          (uUid && (bUid === uUid || bUid === currentUser.id))
        );
        return matches && (b.status === "confirmed" || b.status === "in_trip" || b.status === "pending_payment");
      }).length
    : 0;

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  const scrollToSection = (id: string, categoryFilter?: "all" | "bike" | "car") => {
    setIsMobileMenuOpen(false);
    if (categoryFilter) {
      setSearchCategory(categoryFilter);
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Cars", onClick: () => scrollToSection("fleet-section", "car") },
    { label: "Bikes", onClick: () => scrollToSection("fleet-section", "bike") },
    { label: "Central Hub", onClick: () => scrollToSection("hub-details") },
    { label: "How It Works", onClick: () => scrollToSection("how-it-works") },
    { label: "Host & Earn", onClick: () => scrollToSection("host-section") },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 md:px-16 lg:px-24 w-full pointer-events-none pt-2.5 sm:pt-4 transition-all duration-300">
        <motion.div
          className={cn(
            "pointer-events-auto flex items-center justify-between w-full rounded-full px-3.5 sm:px-6 md:px-8 py-2 sm:py-3.5 transition-all duration-500 backdrop-blur-xl gap-2",
            isScrolled
              ? "bg-[#1A1A1A]/95 border border-white/10 shadow-2xl"
              : "bg-black/60 border border-white/15 shadow-xl"
          )}
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Left: Mobile Menu & Ved Travels Official Logo */}
          <div className="flex items-center gap-2 sm:gap-3.5 z-10 relative shrink-0 min-w-0">
            <button
              className="transition-colors p-1 hover:text-[#059669] lg:hidden text-white cursor-pointer shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <a href="#" className="flex items-center shrink-0">
              <VedLogo variant="light" size="md" />
            </a>
          </div>

          {/* Center Links (Desktop only) */}
          <div className="hidden lg:flex items-center gap-1 z-10 relative">
            {navLinks.map((link, index) => (
              <button
                key={link.label}
                type="button"
                onClick={link.onClick}
                className="relative px-4 py-2 text-sm font-medium transition-colors text-white/80 hover:text-white cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span className="relative z-10">{link.label}</span>
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute inset-0 rounded-full -z-10 bg-white/10"
                      layoutId="navbar-hover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          {/* Right Action / Auth Button */}
          <div className="flex items-center gap-2 sm:gap-3 z-10 relative shrink-0">
            {/* Live 24x7 Helpline Badge */}
            <a
              href="https://wa.me/919546883777"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-all cursor-pointer shadow-xs"
              title="Chat with Shantanu Shekhar on WhatsApp (24x7)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>24×7 Live</span>
              <span className="text-emerald-400/60">•</span>
              <span>+91 95468 83777</span>
            </a>
            {currentUser ? (
              <div className="relative">
                {currentUser.role === "admin" ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={openAdminDashboard}
                      className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Admin Desk</span>
                      <span className="sm:hidden">Admin</span>
                    </button>

                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500/30 text-emerald-200 flex items-center justify-center font-bold text-xs border border-emerald-400/40 hover:bg-emerald-500/40 cursor-pointer shrink-0"
                    >
                      A
                    </button>
                  </div>
                ) : currentUser.role === "host" ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={openHostDashboard}
                      className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#059669] hover:bg-[#047857] text-white shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline sm:inline">Host Panel</span>
                    </button>

                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs border border-white/20 hover:bg-white/30 cursor-pointer shrink-0"
                    >
                      {currentUser.name[0]}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={openMyTripsModal}
                      className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-white/90 shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#059669]" />
                      <span className="hidden xs:inline sm:inline">My Trips</span>
                      {activeBookingsCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white font-bold text-[9px] flex items-center justify-center">
                          {activeBookingsCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs border border-white/20 hover:bg-white/30 cursor-pointer shrink-0"
                    >
                      {currentUser.name[0]}
                    </button>
                  </div>
                )}

                {/* Profile dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#1A1A1A] border border-white/10 shadow-2xl py-2 z-50 text-white text-xs">
                    <div className="px-4 py-2 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-white truncate">{currentUser.name}</p>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-white/10 text-emerald-400">
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-white/50 text-[10px] truncate">{currentUser.email}</p>
                    </div>

                    {currentUser.role === "admin" ? (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          openAdminDashboard();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2 text-emerald-300 hover:text-emerald-200 cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                        <span>Admin Verification Center</span>
                      </button>
                    ) : currentUser.role === "host" ? (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          openHostDashboard();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2 text-white/80 hover:text-white cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#059669]" />
                        <span>Host Dashboard</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          openMyTripsModal();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2 text-white/80 hover:text-white cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-[#059669]" />
                        <span>My Trips & 4-Digit OTP</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2 cursor-pointer border-t border-white/10"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("renter")}
                className="z-10 relative px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-transform active:scale-95 shadow-md border bg-white text-black hover:bg-white/90 border-transparent cursor-pointer shrink-0 whitespace-nowrap"
              >
                Login
              </button>
            )}
          </div>
        </motion.div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0A0A0A]/95 backdrop-blur-3xl flex flex-col p-6 pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-16 pt-4">
              <a
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center"
              >
                <VedLogo variant="light" size="lg" />
              </a>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-[#FF6B00] transition-colors p-2 cursor-pointer"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex flex-col gap-8 text-3xl font-bold tracking-tight">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    link.onClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-white hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="mt-auto pb-12 space-y-3">
              {/* 24x7 Mobile Contact Pill */}
              <a
                href="https://wa.me/919546883777"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 transition-all mb-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="text-left">
                    <span className="text-[11px] font-bold uppercase tracking-wider block text-emerald-400">
                      24×7 Available Helpline
                    </span>
                    <span className="text-sm font-bold text-white block">
                      +91 95468 83777
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                  WhatsApp
                </span>
              </a>
              {currentUser ? (
                <>
                  {currentUser.role === "host" ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openHostDashboard();
                      }}
                      className="block w-full py-4 rounded-full bg-[#FF6B00] text-white text-center font-bold text-lg uppercase tracking-wider transition-transform active:scale-95 shadow-2xl cursor-pointer"
                    >
                      Open Host Panel
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openMyTripsModal();
                      }}
                      className="block w-full py-4 rounded-full bg-white text-black text-center font-bold text-lg uppercase tracking-wider transition-transform active:scale-95 shadow-2xl cursor-pointer"
                    >
                      My Trips & OTP ({activeBookingsCount})
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="block w-full py-3 text-center text-sm font-bold text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal("renter");
                  }}
                  className="block w-full py-5 rounded-full bg-white text-black text-center font-bold text-xl uppercase tracking-widest transition-transform active:scale-95 shadow-2xl cursor-pointer"
                >
                  Login to Account
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
