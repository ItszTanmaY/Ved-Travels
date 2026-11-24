"use client";

import { useState, useRef } from "react";
import { useRental } from "@/context/RentalContext";
import { Vehicle } from "@/data/fleet";
import { formatINR } from "@/lib/utils";
import { compressImageFile } from "@/lib/imageCompression";
import {
  X,
  LayoutDashboard,
  TrendingUp,
  Car,
  Bike,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Edit2,
  Check,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  IndianRupee,
  RefreshCw,
  Phone,
  MessageCircle,
  Camera,
  Upload,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { VED_BUSINESS_CONFIG } from "@/data/fleet";

export default function HostDashboardModal() {
  const {
    hostDashboardOpen,
    closeHostDashboard,
    currentUser,
    vehicles,
    toggleVehicleAvailability,
    updateVehiclePricing,
    addVehicle,
    bookings,
    verifyHandoverOtp,
    googleSheetsSyncing,
  } = useRental();

  const [activeTab, setActiveTab] = useState<"overview" | "vehicles" | "add" | "otp">("overview");

  // Form for adding a new vehicle
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<"bike" | "car">("bike");
  const [newBrand, setNewBrand] = useState("");
  const [newPlate, setNewPlate] = useState("GJ-06-");
  const [newTransmission, setNewTransmission] = useState<"Manual" | "Automatic">("Manual");
  const [newFuel, setNewFuel] = useState<"Petrol" | "Diesel" | "EV">("Petrol");
  const [newSeats, setNewSeats] = useState(2);
  const [newHourlyRate, setNewHourlyRate] = useState(100);
  const [newDailyRate, setNewDailyRate] = useState(1650);
  const [newDeposit, setNewDeposit] = useState(0);
  const [newMileage, setNewMileage] = useState("45 km/l");
  const [newCompressedImage, setNewCompressedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const vehicleFileInputRef = useRef<HTMLInputElement>(null);

  // OTP verification state
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");

  // Rate editing state
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editHourly, setEditHourly] = useState(0);
  const [editDaily, setEditDaily] = useState(0);

  if (!hostDashboardOpen) return null;

  const isHostPendingApproval = currentUser?.role === "host" && currentUser?.hostStatus === "pending_approval";

  // Filter vehicles belonging to this host
  const hostVehicles = vehicles.filter(
    (v) => (currentUser?.id && v.hostId === currentUser.id) || v.ownerType === "host"
  );

  // Bookings for this host's vehicles
  const hostVehicleIds = hostVehicles.map((v) => v.id);
  const hostBookings = bookings.filter((b) => hostVehicleIds.includes(b.vehicleId));

  const totalGrossEarnings = hostBookings.reduce((sum, b) => (b.status !== "cancelled" ? sum + b.totalAmount : sum), 0);
  const platformFee = Math.round(totalGrossEarnings * 0.25);
  const netEarnings = totalGrossEarnings - platformFee;
  const activeVehiclesCount = hostVehicles.filter((v) => v.available && v.approvalStatus === "approved").length;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 0.75);
      setNewCompressedImage(compressedDataUrl);
      toast.success("Photo compressed & ready!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process image file");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPlate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!newPlate.toUpperCase().startsWith("GJ-06")) {
      toast.error("Vehicle must have a valid Vadodara registration (GJ-06)");
      return;
    }

    if (!newCompressedImage) {
      toast.error("Please upload a vehicle photo");
      return;
    }

    setIsSubmittingVehicle(true);
    try {
      addVehicle({
        name: newName,
        category: newCategory,
        brand: newBrand || (newCategory === "bike" ? "Honda" : "Maruti Suzuki"),
        plate: newPlate.toUpperCase(),
        transmission: newTransmission,
        fuel: newFuel,
        seats: newSeats,
        mileage: newMileage,
        hourlyRate: Number(newHourlyRate),
        dailyRate: Number(newDailyRate),
        slabs: {
          hr1: newCategory === "bike" ? Number(newHourlyRate) : undefined,
          hr3: newCategory === "bike" ? Math.round(Number(newHourlyRate) * 2.6) : undefined,
          hr6: newCategory === "bike" ? Math.round(Number(newHourlyRate) * 5.6) : undefined,
          hr12: Math.round(Number(newDailyRate) * 0.7),
          hr24: Number(newDailyRate),
        },
        minHours: newCategory === "car" ? 6 : 1,
        securityDeposit: 0,
        ownerType: "host",
        hostId: currentUser?.id,
        hostName: currentUser?.name || "Host Partner",
        available: false,
        images: [newCompressedImage],
        features: [
          "Commercial Insurance",
          "Sanitized & Serviced",
          "Fastag Active",
          "Vadodara Registered",
        ],
      });

      setNewName("");
      setNewPlate("GJ-06-");
      setNewCompressedImage(null);
      setActiveTab("vehicles");
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      toast.error("Please select a booking to verify");
      return;
    }
    if (!enteredOtp || enteredOtp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    const ok = verifyHandoverOtp(selectedBookingId, enteredOtp);
    if (ok) {
      setEnteredOtp("");
      setSelectedBookingId("");
    }
  };

  const startEditRates = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setEditHourly(v.hourlyRate);
    setEditDaily(v.dailyRate);
  };

  const saveRates = (vId: string) => {
    updateVehiclePricing(vId, editHourly, editDaily);
    setEditingVehicleId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full sm:max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Top Partner Header */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/10 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  Host Partner Dashboard
                </h3>
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">
                  HOST PORTAL
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/60 truncate max-w-[220px] sm:max-w-none">
                Logged in: <strong className="text-white">{currentUser?.name || "Host Partner"}</strong> ({currentUser?.phone})
              </p>
            </div>
          </div>

          <button
            onClick={closeHostDashboard}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs z-30"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* ACCOUNT STATUS BANNER (If host is pending approval) */}
        {isHostPendingApproval && (
          <div className="p-3.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Account Under Admin Review:</strong> Ved Travels team will verify and activate your partner portal shortly.
              </span>
            </div>
            <a
              href={`https://wa.me/${VED_BUSINESS_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg shrink-0"
            >
              Contact Admin
            </a>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-black/5 bg-[#FAFAF9] flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-black text-white shadow-xs font-extrabold"
                : "text-black/60 hover:text-black"
            }`}
          >
            Overview & Payouts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vehicles")}
            className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "vehicles"
                ? "bg-black text-white shadow-xs font-extrabold"
                : "text-black/60 hover:text-black"
            }`}
          >
            <span>My Machines ({hostVehicles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "add"
                ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                : "text-black/70 hover:text-black bg-white border border-black/10"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>List New Bike / Car</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("otp")}
            className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "otp"
                ? "bg-black text-white shadow-xs font-extrabold"
                : "text-black/60 hover:text-black"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>Verify Handover OTP</span>
          </button>
        </div>

        {/* Content Tabs */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & PAYOUTS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FAFAF9] border border-black/5 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-black/40 uppercase block mb-1">
                    Net Earnings (75%)
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
                    {formatINR(netEarnings)}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                    After 25% Platform Fee
                  </span>
                </div>

                <div className="bg-[#FAFAF9] border border-black/5 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-black/40 uppercase block mb-1">
                    Active Approved Fleet
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-black tabular-nums">
                    {activeVehiclesCount}{" "}
                    <span className="text-xs font-normal text-black/40">/ {hostVehicles.length}</span>
                  </div>
                  <span className="text-[11px] text-black/50 mt-1 block">
                    Live for Vadodara bookings
                  </span>
                </div>

                <div className="bg-[#FAFAF9] border border-black/5 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-black/40 uppercase block mb-1">
                    Completed Trips
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-black tabular-nums">
                    {hostBookings.filter((b) => b.status === "completed").length}
                  </div>
                  <span className="text-[11px] text-black/50 mt-1 block">
                    {hostBookings.length} total reservations
                  </span>
                </div>

                <div className="bg-[#FAFAF9] border border-black/5 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-black/40 uppercase block mb-1">
                    Payout Schedule
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-black">
                    Every Monday
                  </div>
                  <span className="text-[11px] text-black/50 mt-1 block">
                    Direct to UPI / Bank
                  </span>
                </div>
              </div>

              {/* Host Insurance & Protection Banner */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      ₹10 Lakh Comprehensive Commercial Insurance Protection
                    </h4>
                    <p className="text-xs text-white/70 mt-0.5">
                      All renters are verified via mandatory Driving License photo check and 4-digit handover OTP.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-md"
                >
                  List Another Vehicle
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MY LISTED MACHINES */}
          {activeTab === "vehicles" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black/40">
                  Your Listed Vehicles in Vadodara ({hostVehicles.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>List New Machine</span>
                </button>
              </div>

              {hostVehicles.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <Car className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">You haven&apos;t listed any machines yet</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    List Your Bike or Car
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {hostVehicles.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                          <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-sm text-black">{v.name}</h5>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                              {v.plate}
                            </span>

                            {/* Status Badge */}
                            {v.approvalStatus === "approved" ? (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                Approved & Live
                              </span>
                            ) : v.approvalStatus === "pending_approval" ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Under Admin Review
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full">
                                Rejected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-black/50 mt-0.5">
                            {v.category === "bike" ? "Motorcycle / Scooter" : "Self-Drive Car"} • {v.transmission} • {v.fuel}
                          </p>
                        </div>
                      </div>

                      {/* Controls: Availability & Pricing */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900">{formatINR(v.dailyRate)}/day</div>
                          <div className="text-[11px] text-slate-500">{formatINR(v.hourlyRate)}/hr</div>
                        </div>

                        {/* Availability Toggle (Only active if approved by admin) */}
                        <button
                          type="button"
                          onClick={() => toggleVehicleAvailability(v.id)}
                          disabled={v.approvalStatus !== "approved"}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            v.approvalStatus !== "approved"
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : v.available
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              v.available && v.approvalStatus === "approved"
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-slate-400"
                            }`}
                          />
                          <span>
                            {v.approvalStatus !== "approved"
                              ? "Awaiting Admin"
                              : v.available
                              ? "Available / Live"
                              : "Personal Use"}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW VEHICLE (DIRECT PHOTO UPLOAD - NO URL INPUTS) */}
          {activeTab === "add" && (
            <form onSubmit={handleCreateVehicle} className="space-y-4 max-w-2xl mx-auto">
              <div>
                <h4 className="text-base font-bold text-black">
                  Attach Machine to Ved Travels Fleet
                </h4>
                <p className="text-xs text-black/50 mt-0.5">
                  Submit your GJ-06 vehicle with real photos. Once reviewed by Shantanu Shekhar, it goes live immediately.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Vehicle Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewCategory("bike")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        newCategory === "bike"
                          ? "bg-black text-white border-black"
                          : "bg-white border-black/15 text-black/60"
                      }`}
                    >
                      <Bike className="w-4 h-4 text-emerald-400" />
                      <span>Bike / Scooter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCategory("car")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        newCategory === "car"
                          ? "bg-black text-white border-black"
                          : "bg-white border-black/15 text-black/60"
                      }`}
                    >
                      <Car className="w-4 h-4 text-emerald-400" />
                      <span>Self-Drive Car</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Brand & Make
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Enfield / Honda / Maruti"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Vehicle Model Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic 350 / Activa 6G / Swift VXi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Vadodara Plate (GJ-06)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GJ-06-XX-XXXX"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    className="w-full h-10 px-3 text-xs font-mono font-bold uppercase bg-white border border-black/15 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Transmission
                  </label>
                  <select
                    value={newTransmission}
                    onChange={(e) => setNewTransmission(e.target.value as any)}
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value as any)}
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV (Electric)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Mileage / Economy
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45 km/l"
                    value={newMileage}
                    onChange={(e) => setNewMileage(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Hourly Rate (₹/hr)
                  </label>
                  <input
                    type="number"
                    required
                    value={newHourlyRate}
                    onChange={(e) => setNewHourlyRate(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs font-bold bg-white border border-black/15 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Daily Rate (₹/day)
                  </label>
                  <input
                    type="number"
                    required
                    value={newDailyRate}
                    onChange={(e) => setNewDailyRate(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs font-bold bg-white border border-black/15 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* DIRECT PHOTO UPLOAD (NO URL INPUTS) */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-900 block">
                  Vehicle Photo (Direct Gallery / Camera Upload)
                </label>

                {newCompressedImage ? (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-14 rounded-xl overflow-hidden border border-emerald-300 bg-white shrink-0">
                        <img src={newCompressedImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">Photo Attached</span>
                        <span className="text-[10px] text-emerald-700">Compressed & ready for review</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => vehicleFileInputRef.current?.click()}
                      className="text-xs font-bold text-emerald-900 bg-white border border-emerald-300 px-3 py-1 rounded-xl cursor-pointer"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => vehicleFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-emerald-600 transition-colors">
                      {isCompressing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {isCompressing ? "Compressing photo..." : "Take Photo or Upload from Phone Gallery"}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        High-quality canvas compression automatically reduces file size
                      </span>
                    </div>
                  </div>
                )}

                <input
                  ref={vehicleFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingVehicle || !newCompressedImage}
                className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-3"
              >
                {isSubmittingVehicle ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting for Admin Review...</span>
                  </>
                ) : (
                  <span>Submit Machine for Admin Verification</span>
                )}
              </button>
            </form>
          )}

          {/* TAB 4: VERIFY CUSTOMER HANDOVER OTP */}
          {activeTab === "otp" && (
            <div className="space-y-4 max-w-lg mx-auto">
              <div>
                <h4 className="text-base font-bold text-black">
                  Verify Customer Handover OTP
                </h4>
                <p className="text-xs text-black/50 mt-0.5">
                  When a renter arrives to collect keys for your listed vehicle, enter their 4-digit code to release vehicle keys.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Select Customer Booking
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    required
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-hidden font-medium"
                  >
                    <option value="">-- Select Pending Booking --</option>
                    {hostBookings
                      .filter((b) => b.status === "confirmed" || b.status === "confirmed_whatsapp")
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bookingCode} • {b.vehicleName} ({b.renterName})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Enter Renter&apos;s 4-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="••••"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full h-12 text-center text-2xl font-mono font-bold tracking-widest bg-white border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verify OTP & Release Machine</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
