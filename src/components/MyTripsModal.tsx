"use client";

import { useState } from "react";
import { useRental } from "@/context/RentalContext";
import { formatINR } from "@/lib/utils";
import {
  X,
  KeyRound,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Phone,
  Truck,
  RotateCcw,
  Copy,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function MyTripsModal() {
  const {
    myTripsModalOpen,
    closeMyTripsModal,
    bookings,
    cancelBooking,
    currentUser,
    updateKyc,
  } = useRental();

  const [dlInput, setDlInput] = useState(currentUser?.dlNumber || "");
  const [aadhaarInput, setAadhaarInput] = useState(currentUser?.aadhaarNumber || "");
  const [kycEditing, setKycEditing] = useState(false);

  if (!myTripsModalOpen) return null;

  const userBookings = bookings;

  const handleSaveKyc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlInput || !aadhaarInput) {
      toast.error("Please enter Driving License and Aadhaar number");
      return;
    }
    updateKyc(dlInput, aadhaarInput);
    setKycEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/10 flex items-center justify-between bg-[#FAFAF9]/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#FF6B00]" />
            <h3 className="font-bold text-black text-sm sm:text-base">
              My Trips & Handover Key Console
            </h3>
          </div>

          <button
            onClick={closeMyTripsModal}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs z-30"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* KYC Status Banner */}
          <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-black/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black/5 text-[#FF6B00] flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-black">
                      Digital KYC Identity:
                    </span>
                    {currentUser?.kycStatus === "verified" ? (
                      <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.2 rounded-full flex items-center gap-1 border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.2 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-black/60">
                    DL: {currentUser?.dlNumber || "Not uploaded"} • Aadhaar:{" "}
                    {currentUser?.aadhaarNumber || "Not uploaded"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setKycEditing(!kycEditing)}
                className="text-xs font-bold text-[#FF6B00] hover:underline self-start sm:self-auto cursor-pointer"
              >
                {kycEditing ? "Close" : "Update Documents"}
              </button>
            </div>

            {kycEditing && (
              <form onSubmit={handleSaveKyc} className="mt-3 pt-3 border-t border-black/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-black/50 block mb-1 uppercase">
                      Driving License Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GJ06 20190048192"
                      value={dlInput}
                      onChange={(e) => setDlInput(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-white border border-black/15 rounded-lg focus:border-[#FF6B00] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-black/50 block mb-1 uppercase">
                      Aadhaar Number (Last 4 Digits)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. XXXX XXXX 4920"
                      value={aadhaarInput}
                      onChange={(e) => setAadhaarInput(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-white border border-black/15 rounded-lg focus:border-[#FF6B00] focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-full bg-black hover:bg-black/90 text-white font-bold text-xs cursor-pointer"
                  >
                    Save & Authenticate
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black/40">
              Active & Upcoming Reservations ({userBookings.length})
            </h4>

            {userBookings.length === 0 ? (
              <div className="text-center py-12 bg-[#FAFAF9] rounded-2xl border border-black/5 p-6">
                <KeyRound className="w-8 h-8 text-black/30 mx-auto mb-2" />
                <p className="text-sm font-bold text-black">No active bookings found</p>
                <p className="text-xs text-black/50 mt-1 max-w-sm mx-auto">
                  Browse our Vadodara fleet and click &quot;Book Now&quot; to reserve your vehicle in 1 click.
                </p>
              </div>
            ) : (
              userBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-black/10 p-5 shadow-xs space-y-4 hover:border-[#FF6B00]/40 transition-all"
                >
                  {/* Top row: vehicle and status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-black/5 shrink-0 relative">
                        <img
                          src={booking.vehicleImage}
                          alt={booking.vehicleName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-black text-sm">
                            {booking.vehicleName}
                          </h5>
                          <span className="text-[10px] font-mono font-bold bg-black/5 text-black px-1.5 py-0.2 rounded border border-black/10">
                            {booking.vehiclePlate}
                          </span>
                        </div>
                        <span className="text-xs text-black/50">
                          Booking ID: {booking.bookingCode}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {booking.status === "confirmed" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Confirmed • Ready for Handover</span>
                        </span>
                      )}
                      {(booking.status === "confirmed_whatsapp" || booking.status === "confirmed_pay_at_hub") && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>WhatsApp Booking • Pay on Pickup (UPI/Cash)</span>
                        </span>
                      )}
                      {booking.status === "pending_offline_verification" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>Pending UPI Verification</span>
                        </span>
                      )}
                      {booking.status === "in_trip" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                          <span>In Trip (Keys Released)</span>
                        </span>
                      )}
                      {booking.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-black/5 text-black/60">
                          <span>Cancelled & Released</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Highlight: 4-DIGIT HANDOVER OTP (shown for all active reservations) */}
                  {(booking.status === "confirmed" ||
                    booking.status === "confirmed_whatsapp" ||
                    booking.status === "confirmed_pay_at_hub" ||
                    booking.status === "pending_offline_verification") && (
                    <div className="bg-[#1A1A1A] text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669]">
                          <KeyRound className="w-4 h-4 text-[#059669]" />
                          <span>Handover 4-Digit Security OTP</span>
                        </div>
                        <p className="text-xs text-white/70 mt-0.5">
                          Present this 4-digit OTP at {booking.pickupLocation || "your selected Vadodara hub"} to release vehicle keys:
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="bg-white text-black px-4 py-2 rounded-xl font-mono font-black text-2xl tracking-widest shadow-md">
                          {booking.otp}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(booking.otp);
                            toast.success("4-Digit OTP copied to clipboard!");
                          }}
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer text-xs flex items-center gap-1 font-bold border border-white/10 active:scale-95"
                          title="Copy OTP"
                        >
                          <Copy className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copy OTP</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Trip details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-black/70">
                    <div className="bg-[#FAFAF9] p-2.5 rounded-xl border border-black/5">
                      <span className="text-[10px] text-black/40 uppercase font-bold block">
                        Duration & Slot
                      </span>
                      <span className="font-bold text-black">{booking.durationLabel}</span>
                    </div>

                    <div className="bg-[#FAFAF9] p-2.5 rounded-xl border border-black/5">
                      <span className="text-[10px] text-black/40 uppercase font-bold block">
                        Pickup Location
                      </span>
                      <span className="font-bold text-black truncate block">
                        {booking.doorstepDelivery
                          ? `Doorstep: ${booking.deliveryAddress}`
                          : (booking.pickupLocation || booking.hubName || "Vadodara Central Hub")}
                      </span>
                    </div>

                    <div className="bg-[#FAFAF9] p-2.5 rounded-xl border border-black/5">
                      <span className="text-[10px] text-black/40 uppercase font-bold block">
                        {booking.paymentMode === "upi_advance" ? "UPI Advance / UTR" : "Payment Mode"}
                      </span>
                      <span className="font-bold text-[#059669] truncate block">
                        {booking.paymentMode === "upi_advance"
                          ? `UTR: ${booking.upiUtr || "Pending"} (${formatINR(booking.totalAmount)})`
                          : `Pay at Hub (${formatINR(booking.totalAmount)})`}
                      </span>
                    </div>
                  </div>

                  {/* Actions row: WhatsApp Button + Call + Cancel */}
                  {(booking.status === "confirmed" ||
                    booking.status === "confirmed_pay_at_hub" ||
                    booking.status === "pending_offline_verification") && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-black/5">
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/919546883777?text=${encodeURIComponent(
                            `*VED TRAVELS VADODARA - RESERVATION & 4-DIGIT OTP*\n` +
                              `----------------------------------------\n` +
                              `• *Booking Code:* ${booking.bookingCode}\n` +
                              `• *Vehicle:* ${booking.vehicleName} (${booking.vehiclePlate})\n` +
                              `• *Duration / Tariff Slab:* ${booking.durationLabel}\n` +
                              `• *Start Date:* ${booking.startDate}\n` +
                              `• *Pickup / Handover Location:* ${booking.pickupLocation || booking.hubName}\n` +
                              `• *Doorstep Delivery:* ${booking.doorstepDelivery ? `Yes (+₹199) to ${booking.deliveryAddress}` : `No (Hub Pickup at ${booking.pickupLocation || booking.hubName})`}\n` +
                              `• *Payment Mode:* ${booking.paymentMode === "upi_advance" ? `UPI Advance (UTR: ${booking.upiUtr || "Pending"})` : `Pay at Hub (Cash/UPI)`}\n` +
                              `• *Total Estimated:* ${formatINR(booking.totalAmount)}\n` +
                              `----------------------------------------\n` +
                              `🔑 *4-DIGIT START TRIP OTP:* ${booking.otp}\n` +
                              `----------------------------------------\n` +
                              `• *Renter:* ${booking.renterName} (${booking.renterPhone})\n` +
                              `• *Support Contact:* Shantanu Shekhar (+91 95468 83777)\n` +
                              `Please keep the machine sanitized & ready for handover.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-100" />
                          <span>Send Booking & OTP to WhatsApp</span>
                        </a>

                        <a
                          href="tel:+919546883777"
                          className="text-xs font-semibold text-slate-600 hover:text-black flex items-center gap-1 transition-colors px-2 py-1"
                        >
                          <span>Call Hub (+91 95468 83777)</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => cancelBooking(booking.id)}
                        className="text-xs font-semibold text-red-600 hover:underline cursor-pointer self-end sm:self-auto"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
