"use client";

import { useState } from "react";
import { useRental } from "@/context/RentalContext";
import { formatINR } from "@/lib/utils";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Car,
  Bike,
  UserCheck,
  UserX,
  KeyRound,
  FileSpreadsheet,
  IndianRupee,
  Phone,
  MessageCircle,
  Clock,
  Eye,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { VED_BUSINESS_CONFIG } from "@/data/fleet";

export default function AdminDashboardModal() {
  const {
    adminDashboardOpen,
    closeAdminDashboard,
    currentUser,
    vehicles,
    bookings,
    registeredUsers,
    approveHostAccount,
    rejectHostAccount,
    approveVehicle,
    rejectVehicle,
    verifyPaymentAndGenerateOtp,
    markBookingTripStatus,
    clearHostPayout,
    verifyHandoverOtp,
    googleSheetsSyncing,
    refreshBookings,
  } = useRental();

  const [activeTab, setActiveTab] = useState<"approvals" | "trips" | "ledger">("approvals");
  const [selectedDlImage, setSelectedDlImage] = useState<string | null>(null);
  const [filterTripStatus, setFilterTripStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // OTP verify input state per booking
  const [otpInputs, setOtpInputs] = useState<{ [bookingId: string]: string }>({});
  // Payout UTR input state per booking
  const [payoutUtrInputs, setPayoutUtrInputs] = useState<{ [bookingId: string]: string }>({});

  if (!adminDashboardOpen) return null;

  // Filtered pending lists
  const pendingHosts = registeredUsers.filter((u) => u.role === "host" && u.hostStatus === "pending_approval");
  const allHosts = registeredUsers.filter((u) => u.role === "host");
  const pendingVehicles = vehicles.filter((v) => v.approvalStatus === "pending_approval");
  const pendingPaymentBookings = bookings.filter((b) => b.status === "pending_payment" || b.status === "pending_offline_verification");

  // Trips filtering
  const filteredBookings = bookings.filter((b) => {
    if (filterTripStatus !== "all") {
      if (filterTripStatus === "pending_payment") {
        if (b.status !== "pending_payment" && b.status !== "pending_offline_verification") return false;
      } else if (filterTripStatus === "confirmed") {
        if (b.status !== "confirmed" && b.status !== "confirmed_whatsapp" && b.status !== "confirmed_pay_at_hub") return false;
      } else if (b.status !== filterTripStatus) {
        return false;
      }
    }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      b.bookingCode.toLowerCase().includes(query) ||
      b.renterName.toLowerCase().includes(query) ||
      b.renterPhone.includes(query) ||
      b.vehicleName.toLowerCase().includes(query) ||
      b.vehiclePlate.toLowerCase().includes(query) ||
      b.pickupLocation.toLowerCase().includes(query)
    );
  });

  // Revenue & Ledger calculations
  const totalGrossRevenue = bookings.reduce((sum, b) => (b.status !== "cancelled" ? sum + b.totalAmount : sum), 0);
  const fleetRevenue = bookings
    .filter((b) => b.status !== "cancelled" && (!b.hostName || b.hostName.includes("Fleet")))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const hostBookings = bookings.filter(
    (b) => b.status !== "cancelled" && b.hostName && !b.hostName.includes("Fleet")
  );

  const totalHostBookingsValue = hostBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalHostPayoutDue = hostBookings.reduce(
    (sum, b) => sum + (b.hostEarnings || Math.round(b.totalAmount * 0.70)),
    0
  );
  const totalPlatformCommissions = totalHostBookingsValue - totalHostPayoutDue;

  // Group host bookings by host partner for ledger summary
  const hostPartnersSummary = Array.from(
    new Set(hostBookings.map((b) => b.hostName || "Host Partner"))
  ).map((hostName) => {
    const partnerBookings = hostBookings.filter((b) => (b.hostName || "Host Partner") === hostName);
    const totalBookingsCount = partnerBookings.length;
    const grossRev = partnerBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const hostPayable70 = partnerBookings.reduce(
      (sum, b) => sum + (b.hostEarnings || Math.round(b.totalAmount * 0.70)),
      0
    );
    const vedComm30 = partnerBookings.reduce(
      (sum, b) => sum + (b.platformFee || b.totalAmount - (b.hostEarnings || Math.round(b.totalAmount * 0.70))),
      0
    );
    const pendingCount = partnerBookings.filter((b) => b.hostPayoutStatus !== "paid").length;
    const pendingAmount = partnerBookings
      .filter((b) => b.hostPayoutStatus !== "paid")
      .reduce((sum, b) => sum + (b.hostEarnings || Math.round(b.totalAmount * 0.70)), 0);
    const paidAmount = partnerBookings
      .filter((b) => b.hostPayoutStatus === "paid")
      .reduce((sum, b) => sum + (b.hostEarnings || Math.round(b.totalAmount * 0.70)), 0);

    return {
      hostName,
      totalBookingsCount,
      grossRev,
      hostPayable70,
      vedComm30,
      pendingCount,
      pendingAmount,
      paidAmount,
      bookings: partnerBookings,
    };
  });

  const handleOtpVerify = (bookingId: string) => {
    const entered = (otpInputs[bookingId] || "").trim();
    if (!entered || entered.length !== 4) {
      toast.error("Please enter the 4-digit OTP");
      return;
    }
    const success = verifyHandoverOtp(bookingId, entered);
    if (success) {
      setOtpInputs((prev) => ({ ...prev, [bookingId]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full sm:max-w-5xl bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 shadow-2xl overflow-hidden max-h-[96dvh] sm:max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Top Admin Header */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-4 border-b border-black/10 flex items-center justify-between bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Ved Travels Master Admin Console
                </h3>
                <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  SHANTANU SHEKHAR
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                Vadodara Central Operations • Sayajigunj Bay 04 • {VED_BUSINESS_CONFIG.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {googleSheetsSyncing && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/15">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Database</span>
              </span>
            )}
            <button
              onClick={closeAdminDashboard}
              aria-label="Close modal"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Top 3 Navigation Tabs */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-black/5 bg-slate-100 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "approvals"
                ? "bg-slate-900 text-white shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Host Partners & Approvals</span>
            {(pendingHosts.length + pendingVehicles.length > 0) && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {pendingHosts.length + pendingVehicles.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trips")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "trips"
                ? "bg-slate-900 text-white shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Live Fleet & Trips Monitor ({bookings.length})</span>
            {pendingPaymentBookings.length > 0 && (
              <span
                className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-xs"
                title={`${pendingPaymentBookings.length} booking(s) awaiting payment verification`}
              >
                {pendingPaymentBookings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "ledger"
                ? "bg-slate-900 text-white shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Revenue & Partner Ledger</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: HOST PARTNERS & VEHICLE APPROVALS */}
          {/* ============================================================== */}
          {activeTab === "approvals" && (
            <div className="space-y-8">
              {/* SECTION A: Newly Submitted Host Vehicles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Car className="w-4 h-4 text-emerald-600" />
                      <span>Host Vehicles Awaiting Approval ({pendingVehicles.length})</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Must be verified and approved by Shantanu before appearing on the public fleet.
                    </p>
                  </div>
                </div>

                {pendingVehicles.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">No Vehicles Pending Approval</p>
                    <p className="text-[11px] text-slate-500">All submitted bikes & cars are reviewed and published.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingVehicles.map((v) => (
                      <div
                        key={v.id}
                        className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-sm text-slate-900 truncate">{v.name}</h5>
                              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                                {v.plate}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Host: <strong className="text-slate-800">{v.hostName}</strong> • {v.category.toUpperCase()} • {v.fuel}
                            </p>
                            <p className="text-xs font-bold text-emerald-700">
                              {formatINR(v.hourlyRate)}/hr • {formatINR(v.dailyRate)}/day
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => approveVehicle(v.id)}
                            className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectVehicle(v.id)}
                            className="h-9 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION B: Host Partner Accounts */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <span>Host Partner Accounts Directory ({allHosts.length})</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Manage registered hosts in Vadodara. Approve accounts to allow machine listings.
                    </p>
                  </div>
                </div>

                {allHosts.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700">No Host Partners Registered Yet</p>
                    <p className="text-[11px] text-slate-500">When users sign up as Host Partner, their profiles appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allHosts.map((host) => (
                      <div
                        key={host.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          host.hostStatus === "pending_approval"
                            ? "bg-amber-50/70 border-amber-300"
                            : host.hostStatus === "approved"
                            ? "bg-white border-slate-200 shadow-xs"
                            : "bg-red-50/50 border-red-200"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{host.name}</span>
                            {host.hostStatus === "approved" ? (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                Approved Partner
                              </span>
                            ) : host.hostStatus === "pending_approval" ? (
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                Under Admin Review
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                                Rejected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">
                            Phone: <strong className="font-mono text-slate-900">{host.phone}</strong> • Email:{" "}
                            <span className="text-slate-800">{host.email}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {host.hostStatus === "pending_approval" && (
                            <>
                              <button
                                type="button"
                                onClick={() => approveHostAccount(host.id)}
                                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve Account</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectHostAccount(host.id)}
                                className="h-9 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          <a
                            href={`https://wa.me/91${host.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: LIVE FLEET & TRIPS MONITOR */}
          {/* ============================================================== */}
          {activeTab === "trips" && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  {["all", "pending_payment", "confirmed", "in_trip", "completed"].map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFilterTripStatus(st)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          filterTripStatus === st
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {st === "all"
                          ? "All Trips"
                          : st === "pending_payment"
                          ? "Pending Payment"
                          : st === "in_trip"
                          ? "In-Trip"
                          : st.toUpperCase()}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search customer, plate..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsRefreshing(true);
                      await refreshBookings();
                      setIsRefreshing(false);
                    }}
                    disabled={isRefreshing}
                    className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-slate-200"
                    title="Force refresh reservations from Cloud Firestore"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No Reservations Found</p>
                  <p className="text-[11px] text-slate-500">Bookings placed via website or WhatsApp appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-emerald-500/40 transition-all"
                    >
                      {/* Top Bar: Code, Vehicle, Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                            {b.bookingCode}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{b.vehicleName}</span>
                          <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {b.vehiclePlate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              b.status === "pending_payment" || b.status === "pending_offline_verification"
                                ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse font-extrabold"
                                : b.status === "in_trip"
                                ? "bg-purple-100 text-purple-800 border border-purple-300"
                                : b.status === "completed"
                                ? "bg-slate-100 text-slate-700"
                                : b.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            }`}
                          >
                            {b.status === "pending_payment" || b.status === "pending_offline_verification" ? (() => {
                              const bTime = b.createdAtTimestamp || (b.id.startsWith("booking-") ? Number(b.id.replace("booking-", "")) : 0);
                              const elapsed = bTime > 0 ? Math.floor((Date.now() - bTime) / 60000) : 0;
                              const left = Math.max(0, 20 - elapsed);
                              return left > 0 ? `Awaiting Payment (${left}m hold)` : "Hold Expired (Unlocked)";
                            })()
                              : b.status === "in_trip"
                              ? "In-Trip"
                              : b.status.replace("confirmed_", "").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                          <span className="font-bold text-slate-900 block">{b.renterName}</span>
                          <span className="font-mono text-slate-600 text-[11px]">{b.renterPhone}</span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Handover Location</span>
                          <span className="font-bold text-slate-900 block truncate">
                            {b.doorstepDelivery ? `Doorstep: ${b.deliveryAddress}` : b.pickupLocation || b.hubName}
                          </span>
                          <span className="text-slate-500 text-[10px]">{b.durationLabel}</span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Fare & Owner</span>
                          <span className="font-bold text-emerald-700 block">{formatINR(b.totalAmount)}</span>
                          <span className="text-slate-500 text-[10px]">Owner: {b.hostName || "Ved Fleet Hub"}</span>
                        </div>

                        {/* Handover Security & Status Card (OTP Masked for Security) */}
                        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                          b.status === "in_trip"
                            ? "bg-purple-50 border-purple-200"
                            : (b.status === "confirmed" || b.status === "confirmed_whatsapp" || b.status === "confirmed_pay_at_hub")
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-amber-50 border-amber-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] uppercase font-bold ${
                              b.status === "in_trip"
                                ? "text-purple-800"
                                : (b.status === "confirmed" || b.status === "confirmed_whatsapp" || b.status === "confirmed_pay_at_hub")
                                ? "text-emerald-800"
                                : "text-amber-800"
                            }`}>
                              Handover Security
                            </span>
                            <KeyRound className={`w-3.5 h-3.5 ${
                              b.status === "in_trip"
                                ? "text-purple-600"
                                : (b.status === "confirmed" || b.status === "confirmed_whatsapp" || b.status === "confirmed_pay_at_hub")
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`} />
                          </div>
                          {b.status === "in_trip" ? (
                            <div>
                              <span className="text-xs font-black text-purple-900 block flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                <span>Keys Handed Over</span>
                              </span>
                              <span className="text-[10px] text-purple-700 font-medium block">
                                Trip in progress
                              </span>
                            </div>
                          ) : (b.status === "confirmed" || b.status === "confirmed_whatsapp" || b.status === "confirmed_pay_at_hub") ? (
                            <div>
                              <span className="text-xs font-black text-emerald-900 block flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>OTP Issued to Renter</span>
                              </span>
                              <span className="text-[10px] text-emerald-700 font-medium block">
                                Ask renter for 4-digit code
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs font-bold text-amber-900 block">
                                Verification Pending
                              </span>
                              <span className="text-[10px] text-amber-700 font-medium block">
                                Verify payment to issue OTP
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Safety DL Photo & Handover Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        {/* DL Photo Badge */}
                        <div className="flex items-center gap-2">
                          {b.dlPhotoUrl ? (
                            <button
                              type="button"
                              onClick={() => setSelectedDlImage(b.dlPhotoUrl!)}
                              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>View DL / Govt ID Photo</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>DL verified physically at counter</span>
                            </span>
                          )}
                        </div>

                        {/* Handover OTP Action & Trip State */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {/* 1. If Pending Payment: Verify Payment & Generate OTP Button */}
                          {(b.status === "pending_payment" || b.status === "pending_offline_verification") && (
                            <button
                              type="button"
                              onClick={() => verifyPaymentAndGenerateOtp(b.id)}
                              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify Payment & Generate OTP</span>
                            </button>
                          )}

                          {/* 2. If Confirmed: Enter OTP to Start Trip */}
                          {(b.status === "confirmed" || b.status === "confirmed_whatsapp" || b.status === "confirmed_pay_at_hub") && (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="4-digit OTP"
                                value={otpInputs[b.id] || ""}
                                onChange={(e) =>
                                  setOtpInputs((prev) => ({ ...prev, [b.id]: e.target.value }))
                                }
                                className="w-24 h-9 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleOtpVerify(b.id)}
                                className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                              >
                                Start Trip
                              </button>
                            </div>
                          )}

                          {/* 3. If In-Trip: Mark Completed */}
                          {b.status === "in_trip" && (
                            <button
                              type="button"
                              onClick={() => markBookingTripStatus(b.id, "completed")}
                              className="h-9 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}

                          <a
                            href={`https://wa.me/91${b.renterPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                              `Hi ${b.renterName}, this is Shantanu Shekhar from Ved Travels regarding your booking ${b.bookingCode} for ${b.vehicleName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${b.renterPhone}`}
                            className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 cursor-pointer"
                            title="Call Renter"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: REVENUE & PARTNER LEDGER */}
          {/* ============================================================== */}
          {activeTab === "ledger" && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-white/50 uppercase block">Total Gross Bookings</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tabular-nums">
                    {formatINR(totalGrossRevenue)}
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">All active & completed</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Ved Fleet Revenue (100%)</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1 tabular-nums">
                    {formatINR(fleetRevenue)}
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-1 block">Owner-managed machines</span>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Host Payouts Due (70%)</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-1 tabular-nums">
                    {formatINR(totalHostPayoutDue)}
                  </div>
                  <span className="text-[11px] text-amber-700 mt-1 block">Payable after trip completion</span>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">Ved Platform Commission (30%)</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-950 mt-1 tabular-nums">
                    {formatINR(totalPlatformCommissions)}
                  </div>
                  <span className="text-[11px] text-purple-700 mt-1 block">Platform fee retained</span>
                </div>
              </div>

              {/* Host Partners Aggregate Summary Table */}
              {hostPartnersSummary.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Host Partner Summary (70% Host / 30% Ved Travels)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {hostPartnersSummary.length} Partner{hostPartnersSummary.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5">Host Partner</th>
                          <th className="px-4 py-2.5">Bookings</th>
                          <th className="px-4 py-2.5">Gross Revenue</th>
                          <th className="px-4 py-2.5 text-purple-700">Ved Fee (30%)</th>
                          <th className="px-4 py-2.5 text-emerald-700">Host Share (70%)</th>
                          <th className="px-4 py-2.5 text-amber-700">Pending Settlement</th>
                          <th className="px-4 py-2.5 text-emerald-800">Settled (Paid)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {hostPartnersSummary.map((hp) => (
                          <tr key={hp.hostName} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-bold text-slate-900">{hp.hostName}</td>
                            <td className="px-4 py-3 tabular-nums">{hp.totalBookingsCount} trips</td>
                            <td className="px-4 py-3 font-bold tabular-nums">{formatINR(hp.grossRev)}</td>
                            <td className="px-4 py-3 font-bold text-purple-700 tabular-nums">{formatINR(hp.vedComm30)}</td>
                            <td className="px-4 py-3 font-bold text-emerald-700 tabular-nums">{formatINR(hp.hostPayable70)}</td>
                            <td className="px-4 py-3 font-bold text-amber-700 tabular-nums">
                              {hp.pendingAmount > 0 ? (
                                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[11px]">
                                  {formatINR(hp.pendingAmount)} ({hp.pendingCount})
                                </span>
                              ) : (
                                <span className="text-slate-400">₹0 (All Settled)</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-800 tabular-nums">{formatINR(hp.paidAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Host Partner Bookings Breakdown Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span>Host Partner Bookings & Payout Ledger</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">Split: 70% Host / 30% Ved Travels</span>
                </div>

                {hostBookings.length === 0 ? (
                  <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700">No Host Partner Bookings Yet</p>
                    <p className="text-[11px] text-slate-500">When customers book vehicles listed by external hosts, payout line items appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hostBookings.map((b) => {
                      const hostPay = b.hostEarnings || Math.round(b.totalAmount * 0.70);
                      const platformCut = b.platformFee || b.totalAmount - hostPay;
                      const isPaid = b.hostPayoutStatus === "paid";
                      return (
                        <div
                          key={b.id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-900">{b.vehicleName}</span>
                              <span className="text-xs text-slate-500">Host: <strong className="text-slate-800">{b.hostName}</strong></span>
                              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                {b.bookingCode}
                              </span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                b.status === "completed"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {b.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              Gross: {formatINR(b.totalAmount)} • Host Net (70%): <strong className="text-emerald-700">{formatINR(hostPay)}</strong> • Ved Fee (30%): {formatINR(platformCut)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                            {isPaid ? (
                              <div className="text-right">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Payout Settled (Paid)</span>
                                </span>
                                {b.payoutUtr && (
                                  <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                                    UTR: {b.payoutUtr} {b.payoutDate ? `• ${b.payoutDate}` : ""}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                <input
                                  type="text"
                                  placeholder="UPI UTR / Bank Ref (optional)"
                                  value={payoutUtrInputs[b.id] || ""}
                                  onChange={(e) =>
                                    setPayoutUtrInputs((prev) => ({ ...prev, [b.id]: e.target.value }))
                                  }
                                  className="h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden w-full sm:w-48 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => clearHostPayout(b.id, payoutUtrInputs[b.id])}
                                  className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer whitespace-nowrap active:scale-95 shadow-xs transition-all"
                                >
                                  Mark Payout Paid
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing Renter's Driving License Document */}
      {selectedDlImage && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs text-slate-800">Renter Driving License / Govt ID Photo</span>
              <button
                type="button"
                onClick={() => setSelectedDlImage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl">
              <img src={selectedDlImage} alt="Driving License" className="w-full h-auto object-contain" />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setSelectedDlImage(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
