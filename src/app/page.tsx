"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  MapPin,
  Star,
  Sparkles,
  CheckCircle2,
  Phone,
  Clock,
  Truck,
  RotateCcw,
  Compass,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { FloatingSearchWidget } from "@/components/FloatingSearchWidget";
import { VehicleCard } from "@/components/VehicleCard";
import { DynamicHeroText } from "@/components/DynamicHeroText";
import VehicleBookingModal from "@/components/VehicleBookingModal";
import AuthModal from "@/components/AuthModal";
import MyTripsModal from "@/components/MyTripsModal";
import HostDashboardModal from "@/components/HostDashboardModal";
import { ZoomcarTopOffers } from "@/components/ZoomcarTopOffers";
import { ZoomcarCategoriesGrid } from "@/components/ZoomcarCategoriesGrid";
import { ZoomcarExploreGrid } from "@/components/ZoomcarExploreGrid";
import { ZoomcarHostFeatures } from "@/components/ZoomcarHostFeatures";
import { ZoomcarTrustBar } from "@/components/ZoomcarTrustBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useRental } from "@/context/RentalContext";
import { VADODARA_CENTRAL_HUB, Vehicle } from "@/data/fleet";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Home() {
  const {
    vehicles,
    searchCategory,
    setSearchCategory,
    selectedDuration,
    doorstepDelivery,
    openBookingModal,
    openAuthModal,
    openHostDashboard,
    currentUser,
  } = useRental();

  // Filter vehicles (strictly only approved vehicles on public fleet)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (v.approvalStatus && v.approvalStatus !== "approved") return false;
      if (searchCategory === "all") return true;
      return v.category === searchCategory;
    });
  }, [vehicles, searchCategory]);

  // Host earnings estimator state
  const [hostVehicleType, setHostVehicleType] = React.useState<"bike" | "car">("car");
  const [hostDays, setHostDays] = React.useState<number>(15);

  const dailyYield = hostVehicleType === "car" ? 2200 : 750;
  const grossMonthly = dailyYield * hostDays;
  const platformFee = Math.round(grossMonthly * 0.25);
  const netMonthly = grossMonthly - platformFee;
  const annualized = netMonthly * 12;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 w-full bg-[#FAFAF9] relative pb-28 md:pb-12">
        {/* ============================================================== */}
        {/* 1. IMMERSIVE HERO SECTION WITH DAYLIGHT LUXURY VIBE */}
        {/* ============================================================== */}
        <section className="relative w-full min-h-[750px] md:min-h-[860px] flex flex-col justify-between pt-28 pb-16 px-6 md:px-16 lg:px-24 overflow-hidden">
          {/* Background Image & Gradient */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="/images/porsche.jpg"
              alt="Luxury vehicle immersive background"
              fill
              className="object-cover object-center blur-[4px] scale-105 transition-all duration-700"
              priority
            />
            {/* Dark vignette overlay for text legibility with subtle midnight depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/55 to-[#0b1329]/40" />
          </div>

          {/* Floating Glass Badges - Aligned with element end (right edge) */}
          <div
            className="hidden md:flex absolute top-28 right-6 md:right-16 lg:right-24 z-10 bg-[#1A1A1A]/70 backdrop-blur-2xl border border-white/10 px-5 py-3.5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] items-center gap-3.5 animate-bounce"
            style={{ animationDuration: "4s" }}
          >
            <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center text-white shadow-md shadow-[#FF6B00]/30">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">4.9 / 5.0</div>
              <div className="text-white/60 text-[10px] tracking-widest uppercase font-semibold">
                Vadodara Rated Fleet
              </div>
            </div>
          </div>

          <div
            className="hidden lg:flex absolute top-48 right-16 md:right-28 lg:right-40 z-10 bg-[#1A1A1A]/70 backdrop-blur-2xl border border-white/10 px-5 py-3.5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] items-center gap-3.5 animate-bounce"
            style={{ animationDuration: "5s", animationDelay: "1s" }}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Shield className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">Central Hub</div>
              <div className="text-white/60 text-[10px] tracking-widest uppercase font-semibold">
                Sayajigunj Platform 1
              </div>
            </div>
          </div>

          {/* Headline Typography */}
          <div className="relative z-10 max-w-5xl pt-12 md:pt-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
              <span>Vadodara&apos;s #1 Self-Drive Rental Platform</span>
              <span className="text-white/40">•</span>
              <span className="text-[#FF6B00] font-bold">GJ-06 Fleet</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem] font-bold tracking-tighter text-white mb-6 uppercase leading-[0.9]">
              FIND YOUR
              <br />
              <DynamicHeroText />
            </h1>
            <p className="text-lg md:text-2xl text-white/80 font-light max-w-2xl leading-relaxed">
              Self-Drive Luxury & Everyday Freedom across Vadodara. By the hour or day.
            </p>
          </div>

          {/* Connected Floating Search Widget with clean margin */}
          <div className="relative z-20 mt-12 w-full">
            <FloatingSearchWidget />
          </div>
        </section>

        {/* Spacer */}
        <div className="h-12 md:h-16 bg-transparent" />

        {/* ============================================================== */}
        {/* 2. EDITORIAL TRUST BAR (EXACT DEMORENTALL STYLE) */}
        {/* ============================================================== */}
        <section className="px-6 py-20 max-w-7xl mx-auto border-t border-black/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="flex flex-col gap-4">
              <Shield className="w-10 h-10 text-black" strokeWidth={1.2} />
              <h3 className="text-3xl font-light tracking-tight text-black">
                Impeccable
                <br />
                <span className="font-bold">Security.</span>
              </h3>
              <p className="text-black/50 text-sm leading-relaxed max-w-[290px]">
                Every journey is backed by premium commercial insurance and 24/7 dedicated Vadodara
                roadside assistance. Total peace of mind, guaranteed.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <MapPin className="w-10 h-10 text-black" strokeWidth={1.2} />
              <h3 className="text-3xl font-light tracking-tight text-black">
                Central Hub
                <br />
                <span className="font-bold">& Delivery.</span>
              </h3>
              <p className="text-black/50 text-sm leading-relaxed max-w-[290px]">
                Stationed at our single Vadodara Central Hub (Sayajigunj Platform 1 & RC Dutt Road).
                Or opt for Doorstep Delivery (+₹199) anywhere in Vadodara.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Star className="w-10 h-10 text-black" strokeWidth={1.2} />
              <h3 className="text-3xl font-light tracking-tight text-black">
                Curated
                <br />
                <span className="font-bold">Quality.</span>
              </h3>
              <p className="text-black/50 text-sm leading-relaxed max-w-[290px]">
                Our fleet represents mint-condition machines with active FASTag. Each bike & car is
                meticulously detailed, sanitized, and inspected prior to key handover.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. ASYMMETRIC BENTO GRID: THE COLLECTION (DARK EDITORIAL) */}
        {/* ============================================================== */}
        <section id="fleet-section" className="px-4 sm:px-6 md:px-8 py-20 scroll-mt-20">
          <div className="max-w-7xl mx-auto bg-[#0A0A0A] text-white rounded-[3rem] p-6 sm:p-10 md:p-14 shadow-2xl">
            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#FF6B00] mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
                  <span>VADODARA CENTRAL HUB INVENTORY</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 leading-[0.9]">
                  THE
                  <br />
                  COLLECTION
                </h2>
                <p className="text-white/50 text-base md:text-xl font-light">
                  Iconic machines. Ready for your command across Gujarat.
                </p>
              </div>

              {/* Category pills & duration display */}
              <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                <div className="text-right hidden md:block">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                    CURRENT PRICING BASIS
                  </span>
                  <span className="text-xs font-bold text-[#FF6B00]">
                    {selectedDuration.label.toUpperCase()}
                    {doorstepDelivery ? " • DOORSTEP DELIVERY (+₹199)" : " • FREE CENTRAL HUB"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSearchCategory("all")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      searchCategory === "all"
                        ? "bg-white text-black shadow-md"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    All Fleet ({vehicles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchCategory("bike")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      searchCategory === "bike"
                        ? "bg-[#FF6B00] text-white shadow-md"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    Bikes & Scooters (4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchCategory("car")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      searchCategory === "car"
                        ? "bg-[#FF6B00] text-white shadow-md"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    Self-Drive Cars (4)
                  </button>
                </div>
              </div>
            </div>

            {/* Asymmetric Hero Bento Showcase */}
            {filteredVehicles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                {/* Massive Hero Card (Spans 8 cols) - Mobile Optimized */}
                <div
                  onClick={() => openBookingModal(filteredVehicles[0])}
                  className="md:col-span-8 group cursor-pointer relative rounded-3xl overflow-hidden min-h-[460px] sm:min-h-[500px] md:h-[540px] bg-[#161616] border border-white/10 hover:border-[#FF6B00]/70 transition-all shadow-xl flex flex-col justify-between p-5 sm:p-7 md:p-8"
                >
                  <img
                    src={filteredVehicles[0].images[0]}
                    alt={filteredVehicles[0].name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/25" />

                  {/* Top Bar Badges */}
                  <div className="relative z-10 flex justify-between items-center gap-2">
                    <div className="inline-flex items-center bg-white px-3 py-1 rounded-full text-black text-xs font-bold shadow-md">
                      <span className="text-[9px] text-blue-700 font-black mr-1">IND</span>
                      <span>{filteredVehicles[0].plate}</span>
                    </div>

                    <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-1.5 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-[#FF6B00] fill-[#FF6B00]" />
                      <span>{filteredVehicles[0].rating} ({filteredVehicles[0].tripsCount} trips)</span>
                    </div>
                  </div>

                  {/* Bottom Content Area with dedicated non-overlapping button row */}
                  <div className="relative z-10 space-y-3">
                    <div>
                      <div className="text-white/70 uppercase tracking-widest text-[10px] sm:text-xs mb-1 font-bold">
                        {filteredVehicles[0].brand} • {filteredVehicles[0].transmission} • {filteredVehicles[0].fuel}
                      </div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-white group-hover:text-[#FF6B00] transition-colors">
                        {filteredVehicles[0].name}
                      </h3>
                      <p className="text-white/60 text-xs mt-1">
                        Vadodara Central Hub • Fastag Enabled • Free Helmets & Sanitized
                      </p>
                    </div>

                    {/* Dedicated Price & Book Button Row */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-end justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                          Rent for {selectedDuration.label}
                        </div>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FF6B00] tabular-nums">
                            {formatINR(
                              selectedDuration.isDaily
                                ? filteredVehicles[0].dailyRate * selectedDuration.multiplier
                                : filteredVehicles[0].hourlyRate * selectedDuration.hours
                            )}
                          </span>
                          <span className="text-xs text-white/50">
                            ({formatINR(filteredVehicles[0].dailyRate)}/day • {formatINR(filteredVehicles[0].hourlyRate)}/hr)
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span className="h-10 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-lg shadow-[#FF6B00]/30 transition-transform active:scale-95">
                          <span>Book Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stacked Cards (4 cols) - Mobile Optimized */}
                <div className="md:col-span-4 flex flex-col gap-6">
                  {filteredVehicles.slice(1, 3).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => openBookingModal(vehicle)}
                      className="group cursor-pointer relative rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[240px] md:flex-1 bg-[#161616] border border-white/10 hover:border-[#FF6B00]/70 transition-all shadow-xl flex flex-col justify-between p-4 sm:p-5"
                    >
                      <img
                        src={vehicle.images[0]}
                        alt={vehicle.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

                      <div className="relative z-10 flex justify-between items-center gap-2">
                        <span className="text-[10px] bg-white text-black font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {vehicle.plate}
                        </span>
                        <span className="text-[10px] bg-black/80 text-white font-bold px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 text-[#FF6B00] fill-[#FF6B00]" />
                          <span>{vehicle.rating}</span>
                        </span>
                      </div>

                      <div className="relative z-10">
                        <div className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mb-0.5">
                          {vehicle.brand} • {vehicle.fuel}
                        </div>
                        <h4 className="text-base sm:text-lg font-bold mb-1 text-white group-hover:text-[#FF6B00] transition-colors leading-tight">
                          {vehicle.name}
                        </h4>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg sm:text-xl font-bold text-[#FF6B00] tabular-nums">
                            {formatINR(
                              selectedDuration.isDaily
                                ? vehicle.dailyRate * selectedDuration.multiplier
                                : vehicle.hourlyRate * selectedDuration.hours
                            )}
                          </span>
                          <span className="text-xs text-white/50">
                            for {selectedDuration.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remaining Vehicles Grid */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">
                All Available Fleet Machines ({filteredVehicles.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.slice(3).map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Zoomcar Explore Beyond Grid (Intercity Cabs, Gift a Drive, Bike Rentals) */}
        <ZoomcarExploreGrid />

        {/* ============================================================== */}
        {/* 4. HOW IT WORKS (CLEAN STEP-BY-STEP FLOW) */}
        {/* ============================================================== */}
        <section id="how-it-works" className="px-6 py-20 max-w-7xl mx-auto border-t border-black/5">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
              ZERO-COUNTER PROCESS
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-black">
              Seamless Self-Drive In 4 Simple Steps
            </h2>
            <p className="text-sm sm:text-base text-black/50 font-light">
              No endless paperwork queues. Book your machine online in 60 seconds and start driving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                title: "Pick Date & Machine",
                desc: "Choose from verified bikes (Activa, Classic, Hunter) or self-drive cars (Swift, Creta, Nexon, Thar) by the hour or day.",
              },
              {
                num: "02",
                title: "Instant Digital KYC",
                desc: "Upload your valid Driving License & Aadhaar in under 2 minutes. 100% paperless verification with zero counter wait.",
              },
              {
                num: "03",
                title: "Hub Pickup + 4-Digit OTP",
                desc: "Free pickup at our Vadodara Central Hub (Sayajigunj Platform 1) or Doorstep Delivery. Show your 4-digit OTP to get keys.",
              },
              {
                num: "04",
                title: "Ride & Auto Refund",
                desc: "Enjoy unlimited freedom across Gujarat with FASTag. Return the machine and your deposit is auto-refunded in 60 mins.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white p-7 rounded-3xl border border-black/5 shadow-xs hover:shadow-lg hover:border-[#FF6B00]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl font-extrabold text-black/15 mb-4 font-mono">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">{step.title}</h3>
                  <p className="text-xs text-black/60 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 5. VADODARA CENTRAL HUB & DOORSTEP DELIVERY SECTION */}
        {/* ============================================================== */}
        <section id="hub-details" className="px-6 py-20 max-w-7xl mx-auto border-t border-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/10 text-xs font-bold text-black">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>SINGLE CONVENIENCE HUB IN VADODARA</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-black">
                Vadodara Central Hub <br />
                <span className="text-[#FF6B00]">(Sayajigunj / Alkapuri)</span>
              </h2>

              <p className="text-sm text-black/60 leading-relaxed">
                Located directly opposite Vadodara Railway Junction (Platform 1) and connecting
                straight to RC Dutt Road, Alkapuri. Zero branch confusion—all machines are inspected,
                sanitized, and handed over at this single central station.
              </p>

              <div className="bg-white border border-black/10 rounded-2xl p-5 space-y-3 text-xs shadow-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-black block text-xs">Hub Address:</strong>
                    <span className="text-black/70 block mt-0.5">
                      {VADODARA_CENTRAL_HUB.address}
                    </span>
                    <span className="text-black/40 text-[11px] block mt-1">
                      Landmark: {VADODARA_CENTRAL_HUB.landmark}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-black/5">
                  <Clock className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span className="text-black/70">
                    Timings: <strong className="text-black">24 Hours / 7 Days Active</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span className="text-black/70">
                    Direct Line: <strong className="text-black">+91 95468 83777</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={VADODARA_CENTRAL_HUB.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-5 rounded-full bg-black hover:bg-black/90 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#FF6B00]" />
                  <span>Open in Google Maps</span>
                </a>

                <a
                  href="https://wa.me/919546883777"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-5 rounded-full border border-black/15 hover:border-black/30 bg-white hover:bg-black/5 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#FF6B00]" />
                  <span>Call Bay Desk</span>
                </a>
              </div>
            </div>

            {/* Right: Doorstep Delivery Coverage Box */}
            <div className="lg:col-span-6 bg-white border border-black/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-black">
                    Doorstep Delivery Available (+₹199)
                  </h3>
                  <p className="text-xs text-black/50">
                    Delivered directly to your doorstep anywhere in Vadodara.
                  </p>
                </div>
              </div>

              <p className="text-xs text-black/60 leading-relaxed">
                Check &quot;Add Doorstep Delivery (+₹199)&quot; when booking any vehicle. Our executive will deliver
                the machine with your 4-digit OTP handover right to your location:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-black/80">
                {[
                  "Alkapuri & RC Dutt Rd",
                  "Vadodara Junction Platforms",
                  "Gotri & Sevasi",
                  "Manjalpur & Makarpura",
                  "Fatehgunj & MSU Campus",
                  "Akota & Old Padra Rd",
                  "Waghodia Highway Corridor",
                  "Karelibaug & Sama",
                ].map((area, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FAFAF9] p-2.5 rounded-xl border border-black/5 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                    <span className="truncate">{area}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-black/50 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FF6B00]" />
                <span>Full tank to full tank policy • 2 Sanitized ISI helmets included with all bikes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Zoomcar-Style Top Search & Sliding Offers Banner */}
        <ZoomcarTopOffers />

        {/* Zoomcar-Style Self-Drive Categories Grid */}
        <ZoomcarCategoriesGrid />

        {/* Zoomcar Host & Earn 3 Distinct Feature Cards with Register Now Arrow */}
        <ZoomcarHostFeatures />

        {/* ============================================================== */}
        {/* 6. HOST & EARN (MONETIZATION SECTION WITH INTERACTIVE CALCULATOR) */}
        {/* ============================================================== */}
        <section id="host-section" className="px-6 py-20 max-w-7xl mx-auto border-t border-black/5">
          <div className="max-w-3xl mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VED HOST PARTNER MARKETPLACE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-black">
              Earn Up To <span className="text-[#FF6B00]">₹75,000 / Month</span> Sharing Your Vehicle
            </h2>

            <p className="text-sm sm:text-base text-black/50 font-light">
              Turn your parked bike or car in Vadodara into passive income. We manage complete renter verification,
              ₹10 Lakh commercial insurance cover, and free doorstep GPS tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls */}
            <div className="lg:col-span-7 bg-white border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-black/40 block mb-3">
                  1. Select Vehicle Type:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHostVehicleType("bike")}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3",
                      hostVehicleType === "bike"
                        ? "bg-[#FF6B00]/5 border-[#FF6B00] ring-1 ring-[#FF6B00]"
                        : "bg-white border-black/10 hover:border-black/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                        hostVehicleType === "bike"
                          ? "bg-[#FF6B00] text-white"
                          : "bg-black/5 text-black"
                      )}
                    >
                      🏍️
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black">Share My Bike</div>
                      <div className="text-[11px] text-black/50">Activa, Classic, Hunter</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHostVehicleType("car")}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3",
                      hostVehicleType === "car"
                        ? "bg-[#FF6B00]/5 border-[#FF6B00] ring-1 ring-[#FF6B00]"
                        : "bg-white border-black/10 hover:border-black/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                        hostVehicleType === "car"
                          ? "bg-[#FF6B00] text-white"
                          : "bg-black/5 text-black"
                      )}
                    >
                      🚗
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black">Share My Car</div>
                      <div className="text-[11px] text-black/50">Swift, Creta, Thar</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div className="pt-4 border-t border-black/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-black/40">
                      2. Days Shared Per Month:
                    </span>
                    <p className="text-xs text-black/50">Adjust how many days your vehicle is available</p>
                  </div>
                  <div className="text-2xl font-bold text-[#FF6B00]">
                    {hostDays} <span className="text-sm font-normal text-black/40">DAYS</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={2}
                  max={25}
                  value={hostDays}
                  onChange={(e) => setHostDays(Number(e.target.value))}
                  className="w-full h-2.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
                />

                <div className="flex justify-between text-[11px] text-black/40 font-semibold">
                  <span>2 Days (Weekends)</span>
                  <span>10 Days</span>
                  <span>15 Days (Avg)</span>
                  <span>20 Days</span>
                  <span>25 Days (Max)</span>
                </div>
              </div>

              {/* Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-black/5 text-xs">
                <div className="bg-[#FAFAF9] p-3 rounded-xl border border-black/5">
                  <Shield className="w-4 h-4 text-[#FF6B00] mb-1" />
                  <span className="font-bold text-black block">₹10 Lakh Cover</span>
                  <span className="text-[11px] text-black/50">Commercial insurance</span>
                </div>

                <div className="bg-[#FAFAF9] p-3 rounded-xl border border-black/5">
                  <MapPin className="w-4 h-4 text-[#FF6B00] mb-1" />
                  <span className="font-bold text-black block">Free Doorstep GPS</span>
                  <span className="text-[11px] text-black/50">Fitted in Vadodara</span>
                </div>

                <div className="bg-[#FAFAF9] p-3 rounded-xl border border-black/5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00] mb-1" />
                  <span className="font-bold text-black block">Verified Drivers</span>
                  <span className="text-[11px] text-black/50">DigiLocker RTO checked</span>
                </div>
              </div>
            </div>

            {/* Right Metrics Display Card */}
            <div className="lg:col-span-5 bg-[#1A1A1A] text-white border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  ESTIMATED MONTHLY EARNINGS
                </span>

                <div className="mt-6 space-y-4 text-xs font-medium text-white/70">
                  <div className="flex justify-between items-center">
                    <span>Gross Monthly Bookings:</span>
                    <span className="font-bold text-white text-sm tabular-nums">
                      {formatINR(grossMonthly)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-white/40">
                    <span>Platform & Insurance Fee (25%):</span>
                    <span className="font-bold text-red-400 text-sm tabular-nums">
                      - {formatINR(platformFee)}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <span className="text-xs font-bold text-white/50 uppercase block">
                      Net Monthly Payout to Your Bank:
                    </span>
                    <div className="text-4xl sm:text-5xl font-bold text-[#FF6B00] tracking-tight mt-1 tabular-nums">
                      {formatINR(netMonthly)}
                      <span className="text-sm font-normal text-white/40"> /mo</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center mt-3">
                    <span className="text-xs font-semibold text-white/70">Annualized Passive Income:</span>
                    <span className="text-base font-bold text-white tabular-nums">
                      {formatINR(annualized)}/yr
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === "host") {
                    openHostDashboard();
                  } else {
                    openAuthModal("host");
                  }
                }}
                className="w-full h-12 rounded-full bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/30 transition-all cursor-pointer"
              >
                <span>{currentUser?.role === "host" ? "Open Host Dashboard" : "Attach My Vehicle (2 Mins)"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Zoomcar Trust Badges Bar (100% Secured Trip, Delivery Anywhere, 25k+ Cars) */}
        <ZoomcarTrustBar />

        {/* ============================================================== */}
        {/* 7. TESTIMONIALS SECTION (EXACT DEMORENTALL STYLE) */}
        {/* ============================================================== */}
        <section className="px-6 py-20 max-w-7xl mx-auto border-t border-black/5">
          <div className="flex flex-col md:flex-row gap-12 items-start md:items-center justify-between mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight max-w-lg leading-tight text-black">
              Driven by excellence. Defined by our clients.
            </h2>
            <div className="w-16 h-[1px] bg-black/20 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="flex flex-col gap-6 p-8 md:p-10 bg-[#FAFAF9] rounded-3xl border border-black/5 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
              <div className="text-[#FF6B00] text-6xl font-serif leading-none opacity-50">&quot;</div>
              <p className="text-lg md:text-xl font-light leading-relaxed text-black">
                The 4-digit OTP handover at Sayajigunj Hub took literally 3 minutes. The Hunter 350 was
                in immaculate condition and the security deposit was refunded back to my UPI within 40 minutes of return.
              </p>
              <div className="mt-auto pt-6 border-t border-black/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-base tracking-tight text-black">Alexander Wright</div>
                  <div className="text-black/40 text-xs uppercase tracking-widest mt-0.5">
                    Rented Royal Enfield Hunter • Vadodara
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00]" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-8 md:p-10 bg-[#FAFAF9] rounded-3xl border border-black/5 hover:bg-white hover:shadow-2xl transition-all duration-500 group md:translate-y-8">
              <div className="text-[#FF6B00] text-6xl font-serif leading-none opacity-50">&quot;</div>
              <p className="text-lg md:text-xl font-light leading-relaxed text-black">
                A masterclass in customer service. Their curated fleet is unparalleled, and having doorstep
                delivery to our hotel in Alkapuri made our weekend trip completely stress-free.
              </p>
              <div className="mt-auto pt-6 border-t border-black/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-base tracking-tight text-black">Elena Rostova</div>
                  <div className="text-black/40 text-xs uppercase tracking-widest mt-0.5">
                    Rented Hyundai Creta SX • Mumbai Traveler
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 8. LEADERSHIP / THE VISIONARIES (EXACT DEMORENTALL STYLE) */}
        {/* ============================================================== */}
        <section className="px-6 py-20 max-w-7xl mx-auto border-t border-black/5 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #000 1.5px, transparent 1.5px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-black">
              The Visionaries
            </h2>
            <p className="text-black/50 text-base md:text-lg leading-relaxed">
              Founded by automotive pioneers who believe that renting a premium vehicle should be as
              extraordinary as owning one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
            <div className="flex flex-col group">
              <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden mb-6 bg-black/5">
                <img
                  src="/images/leader_1.jpg"
                  alt="Marcus Sterling"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-1 text-black">Marcus Sterling</h3>
              <p className="text-[#FF6B00] font-bold uppercase tracking-widest text-xs mb-3">
                Chief Executive Officer
              </p>
              <p className="text-black/60 text-sm leading-relaxed">
                Former automotive executive turned entrepreneur, Marcus brings 15 years of luxury brand
                experience and an uncompromising standard for quality.
              </p>
            </div>

            <div className="flex flex-col group md:translate-y-12">
              <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden mb-6 bg-black/5">
                <img
                  src="/images/leader_2.jpg"
                  alt="Sophia Chen"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-1 text-black">Sophia Chen</h3>
              <p className="text-[#FF6B00] font-bold uppercase tracking-widest text-xs mb-3">
                Chief Operating Officer
              </p>
              <p className="text-black/60 text-sm leading-relaxed">
                A pioneer in operational logistics, Sophia ensures that every vehicle delivery is
                executed with military precision and white-glove service.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 9. GLOBAL CTA SECTION (EXACT ORANGE BANNER VIBE) */}
        {/* ============================================================== */}
        <section className="px-6 py-28 md:py-36 bg-[#FF6B00] text-white text-center relative overflow-hidden rounded-[3rem] mx-4 md:mx-8 mb-20 shadow-2xl">
          <div
            className="absolute top-0 left-0 w-full h-full opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.9]">
              READY TO
              <br />
              DRIVE?
            </h2>
            <p className="text-lg md:text-2xl font-light mb-10 text-white/90 max-w-2xl">
              Experience the pinnacle of automotive freedom in Vadodara today. Your verified vehicle awaits.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => scrollTo("fleet-section")}
                className="bg-white text-black hover:bg-white/95 px-10 py-4 rounded-full font-bold text-base uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.3)] cursor-pointer"
              >
                Book Machine Now
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === "host") {
                    openHostDashboard();
                  } else {
                    openAuthModal("host");
                  }
                }}
                className="bg-black text-white hover:bg-black/80 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
              >
                Attach Your Vehicle
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================== */}
      {/* 10. MASSIVE LOGOTYPE FOOTER (EXACT DEMORENTALL STYLE) */}
      {/* ============================================================== */}
      <footer className="bg-white pt-20 pb-12 px-6 overflow-hidden border-t border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-[12vw] leading-none font-bold tracking-tighter text-black mb-8 select-none text-center">
            Ved Travels<span className="text-[#059669]">.</span>
          </h2>

          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 border-t border-black/10 pt-8 mt-4 text-xs font-medium text-black/50">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest text-black/50">
              <button onClick={() => scrollTo("fleet-section")} className="hover:text-black transition-colors cursor-pointer">
                Fleet Search
              </button>
              <button onClick={() => scrollTo("hub-details")} className="hover:text-black transition-colors cursor-pointer">
                Sayajigunj Central Hub
              </button>
              <button onClick={() => scrollTo("host-section")} className="hover:text-black transition-colors cursor-pointer text-[#059669]">
                Host & Earn
              </button>
              <a href="tel:+919546883777" className="hover:text-black transition-colors">
                24/7 Helpline: +91 95468 83777
              </a>
            </div>

            <div className="text-center md:text-right">
              © 2026 Ved Travels. Vadodara's Premier Self-Drive Fleet & Host Marketplace (GJ-06).<br />
              <span className="text-black/30 text-[11px]">
                Opp. Vadodara Junction (Platform 1) & RC Dutt Road, Alkapuri Central
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <VehicleBookingModal />
      <AuthModal />
      <MyTripsModal />
      <HostDashboardModal />

      {/* Sticky Fixed Zoomcar-Style Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </>
  );
}
