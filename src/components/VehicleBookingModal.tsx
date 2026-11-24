"use client";

import { useState, useEffect, useRef } from "react";
import {
  Vehicle,
  Booking,
  VADODARA_CENTRAL_HUB,
  VADODARA_LOCATIONS,
  VED_BUSINESS_CONFIG,
} from "@/data/fleet";
import { useRental, DURATION_PRESETS } from "@/context/RentalContext";
import { formatINR } from "@/lib/utils";
import { compressImageFile } from "@/lib/imageCompression";
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
  KeyRound,
  RefreshCw,
  Building2,
  MessageCircle,
  Tag,
  Upload,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  Lock,
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
    isVehicleCurrentlyBooked,
    currentUser,
    openAuthModal,
    openMyTripsModal,
    googleSheetsSyncing,
  } = useRental();

  const [bookingLocation, setBookingLocation] = useState<string>(selectedLocation || "Vadodara Railway Station");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Safety DL Photo Upload state
  const [dlPhoto, setDlPhoto] = useState<string | null>(currentUser?.dlPhotoUrl || null);
  const [dlNumber, setDlNumber] = useState<string>(currentUser?.dlNumber || "");
  const [isCompressingDl, setIsCompressingDl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp & Direct Booking state
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync bookingLocation with selectedLocation
  useEffect(() => {
    if (selectedLocation) {
      setBookingLocation(selectedLocation);
    }
  }, [selectedLocation]);

  // Sync user's existing DL photo if available
  useEffect(() => {
    if (currentUser?.dlPhotoUrl && !dlPhoto) {
      setDlPhoto(currentUser.dlPhotoUrl);
    }
    if (currentUser?.dlNumber && !dlNumber) {
      setDlNumber(currentUser.dlNumber);
    }
  }, [currentUser]);

  // Smart Car Rule: Enforce min 6h for cars
  useEffect(() => {
    if (selectedVehicle && selectedVehicle.category === "car" && selectedDuration.hours < 6) {
      const sixH = DURATION_PRESETS.find((d) => d.hours === 6) || DURATION_PRESETS.find((d) => d.hours === 12);
      if (sixH) {
        setSelectedDuration(sixH);
      }
    }
  }, [selectedVehicle, selectedDuration, setSelectedDuration]);

  if (!selectedVehicle) return null;

  const isCar = selectedVehicle.category === "car" || selectedVehicle.minHours >= 6;

  // Filter duration presets for cars vs bikes (Cars minimum 6 hours)
  const availablePresets = isCar
    ? DURATION_PRESETS.filter((p) => p.hours >= 6)
    : DURATION_PRESETS;

  const isCurrentlyBooked = isVehicleCurrentlyBooked(selectedVehicle.id);
  const isSlotLocked = isCurrentlyBooked || isVehicleSlotLocked(selectedVehicle.id, selectedDuration);
  const pricing = calculateTariff(selectedVehicle, selectedDuration, doorstepDelivery);

  const handleDlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WEBP)");
      return;
    }

    setIsCompressingDl(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 0.75);
      setDlPhoto(compressedDataUrl);
      toast.success("Driving License Photo Uploaded!", {
        description: "Safety photo compressed & attached for quick key handover.",
      });
    } catch (err) {
      console.error("Compression error", err);
      toast.error("Could not process photo. Please try another image.");
    } finally {
      setIsCompressingDl(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    closeBookingModal();
  };

  const handleConfirmBooking = () => {
    if (isCurrentlyBooked || isSlotLocked) {
      toast.error("Vehicle is Currently Booked!", {
        description: "This vehicle has an active reservation. Please pick another vehicle from the fleet.",
      });
      return;
    }

    if (!currentUser) {
      toast.info("Please sign in or create an account to proceed", {
        description: "Opening sign-in modal...",
      });
      openAuthModal("renter");
      return;
    }

    if (!dlPhoto) {
      toast.error("Driving License / ID Photo Required", {
        description: "Please upload a photo of your DL / Govt ID for vehicle safety clearance.",
      });
      if (fileInputRef.current) {
        fileInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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
        dlPhotoUrl: dlPhoto,
      });

      setConfirmedBooking(booking);

      toast.info("Reservation Submitted — Payment Verification Pending", {
        description: `Booking ID: ${booking.bookingCode} • 4-Digit OTP unlocks upon admin verification.`,
        duration: 8000,
      });

      // Launch WhatsApp with booking details
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

  // WhatsApp pre-formatted message for booking enquiry & payment verification
  const generateWhatsAppUrl = (b: Booking) => {
    const text = encodeURIComponent(
      `*VED TRAVELS VADODARA - NEW RESERVATION REQUEST*\n` +
        `----------------------------------------\n` +
        `• *Booking Code:* ${b.bookingCode}\n` +
        `• *Vehicle:* ${b.vehicleName} (${b.vehiclePlate})\n` +
        `• *Category:* ${b.vehicleCategory === "bike" ? "Two-Wheeler / Bike" : "Self-Drive Car"}\n` +
        `• *Tariff Slab / Duration:* ${b.durationLabel}\n` +
        `• *Pickup / Handover Location:* ${b.pickupLocation || b.hubName}\n` +
        `• *Start Date:* ${b.startDate}\n` +
        `• *Doorstep Delivery:* ${b.doorstepDelivery ? `Yes (+₹199) to ${b.deliveryAddress}` : `No (Hub Pickup at ${b.pickupLocation})`}\n` +
        `• *Safety Verification:* DL / Govt ID Photo Uploaded\n` +
        `• *Total Estimated Tariff:* ${formatINR(b.totalAmount)}\n` +
        `----------------------------------------\n` +
        `🔒 *START TRIP OTP:* Awaiting Payment Verification (Unlocks upon Admin Confirmation)\n` +
        `----------------------------------------\n` +
        `• *Customer:* ${b.renterName} (${b.renterPhone})\n` +
        `• *Support Contact:* ${VED_BUSINESS_CONFIG.owner} (${VED_BUSINESS_CONFIG.phone})\n` +
        `Please verify payment and confirm vehicle handover.`
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
          /* VIEW 1: BOOKING SUBMISSION & PAYMENT VERIFICATION PENDING */
          /* ============================================================== */
          <div className="p-6 space-y-5 text-center overflow-y-auto flex-1 overscroll-contain">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block">
                PAYMENT VERIFICATION PENDING
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight pt-1">
                Reservation Submitted & Vehicle Locked!
              </h4>
              <p className="text-xs text-black/60 max-w-md mx-auto">
                Booking ID: <strong className="font-mono text-slate-800">{confirmedBooking.bookingCode}</strong> • {confirmedBooking.durationLabel}
              </p>
            </div>

            {/* HIGHLIGHT: Awaiting Verification & Locked OTP Notice */}
            <div className="bg-gradient-to-br from-amber-50 to-slate-50 border-2 border-amber-300 rounded-2xl p-5 max-w-md mx-auto shadow-md text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>4-Digit Handover OTP Locked</span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-900 leading-relaxed">
                  Awaiting Payment Verification from Ved Travels — Your 4-Digit Start OTP will unlock once payment is verified.
                </p>
              </div>

              <p className="text-[11px] text-slate-600 leading-normal">
                Our Vadodara Hub Desk will review and confirm your reservation. As soon as verified, your 4-digit handover OTP will unlock in your <strong className="text-slate-900">My Trips</strong> console and be ready for key collection at <strong className="text-slate-900">{confirmedBooking.pickupLocation || confirmedBooking.hubName}</strong>.
              </p>
            </div>

            {/* Safety DL Photo status note */}
            {confirmedBooking.dlPhotoUrl && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Driving License Photo attached for express handover.</span>
                </div>
                <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Attached
                </span>
              </div>
            )}

            {/* WhatsApp & Handover Payment Status pill */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900">Payment & Verification:</span>
                <span className="font-bold px-2 py-0.5 rounded-full text-[10px] uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Connect on WhatsApp
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
          /* VIEW 2: RESERVATION FORM */
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
                    Car Package: Min 6 Hours Duration
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
                    Cars: Min 6 Hrs Slab
                  </span>
                )}
              </div>

              <div className={`grid ${isCar ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-5"} gap-1.5`}>
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
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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

            {/* MANDATORY SAFETY DOCUMENT: DIRECT FILE UPLOAD (CAMERA / GALLERY) */}
            <div className="space-y-3 p-4 rounded-2xl bg-white border-2 border-emerald-300 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Renter Safety ID Verification</span>
                      <span className="text-[10px] text-red-600 font-extrabold">*Mandatory</span>
                    </h5>
                    <span className="text-[10px] text-slate-500 block">
                      Direct photo upload of Driving License or Govt ID
                    </span>
                  </div>
                </div>

                {/* Coming soon badge */}
                <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full">
                  Automated DigiLocker — Coming Soon
                </span>
              </div>

              {/* Photo preview or upload button */}
              {dlPhoto ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0">
                      <img src={dlPhoto} alt="Driving License" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-emerald-950 block truncate">
                        ID Document Photo Attached
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        Compressed & ready for verification at handover
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setDlPhoto(null)}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 px-1.5 py-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                    {isCompressingDl ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      {isCompressingDl ? "Compressing Image..." : "Upload Driving License / ID Photo"}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Tap to open camera or choose from gallery (Auto-compressed)
                    </span>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleDlFileUpload}
                className="hidden"
              />
            </div>

            {/* Promo / Coupon Offers (Coming Soon) */}
            <div className="p-3.5 rounded-2xl bg-[#FAFAF9] border border-black/5 flex items-center justify-between gap-3 text-xs select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">Coupons & Promo Codes</div>
                  <div className="text-[11px] text-slate-500 truncate">Exclusive flat discount codes for self-drive bookings</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 shrink-0 shadow-2xs">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Promo Offers — Coming Soon</span>
              </span>
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
                    <span>Submitting & Syncing to Google Sheets...</span>
                  </>
                ) : isSlotLocked ? (
                  <span>Currently Booked — Please Select Another Slot</span>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Submit Booking & Verify Payment ({formatINR(pricing.total)})</span>
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
                Real-Time Slot Lock • 4-Digit OTP Unlocked Upon Admin Payment Verification • 24×7 Available
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
