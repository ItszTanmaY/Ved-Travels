"use client";

import { useState, useEffect } from "react";
import {
  Vehicle,
  Booking,
  VADODARA_CENTRAL_HUB,
  VADODARA_LOCATIONS,
  VED_BUSINESS_CONFIG,
  VED_UPI_CONFIG,
} from "@/data/fleet";
import { useRental, DURATION_PRESETS, DurationOption } from "@/context/RentalContext";
import { formatINR } from "@/lib/utils";
import {
  X,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  PhoneCall,
  ExternalLink,
  CreditCard,
  Sparkles,
  AlertTriangle,
  Smartphone,
  Banknote,
  KeyRound,
  FileSpreadsheet,
  RefreshCw,
  Building2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function VehicleBookingModal() {
  const {
    selectedVehicle,
    closeBookingModal,
    selectedDuration,
    setSelectedDuration,
    selectedLocation,
    setSelectedLocation,
    doorstepDelivery,
    setDoorstepDelivery,
    calculateTariff,
    createBooking,
    isVehicleSlotLocked,
    currentUser,
    openAuthModal,
    openMyTripsModal,
    updateKyc,
    googleSheetsSyncing,
  } = useRental();

  const [bookingLocation, setBookingLocation] = useState<string>(selectedLocation || "Vadodara Railway Station");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [dlInput, setDlInput] = useState(currentUser?.dlNumber || "");
  const [aadhaarInput, setAadhaarInput] = useState(currentUser?.aadhaarNumber || "");
  const [kycFormOpen, setKycFormOpen] = useState(false);

  // WhatsApp & Direct Booking state
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync bookingLocation with selectedLocation
  useEffect(() => {
    if (selectedLocation) {
      setBookingLocation(selectedLocation);
    }
  }, [selectedLocation]);

  // Smart Car Rule: Enforce min 12h for cars
  useEffect(() => {
    if (selectedVehicle && selectedVehicle.category === "car" && selectedDuration.hours < 12) {
      const twelveH = DURATION_PRESETS.find((d) => d.hours === 12);
      if (twelveH) {
        setSelectedDuration(twelveH);
      }
    }
  }, [selectedVehicle, selectedDuration, setSelectedDuration]);

  if (!selectedVehicle) return null;

  const isCar = selectedVehicle.category === "car" || selectedVehicle.minHours >= 6;

  // Filter duration presets for cars vs bikes (Cars minimum 6 hours)
  const availablePresets = isCar
    ? DURATION_PRESETS.filter((p) => p.hours >= 6)
    : DURATION_PRESETS;

  const isSlotLocked = isVehicleSlotLocked(selectedVehicle.id, selectedDuration);
  const pricing = calculateTariff(selectedVehicle, selectedDuration, doorstepDelivery);

  const handleKycSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlInput || !aadhaarInput) {
      toast.error("Please enter Driving License and Aadhaar number");
      return;
    }
    updateKyc(dlInput, aadhaarInput);
    setKycFormOpen(false);
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    closeBookingModal();
  };

  const handleConfirmBooking = () => {
    if (isSlotLocked) {
      toast.error("Time slot already reserved!", {
        description: "Please select another rental duration or pick another vehicle from the fleet.",
      });
      return;
    }

    if (!currentUser) {
      toast.info("Please login or use 1-click Demo Account", {
        description: "Opening login modal...",
      });
      openAuthModal("renter");
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = createBooking({
        vehicle: selectedVehicle,
        duration: selectedDuration,
        doorstepDelivery,
        pickupLocation: bookingLocation,
        deliveryAddress: doorstepDelivery
          ? deliveryAddress || `${bookingLocation}, Vadodara`
          : undefined,
        paymentMode: "whatsapp_booking",
      });

      setConfirmedBooking(booking);

      toast.success(`RESERVATION CONFIRMED: ${selectedVehicle.name}`, {
        description: `4-Digit OTP: ${booking.otp} • Synced to Google Sheets!`,
        duration: 8000,
      });

      // Automatically launch WhatsApp with booking details & 4-digit OTP
      const waUrl = generateWhatsAppUrl(booking);
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp pre-formatted message for confirmed booking with client details & exact slab
  const generateWhatsAppUrl = (b: Booking) => {
    const text = encodeURIComponent(
      `*VED TRAVELS VADODARA - BOOKING CONFIRMATION*\n` +
        `----------------------------------------\n` +
        `• *Booking Code:* ${b.bookingCode}\n` +
        `• *Vehicle:* ${b.vehicleName} (${b.vehiclePlate})\n` +
        `• *Category:* ${b.vehicleCategory === "bike" ? "Two-Wheeler / Bike" : "Self-Drive Car"}\n` +
        `• *Tariff Slab / Duration:* ${b.durationLabel}\n` +
        `• *Pickup / Handover Location:* ${b.pickupLocation || b.hubName}\n` +
        `• *Start Date:* ${b.startDate}\n` +
        `• *Doorstep Delivery:* ${b.doorstepDelivery ? `Yes (+₹199) to ${b.deliveryAddress}` : `No (Hub Pickup at ${b.pickupLocation})`}\n` +
        `• *Payment Mode:* Direct via WhatsApp / On Pickup (Cash or UPI)\n` +
        `• *Total Estimated Tariff:* ${formatINR(b.totalAmount)}\n` +
        `----------------------------------------\n` +
        `🔑 *4-DIGIT START TRIP OTP:* ${b.otp}\n` +
        `----------------------------------------\n` +
        `• *Customer:* ${b.renterName} (${b.renterPhone})\n` +
        `• *Support Contact:* ${VED_BUSINESS_CONFIG.owner} (${VED_BUSINESS_CONFIG.phone})\n` +
        `Please confirm machine availability & handover details.`
    );
    return `https://wa.me/${VED_BUSINESS_CONFIG.whatsappNumber}?text=${text}`;
  };

  const currentWaUrl = confirmedBooking
    ? generateWhatsAppUrl(confirmedBooking)
    : `https://wa.me/${VED_BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
        `*VED TRAVELS BOOKING ENQUIRY*\nVehicle: ${selectedVehicle.name} (${selectedVehicle.plate})\nDuration: ${selectedDuration.label}\nPreferred Location: ${bookingLocation}`
      )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/10 flex items-center justify-between bg-[#FAFAF9]/95 backdrop-blur-md shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669]">
              VED TRAVELS VADODARA (GJ-06)
            </span>
            <h3 className="font-bold text-black text-sm sm:text-base leading-tight">
              {confirmedBooking ? "Booking Confirmed" : `Reserve ${selectedVehicle.name}`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {googleSheetsSyncing && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse font-medium">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Syncing Sheet</span>
              </span>
            )}
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs z-30"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {confirmedBooking ? (
          /* ============================================================== */
          /* VIEW 1: BOOKING CONFIRMATION & 4-DIGIT START OTP */
          /* ============================================================== */
          <div className="p-6 space-y-5 text-center overflow-y-auto flex-1 overscroll-contain">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#059669]">
                RESERVATION CONFIRMED
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
                Your Machine is Locked!
              </h4>
              <p className="text-xs text-black/60 max-w-md mx-auto">
                Booking ID: <strong className="font-mono text-slate-800">{confirmedBooking.bookingCode}</strong> • {confirmedBooking.durationLabel}
              </p>
            </div>

            {/* HIGHLIGHT: 4-Digit Handover OTP Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-slate-50 border-2 border-[#059669] rounded-2xl p-5 max-w-md mx-auto shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] mb-1">
                <KeyRound className="w-4 h-4" />
                <span>Your 4-Digit Start Trip Handover OTP</span>
              </div>

              <div className="font-mono text-4xl sm:text-5xl font-black text-slate-900 tracking-[0.25em] my-2 select-all">
                {confirmedBooking.otp}
              </div>

              <p className="text-[11px] text-slate-600 leading-normal">
                Show this 4-digit OTP to the Ved Travels executive at <strong className="text-slate-900">{confirmedBooking.pickupLocation || confirmedBooking.hubName}</strong> to collect your keys.
              </p>
            </div>

            {/* WhatsApp & Handover Payment Status pill */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900">Payment & Handover:</span>
                <span className="font-bold px-2 py-0.5 rounded-full text-[10px] uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Direct via WhatsApp
                </span>
              </div>
              <p className="text-[11px] text-emerald-700">
                ₹0 advance gateway charge. Connect on WhatsApp with Shantanu Shekhar (+91 95468 83777) to finalize payment via UPI or Cash on vehicle key handover.
              </p>
            </div>

            {/* Actions: Send to WhatsApp + Direct Call */}
            <div className="space-y-2.5 max-w-md mx-auto pt-2">
              <a
                href={currentWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-full bg-[#059669] hover:bg-[#047857] active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#059669]/25 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat with Shantanu on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/70" />
              </a>

              <a
                href={`tel:${VED_BUSINESS_CONFIG.phone.replace(/[^0-9+]/g, "")}`}
                className="w-full h-11 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Call Shantanu (+91 95468 83777)</span>
              </a>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openMyTripsModal();
                  }}
                  className="h-10 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  View in My Trips
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* VIEW 2: OFFLINE RESERVATION FORM */
          /* ============================================================== */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 overscroll-contain">
            {/* Vehicle visual banner */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-[#FAFAF9] p-3.5 sm:p-4 rounded-2xl border border-black/5">
              <div className="w-full sm:w-44 h-24 sm:h-28 rounded-xl overflow-hidden bg-black/5 shrink-0 relative">
                <img
                  src={selectedVehicle.images[0]}
                  alt={selectedVehicle.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#059669]">
                  {selectedVehicle.brand} • {selectedVehicle.category === "bike" ? "Two-Wheeler / Scooter" : "Self-Drive Car"}
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-black">
                  {selectedVehicle.name}
                </h3>
                <p className="text-xs text-black/60 font-medium">
                  {selectedVehicle.transmission} • {selectedVehicle.fuel} • {selectedVehicle.mileage} •{" "}
                  {selectedVehicle.seats} {selectedVehicle.category === "bike" ? "Helmets" : "Seats"}
                </p>
                {isCar && (
                  <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                    Car Package: Min 12 Hours Duration
                  </span>
                )}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-black/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Rental Duration (Tariff Slab)</span>
                </label>
                {isCar && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Cars: 12h or 24h+ only
                  </span>
                )}
              </div>

              <div className={`grid ${isCar ? "grid-cols-2" : "grid-cols-3 sm:grid-cols-5"} gap-1.5`}>
                {availablePresets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedDuration(p)}
                    className={`py-2 px-1 sm:px-2 text-[11px] sm:text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      selectedDuration.id === p.id
                        ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                        : "bg-white border-black/10 text-black/70 hover:bg-black/5"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Slot Lock Warning Banner */}
              {isSlotLocked && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900 mt-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold block">Vehicle Reserved for this Time Slot</span>
                    This vehicle is currently reserved for the selected {selectedDuration.label}. Please select another duration or browse other fleet machines.
                  </div>
                </div>
              )}
            </div>

            {/* 6 Vadodara Service Locations Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black/60 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                <span>Select Vadodara Pickup / Service Point</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VADODARA_LOCATIONS.map((loc) => {
                  const isSelected = bookingLocation === loc.name;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setBookingLocation(loc.name);
                        setSelectedLocation(loc.name);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-50 border-[#059669] text-emerald-950 ring-1 ring-[#059669]"
                          : "bg-[#FAFAF9] border-black/10 text-slate-700 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs truncate">{loc.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{loc.landmark}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Selected Handover Desk: <strong className="font-semibold">{bookingLocation}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Free Hub Pickup
                </span>
              </div>
            </div>

            {/* Doorstep Delivery Option */}
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  doorstepDelivery
                    ? "bg-[#059669]/5 border-[#059669] ring-1 ring-[#059669]"
                    : "bg-white border-black/10"
                }`}
              >
                <label className="flex items-start justify-between gap-3 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Truck className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-black block">
                        Add Doorstep Delivery Across Vadodara (+₹199)
                      </span>
                      <span className="text-[11px] text-black/50 block mt-0.5">
                        Delivered directly to your home, hotel, hostel, or office in Vadodara.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={doorstepDelivery}
                    onChange={(e) => setDoorstepDelivery(e.target.checked)}
                    className="accent-[#059669] w-4 h-4 rounded cursor-pointer mt-0.5"
                  />
                </label>

                {doorstepDelivery && (
                  <div className="mt-3 pt-3 border-t border-black/10 space-y-1">
                    <label className="text-[11px] font-bold text-black/70">
                      Enter Complete Delivery Address in Vadodara:
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. Near ${bookingLocation}, Society/Hostel Name, Vadodara`}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-black/15 rounded-xl text-black focus:outline-hidden focus:border-[#059669]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tariff Breakdown (Real Exact Slabs) */}
            <div className="bg-[#FAFAF9] p-4 sm:p-5 rounded-2xl border border-black/5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="font-bold uppercase tracking-wider text-black/60">
                  Fare Calculation ({pricing.rateText})
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Official Ved Tariff
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span>Vehicle Rental ({selectedDuration.label}):</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatINR(pricing.baseRent)}
                </span>
              </div>

              {doorstepDelivery && (
                <div className="flex justify-between items-center text-slate-700">
                  <span>Doorstep Delivery Fee:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    +{formatINR(pricing.deliveryFee)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-black/10 flex justify-between items-center text-sm">
                <div>
                  <strong className="text-black block">Total Estimated Amount:</strong>
                  <span className="text-[10px] text-emerald-700 font-medium">Includes full rental tariff • Zero advance deposit</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-black text-[#059669]">
                    {formatINR(pricing.total)}
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Booking & Direct Payment Notice */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-slate-50 border border-emerald-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#059669] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900 tracking-tight">
                      Direct WhatsApp Booking & Payment
                    </h5>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                      Zero Gateway Fees • Direct with Shantanu Shekhar
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                  24×7 Active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                No payment gateways, Razorpay, or convenience fees. Click below to submit your reservation directly to our official WhatsApp. Pay easily via UPI or Cash on vehicle key handover at <strong className="text-slate-900">{bookingLocation}</strong>.
              </p>
            </div>

            {/* KYC Check note */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-[#059669] shrink-0" />
                <div>
                  <span className="font-bold text-black block">Original DL & Aadhaar Required</span>
                  <span className="text-[11px] text-black/50">
                    Must be presented at physical key handover for zero-paperwork verification.
                  </span>
                </div>
              </div>
              {currentUser?.kycStatus === "verified" ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                  Bring at Hub
                </span>
              )}
            </div>

            {/* Submit Reservation via WhatsApp Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting || isSlotLocked}
                className="w-full h-12 rounded-full bg-[#059669] hover:bg-[#047857] active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#059669]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Confirming & Syncing to Google Sheets...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Book on WhatsApp & Get 4-Digit OTP ({formatINR(pricing.total)})</span>
                  </>
                )}
              </button>

              <a
                href={`tel:${VED_BUSINESS_CONFIG.phone.replace(/[^0-9+]/g, "")}`}
                className="w-full h-11 rounded-full border border-slate-300 hover:bg-slate-100 active:scale-98 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Call Shantanu for Instant Booking (+91 95468 83777)</span>
              </a>

              <p className="text-[10px] text-center text-slate-400 mt-1">
                Generates instant 4-Digit Handover OTP • Synced to Google Sheets • 24×7 Available
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
