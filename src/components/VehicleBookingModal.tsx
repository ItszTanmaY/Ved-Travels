"use client";

import { useState } from "react";
import { Vehicle, Booking, VADODARA_CENTRAL_HUB, VED_UPI_CONFIG } from "@/data/fleet";
import { useRental, DURATION_PRESETS } from "@/context/RentalContext";
import { formatINR } from "@/lib/utils";
import { UpiPaymentBox } from "@/components/UpiPaymentBox";
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
} from "lucide-react";
import { toast } from "sonner";

export default function VehicleBookingModal() {
  const {
    selectedVehicle,
    closeBookingModal,
    selectedDuration,
    setSelectedDuration,
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

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [dlInput, setDlInput] = useState(currentUser?.dlNumber || "");
  const [aadhaarInput, setAadhaarInput] = useState(currentUser?.aadhaarNumber || "");
  const [kycFormOpen, setKycFormOpen] = useState(false);

  // Offline Payment states
  const [paymentMode, setPaymentMode] = useState<"upi_advance" | "pay_at_hub">("upi_advance");
  const [upiUtr, setUpiUtr] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedVehicle) return null;

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
    setUpiUtr("");
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

    if (paymentMode === "upi_advance" && upiUtr.trim().length < 6) {
      toast.error("Please enter your 12-digit UPI UTR number", {
        description:
          "Scan the QR code, pay via UPI, and enter the UTR / Ref Number, or choose 'Pay at Hub'.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = createBooking({
        vehicle: selectedVehicle,
        duration: selectedDuration,
        doorstepDelivery,
        deliveryAddress: doorstepDelivery ? deliveryAddress || "Vadodara Address" : undefined,
        paymentMode,
        upiUtr: paymentMode === "upi_advance" ? upiUtr.trim() : undefined,
      });

      setConfirmedBooking(booking);

      toast.success(`RESERVATION CONFIRMED: ${selectedVehicle.name}`, {
        description: `4-Digit OTP: ${booking.otp} • Synced to Google Sheets!`,
        duration: 8000,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp pre-formatted message for confirmed booking
  const generateWhatsAppUrl = (b: Booking) => {
    const text = encodeURIComponent(
      `*VED TRAVELS VADODARA - BOOKING CONFIRMATION*\n` +
        `----------------------------------------\n` +
        `• *Booking Code:* ${b.bookingCode}\n` +
        `• *Vehicle:* ${b.vehicleName} (${b.vehiclePlate})\n` +
        `• *Category:* ${b.vehicleCategory === "bike" ? "Two-Wheeler / Bike" : "Self-Drive Car"}\n` +
        `• *Duration:* ${b.durationLabel}\n` +
        `• *Start Date:* ${b.startDate}\n` +
        `• *Pickup Hub:* ${b.hubName}\n` +
        `• *Doorstep Delivery:* ${b.doorstepDelivery ? `Yes (+₹199) to ${b.deliveryAddress}` : "No (Sayajigunj Free Pickup)"}\n` +
        `• *Payment Mode:* ${b.paymentMode === "upi_advance" ? `UPI Advance (UTR: ${b.upiUtr})` : "Pay Offline at Sayajigunj Hub (Cash/UPI)"}\n` +
        `• *Base Rent:* ${formatINR(b.baseRent)}\n` +
        `• *Refundable Deposit:* ${formatINR(b.securityDeposit)}\n` +
        `• *Total Estimated:* ${formatINR(b.totalAmount)}\n` +
        `----------------------------------------\n` +
        `🔑 *4-DIGIT START TRIP OTP:* ${b.otp}\n` +
        `----------------------------------------\n` +
        `• *Customer:* ${b.renterName} (${b.renterPhone})\n` +
        `Please keep the machine sanitized & ready for handover.`
    );
    return `https://wa.me/${VED_UPI_CONFIG.whatsappNumber}?text=${text}`;
  };

  const currentWaUrl = confirmedBooking
    ? generateWhatsAppUrl(confirmedBooking)
    : `https://wa.me/${VED_UPI_CONFIG.whatsappNumber}?text=${encodeURIComponent(
        `*VED TRAVELS BOOKING ENQUIRY*\nVehicle: ${selectedVehicle.name} (${selectedVehicle.plate})\nDuration: ${selectedDuration.label}`
      )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/10 flex items-center justify-between bg-[#FAFAF9]/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-black/60 uppercase tracking-wider">
              {confirmedBooking ? "RESERVATION COMPLETE" : "CONFIRM OFFLINE RESERVATION"}
            </span>
            <span className="text-black/20">•</span>
            <div className="inline-flex items-center bg-white px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold text-black border border-black/15 shadow-xs">
              <span className="text-[8px] text-blue-700 font-extrabold mr-1">IND</span>
              <span>{selectedVehicle.plate}</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs z-30"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: SUCCESS & WHATSAPP CONFIRMATION SCREEN */}
        {/* ============================================================== */}
        {confirmedBooking ? (
          <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Logged in Google Sheets Database</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                Booking Confirmed: {confirmedBooking.vehicleName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking ID: <strong className="font-mono text-slate-800">{confirmedBooking.bookingCode}</strong> • {confirmedBooking.durationLabel}
              </p>
            </div>

            {/* Prominent 4-Digit Handover OTP Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <KeyRound className="w-4 h-4" />
                <span>Your 4-Digit Start Trip Handover OTP</span>
              </div>
              <div className="py-2">
                <span className="font-mono font-black text-4xl sm:text-5xl tracking-widest text-white drop-shadow-md">
                  {confirmedBooking.otp}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Show this 4-digit code to the hub desk officer at Sayajigunj Platform 1 to release vehicle keys.
              </p>
            </div>

            {/* Offline Payment Status pill */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Payment Status:</span>
                <span className="font-bold px-2 py-0.5 rounded-full text-[10px] uppercase bg-amber-100 text-amber-900 border border-amber-200">
                  {confirmedBooking.paymentMode === "upi_advance" ? "UPI Advance Submitted" : "Pay at Sayajigunj Hub"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {confirmedBooking.paymentMode === "upi_advance"
                  ? `UTR: ${confirmedBooking.upiUtr || "Recorded"}. Hub desk will verify upon key handover.`
                  : "Pay ₹0 online now. Complete total payment in Cash or UPI on vehicle collection."}
              </p>
            </div>

            {/* Actions: Send to WhatsApp + View in My Trips */}
            <div className="space-y-2.5 max-w-md mx-auto pt-2">
              <a
                href={currentWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-full bg-[#059669] hover:bg-[#047857] active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#059669]/25 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Send Booking to Ved Travels WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/70" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openMyTripsModal();
                  }}
                  className="h-11 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  View in My Trips
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
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
                  {selectedVehicle.brand} • {selectedVehicle.category === "bike" ? "Two-Wheeler" : "Self-Drive Car"}
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-black">
                  {selectedVehicle.name}
                </h3>
                <p className="text-xs text-black/60 font-medium">
                  {selectedVehicle.transmission} • {selectedVehicle.fuel} • {selectedVehicle.mileage} •{" "}
                  {selectedVehicle.seats} {selectedVehicle.category === "bike" ? "Helmets" : "Seats"}
                </p>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black/60 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#059669]" />
                <span>Rental Duration</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {DURATION_PRESETS.map((p) => (
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

            {/* Pickup Hub & Doorstep Delivery Option */}
            <div className="space-y-3">
              <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-black/5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#059669] shrink-0" />
                    <span className="text-xs font-bold text-black">
                      Central Pickup Location: {VADODARA_CENTRAL_HUB.name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-black/5 text-black font-bold px-2 py-0.5 rounded-full border border-black/10">
                    FREE PICKUP
                  </span>
                </div>
                <p className="text-xs text-black/60 pl-6 leading-relaxed">
                  {VADODARA_CENTRAL_HUB.address}
                </p>
                <div className="pl-6 text-[11px] text-black/40">
                  Landmark: {VADODARA_CENTRAL_HUB.landmark} • 24/7 Handover Desk
                </div>
              </div>

              {/* Doorstep Delivery Checkbox */}
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
                      <span className="text-xs text-black/50">
                        Delivered directly to your Home, Hotel, or Vadodara Junction Platform.
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={doorstepDelivery}
                    onChange={(e) => setDoorstepDelivery(e.target.checked)}
                    className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] cursor-pointer accent-[#059669] mt-0.5"
                  />
                </label>

                {doorstepDelivery && (
                  <div className="mt-3 pt-3 border-t border-[#059669]/20">
                    <label className="text-[11px] font-bold text-black/70 block mb-1">
                      Your Vadodara Address / Delivery Landmark:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Express Hotel, Alkapuri / Gotri Road, Vadodara"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* KYC Verification Card */}
            <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-black/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#059669]" />
                  <span className="text-xs font-bold text-black">
                    KYC Verification Status:
                  </span>
                </div>

                {currentUser?.kycStatus === "verified" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified (Ready for Handover)</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setKycFormOpen(!kycFormOpen)}
                    className="text-xs font-bold text-[#059669] hover:underline cursor-pointer"
                  >
                    {kycFormOpen ? "Close Form" : "Upload DL & Aadhaar"}
                  </button>
                )}
              </div>

              {currentUser?.kycStatus === "verified" ? (
                <p className="text-[11px] text-black/60 mt-1 pl-6">
                  DL: <strong className="text-black">{currentUser.dlNumber}</strong> • Aadhaar:{" "}
                  <strong className="text-black">{currentUser.aadhaarNumber}</strong>. Zero paperwork wait at pickup.
                </p>
              ) : (
                <p className="text-[11px] text-black/50 mt-1 pl-6">
                  Requires Valid Indian Driving License & Aadhaar Card. You can upload now or verify with 1-click.
                </p>
              )}

              {/* Inline KYC submission */}
              {kycFormOpen && (
                <form onSubmit={handleKycSave} className="mt-3 pt-3 border-t border-black/10 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="DL Number (e.g. GJ06 20190048192)"
                      value={dlInput}
                      onChange={(e) => setDlInput(e.target.value)}
                      className="h-9 px-3 text-xs bg-white border border-black/15 rounded-lg focus:border-[#059669] focus:outline-hidden"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Aadhaar Last 4 Digits or Number"
                      value={aadhaarInput}
                      onChange={(e) => setAadhaarInput(e.target.value)}
                      className="h-9 px-3 text-xs bg-white border border-black/15 rounded-lg focus:border-[#059669] focus:outline-hidden"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateKyc("GJ06 20200091241", "XXXX XXXX 9912");
                        setKycFormOpen(false);
                      }}
                      className="h-8 px-3 text-xs bg-black/5 hover:bg-black/10 text-black rounded-lg font-semibold cursor-pointer"
                    >
                      1-Click Auto Verify
                    </button>
                    <button
                      type="submit"
                      className="h-8 px-3 text-xs bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-bold cursor-pointer"
                    >
                      Save & Authenticate
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-black/5 space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-black/40 block border-b border-black/10 pb-2">
                Payment & Security Deposit Breakdown
              </span>

              <div className="flex justify-between text-black/80">
                <span>Base Rent ({pricing.rateText})</span>
                <span className="font-bold text-black tabular-nums">
                  {formatINR(pricing.baseRent)}
                </span>
              </div>

              {doorstepDelivery && (
                <div className="flex justify-between text-[#059669]">
                  <span>Doorstep Delivery (Across Vadodara)</span>
                  <span className="font-bold tabular-nums">+₹199</span>
                </div>
              )}

              <div className="flex justify-between text-black/80">
                <div>
                  <span>100% Refundable Security Deposit</span>
                  <div className="text-[10px] text-black/40">
                    Auto-refunded to your UPI/bank within 60 mins of vehicle return
                  </div>
                </div>
                <span className="font-bold text-black tabular-nums">
                  {formatINR(pricing.deposit)}
                </span>
              </div>

              <div className="pt-2 border-t border-black/10 flex justify-between items-baseline">
                <span className="text-sm font-bold text-black">Total Amount</span>
                <span className="text-2xl font-bold text-[#059669] tabular-nums">
                  {formatINR(pricing.total)}
                </span>
              </div>
            </div>

            {/* ============================================================== */}
            {/* OFFLINE & MANUAL UPI PAYMENT MODE SELECTOR (100% FREE) */}
            {/* ============================================================== */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span>Select Offline Payment Mode:</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  NO GATEWAY FEE
                </span>
              </label>

              {/* Two Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode("upi_advance")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMode === "upi_advance"
                      ? "bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-600"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      Pay Advance via UPI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Scan QR / UPI ID with GPay, PhonePe, Paytm & enter UTR ID.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode("pay_at_hub")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMode === "pay_at_hub"
                      ? "bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-600"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      Pay Offline at Hub
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    ₹0 online payment. Pay full fare in Cash or UPI on key collection.
                  </p>
                </button>
              </div>

              {/* Conditional Payment Details */}
              {paymentMode === "upi_advance" ? (
                <UpiPaymentBox
                  amount={pricing.total}
                  utrValue={upiUtr}
                  onUtrChange={setUpiUtr}
                />
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs text-slate-700">
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pay ₹0 Online Now (Pay at Sayajigunj Hub)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Your machine and time slot will be reserved immediately with a 4-digit OTP. You can pay the total fare of <strong className="text-slate-900">{formatINR(pricing.total)}</strong> (including deposit) via Cash or UPI at our Central Hub desk before taking the keys.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Sticky Footer actions */}
        {/* ============================================================== */}
        {!confirmedBooking && (
          <div className="sticky bottom-0 z-20 p-4 sm:p-6 border-t border-black/10 bg-white/95 backdrop-blur-md space-y-2.5 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Button 1: Confirm Offline Booking */}
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSlotLocked || isSubmitting}
                className={`h-11 sm:h-12 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isSlotLocked || isSubmitting
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-[#059669] hover:bg-[#047857] active:scale-98 text-white cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Syncing to Google Sheets...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className={`w-4 h-4 ${isSlotLocked ? "text-slate-400" : "text-white"}`} />
                    <span>
                      {isSlotLocked
                        ? "Slot Reserved (Unavailable)"
                        : paymentMode === "upi_advance"
                        ? "Confirm UPI Reservation (Get OTP)"
                        : "Confirm Pay at Hub (Get OTP)"}
                    </span>
                  </>
                )}
              </button>

              {/* Button 2: Direct Enquire on WhatsApp */}
              <a
                href={currentWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 sm:h-12 rounded-full border border-black/15 hover:border-black/30 active:scale-98 bg-white hover:bg-[#FAFAF9] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#059669]" />
                <span>Enquire via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 text-black/40" />
              </a>
            </div>

            <p className="text-[10px] text-center text-black/50 font-medium">
              Instant 4-digit handover OTP issued upon booking • Google Sheets live synchronization enabled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
