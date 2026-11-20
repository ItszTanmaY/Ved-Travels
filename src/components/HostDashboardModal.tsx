"use client";

import { useState } from "react";
import { useRental } from "@/context/RentalContext";
import { Vehicle } from "@/data/fleet";
import { formatINR } from "@/lib/utils";
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
  ShieldAlert,
  AlertCircle,
  FileCheck2,
  CheckCheck,
  FileSpreadsheet,
  QrCode,
  IndianRupee,
  RefreshCw,
  Phone,
  MessageCircle,
  Copy,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function HostDashboardModal() {
  const {
    hostDashboardOpen,
    closeHostDashboard,
    currentUser,
    vehicles,
    toggleVehicleAvailability,
    updateVehiclePricing,
    addVehicle,
    approveVehicle,
    rejectVehicle,
    bookings,
    verifyHandoverOtp,
    verifyOfflineBooking,
    googleSheetsSyncing,
  } = useRental();

  const [activeTab, setActiveTab] = useState<"overview" | "vehicles" | "add" | "otp" | "admin">(
    currentUser?.role === "admin" ? "admin" : "overview"
  );
  const [adminSubTab, setAdminSubTab] = useState<"upi" | "hub" | "vehicles">("upi");

  // Form for adding a new vehicle
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<"bike" | "car">("bike");
  const [newBrand, setNewBrand] = useState("");
  const [newPlate, setNewPlate] = useState("GJ-06-");
  const [newTransmission, setNewTransmission] = useState<"Manual" | "Automatic">("Manual");
  const [newFuel, setNewFuel] = useState<"Petrol" | "Diesel" | "EV">("Petrol");
  const [newSeats, setNewSeats] = useState(2);
  const [newHourlyRate, setNewHourlyRate] = useState(89);
  const [newDailyRate, setNewDailyRate] = useState(999);
  const [newDeposit, setNewDeposit] = useState(1500);
  const [newMileage, setNewMileage] = useState("40 km/l");
  const [newImageUrl, setNewImageUrl] = useState("/images/RoyalEnfieldClassic350.jpeg");
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

  // OTP verification state
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");

  // Rate editing state
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editHourly, setEditHourly] = useState(0);
  const [editDaily, setEditDaily] = useState(0);

  if (!hostDashboardOpen) return null;

  const hostVehicles = vehicles.filter(
    (v) => v.ownerType === "host" || (currentUser?.id && v.hostId === currentUser.id)
  );

  const pendingVehicles = vehicles.filter((v) => v.approvalStatus === "pending_approval");
  const pendingUpiBookings = bookings.filter(
    (b) => b.status === "pending_offline_verification"
  );
  const hubPayBookings = bookings.filter(
    (b) => b.status === "confirmed_pay_at_hub"
  );
  const totalAdminTasks =
    pendingVehicles.length + pendingUpiBookings.length + hubPayBookings.length;

  const totalEarnings = 46250;
  const activeVehiclesCount = hostVehicles.filter((v) => v.available && v.approvalStatus === "approved").length;
  const totalTripsCompleted = 68;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
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

    setIsSubmittingVehicle(true);
    try {
      addVehicle({
        name: newName,
        category: newCategory,
        brand: newBrand || (newCategory === "bike" ? "Royal Enfield" : "Maruti Suzuki"),
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
        minHours: newCategory === "car" ? 12 : 1,
        securityDeposit: Number(newDeposit),
        ownerType: "host",
        hostId: currentUser?.id || "demo-host-1",
        hostName: currentUser?.name || "Keval Pandya",
        available: false, // Locked until approved by Admin
        images: [newImageUrl || "/images/RoyalEnfieldClassic350.jpeg"],
        features: [
          "100% Sanitized",
          "Commercial Insurance",
          "Fastag Active",
          "Doorstep Handover Ready",
        ],
      });

      setNewName("");
      setNewPlate("GJ-06-");
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

  const selectPreset = (preset: {
    name: string;
    brand: string;
    category: "bike" | "car";
    transmission: "Manual" | "Automatic";
    fuel: "Petrol" | "Diesel" | "EV";
    seats: number;
    mileage: string;
    hourly: number;
    daily: number;
    deposit: number;
    img: string;
  }) => {
    setNewName(preset.name);
    setNewBrand(preset.brand);
    setNewCategory(preset.category);
    setNewTransmission(preset.transmission);
    setNewFuel(preset.fuel);
    setNewSeats(preset.seats);
    setNewMileage(preset.mileage);
    setNewHourlyRate(preset.hourly);
    setNewDailyRate(preset.daily);
    setNewDeposit(preset.deposit);
    setNewImageUrl(preset.img);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full sm:max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Top Partner Header */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/10 flex items-center justify-between bg-[#1A1A1A] text-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  Ved Travels Partner & Operations Hub
                </h3>
                <span className="text-[9px] sm:text-[10px] font-bold bg-[#059669] text-white px-2 py-0.5 rounded-full uppercase">
                  {currentUser?.role === "admin" ? "FLEET ADMIN" : "HOST PARTNER"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/50 truncate max-w-[220px] sm:max-w-none">
                Logged in: <strong className="text-white">{currentUser?.name || "Keval Pandya"}</strong> • Sayajigunj Central Hub
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

        {/* Dashboard Navigation Tabs */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-black/5 bg-[#FAFAF9] flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-black text-white shadow-xs"
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
                ? "bg-black text-white shadow-xs"
                : "text-black/60 hover:text-black"
            }`}
          >
            <span>My Listed Fleet ({hostVehicles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "add"
                ? "bg-[#059669] text-white shadow-xs"
                : "text-black/70 hover:text-black bg-white border border-black/10"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#059669]" />
            <span>List New Bike/Car</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("otp")}
            className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "otp"
                ? "bg-black text-white shadow-xs"
                : "text-black/60 hover:text-black"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#059669]" />
            <span>Handover OTP</span>
          </button>

          {/* Admin Verification Center Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "admin"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Approvals</span>
            {totalAdminTasks > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#EA580C] text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                {totalAdminTasks}
              </span>
            )}
          </button>
        </div>

        {/* Content Tabs */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & METRICS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FAFAF9] border border-black/5 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-black/40 uppercase block mb-1">
                    Total Net Earnings
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-[#059669] tabular-nums">
                    {formatINR(totalEarnings)}
                  </div>
                  <span className="text-[11px] text-green-700 font-semibold mt-1 block">
                    +18% from last month
                  </span>
                </div>

                <div className="bg-[#FAFAF9] border border-black/5 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-black/40 uppercase block mb-1">
                    Live Active Vehicles
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-black tabular-nums">
                    {activeVehiclesCount}{" "}
                    <span className="text-xs font-normal text-black/40">/ {hostVehicles.length}</span>
                  </div>
                  <span className="text-[11px] text-black/50 mt-1 block">
                    Available for bookings
                  </span>
                </div>

                <div className="bg-[#FAFAF9] border border-black/5 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-black/40 uppercase block mb-1">
                    Trips Completed
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-black tabular-nums">
                    {totalTripsCompleted}
                  </div>
                  <span className="text-[11px] text-black/50 mt-1 block">
                    4.96★ Host Rating
                  </span>
                </div>

                <div className="bg-[#FAFAF9] border border-black/5 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-black/40 uppercase block mb-1">
                    Next Payout Date
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-black">
                    Monday
                  </div>
                  <span className="text-[11px] text-black/50 mt-1 block">
                    Direct to Bank/UPI
                  </span>
                </div>
              </div>

              {/* Host Perks Banner */}
              <div className="bg-[#1A1A1A] text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-[#059669] shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      ₹10 Lakh Comprehensive Commercial Insurance Active
                    </h4>
                    <p className="text-xs text-white/70 mt-0.5">
                      Every renter is verified via DigiLocker DL & Aadhaar checks. Free doorstep GPS installation provided.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="h-10 px-5 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-md"
                >
                  List Another Vehicle
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MY LISTED VEHICLES */}
          {activeTab === "vehicles" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black/40">
                  Your Registered Machines in Vadodara
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add New Machine</span>
                </button>
              </div>

              <div className="space-y-3">
                {hostVehicles.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white border border-black/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-20 h-14 rounded-xl overflow-hidden bg-black/5 shrink-0 relative">
                        <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-sm text-black">
                            {v.name}
                          </h5>
                          <span className="text-[10px] font-mono font-bold bg-black/5 text-black px-1.5 py-0.2 rounded border border-black/10">
                            {v.plate}
                          </span>

                          {/* Approval Status Badge */}
                          {v.approvalStatus === "approved" ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Approved & Live
                            </span>
                          ) : v.approvalStatus === "pending_approval" ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pending Admin Review
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Rejected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-black/50 mt-0.5">
                          {v.category === "bike" ? "Motorcycle" : "Self-Drive Car"} • {v.transmission} • {v.fuel} • {v.tripsCount} trips
                        </p>
                      </div>
                    </div>

                    {/* Price and status toggle */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                      {editingVehicleId === v.id ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="text-[9px] text-black/40 uppercase block">₹/hr</span>
                            <input
                              type="number"
                              value={editHourly}
                              onChange={(e) => setEditHourly(Number(e.target.value))}
                              className="w-16 h-8 text-xs font-bold px-1.5 border border-black/20 rounded-lg text-center"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-black/40 uppercase block">₹/day</span>
                            <input
                              type="number"
                              value={editDaily}
                              onChange={(e) => setEditDaily(Number(e.target.value))}
                              className="w-20 h-8 text-xs font-bold px-1.5 border border-black/20 rounded-lg text-center"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => saveRates(v.id)}
                            className="h-8 px-2.5 bg-black text-white rounded-lg text-xs font-bold mt-3 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="text-xs font-bold text-black">
                            {formatINR(v.dailyRate)}/day
                          </div>
                          <div className="text-[11px] text-black/50">
                            {formatINR(v.hourlyRate)}/hr
                          </div>
                          <button
                            type="button"
                            onClick={() => startEditRates(v)}
                            className="text-[10px] text-[#059669] hover:underline font-semibold flex items-center gap-0.5 justify-end mt-0.5 cursor-pointer"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>Edit Rates</span>
                          </button>
                        </div>
                      )}

                      {/* Live Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleVehicleAvailability(v.id)}
                        disabled={v.approvalStatus !== "approved"}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          v.approvalStatus !== "approved"
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            : v.available
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-black/5 text-black/60 border border-black/10"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            v.available && v.approvalStatus === "approved"
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-black/30"
                          }`}
                        />
                        <span>
                          {v.approvalStatus !== "approved"
                            ? "Awaiting Admin"
                            : v.available
                            ? "Live / Active"
                            : "Paused"}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW BIKE / CAR FORM */}
          {activeTab === "add" && (
            <form onSubmit={handleCreateVehicle} className="space-y-4 max-w-2xl mx-auto">
              <div>
                <h4 className="text-base font-bold text-black">
                  List Your Bike or Car on Ved Travels
                </h4>
                <p className="text-xs text-black/50 mt-0.5">
                  Submit your GJ-06 vehicle. Our Sayajigunj Fleet Operations desk will verify the documents and publish it to the live fleet.
                </p>
              </div>

              {/* Quick Preset Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                  Fast Autofill: Select Common Vadodara Models
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      name: "Classic 350 Stealth",
                      brand: "Royal Enfield",
                      category: "bike" as const,
                      transmission: "Manual" as const,
                      fuel: "Petrol" as const,
                      seats: 2,
                      mileage: "36 km/l",
                      hourly: 350,
                      daily: 3899,
                      deposit: 2000,
                      img: "/images/RoyalEnfieldClassic350.jpeg",
                    },
                    {
                      name: "Activa 6G Deluxe",
                      brand: "Honda",
                      category: "bike" as const,
                      transmission: "Automatic" as const,
                      fuel: "Petrol" as const,
                      seats: 2,
                      mileage: "48 km/l",
                      hourly: 100,
                      daily: 1650,
                      deposit: 1000,
                      img: "/images/Activa.jpeg",
                    },
                    {
                      name: "Swift VXi DualJet",
                      brand: "Maruti Suzuki",
                      category: "car" as const,
                      transmission: "Manual" as const,
                      fuel: "Petrol" as const,
                      seats: 5,
                      mileage: "22 km/l",
                      hourly: 250,
                      daily: 3500,
                      deposit: 3000,
                      img: "/images/swift.jpeg",
                    },
                    {
                      name: "Thar 4x4 Hard Top",
                      brand: "Mahindra",
                      category: "car" as const,
                      transmission: "Automatic" as const,
                      fuel: "Diesel" as const,
                      seats: 4,
                      mileage: "15 km/l",
                      hourly: 450,
                      daily: 8000,
                      deposit: 5000,
                      img: "/images/Thar4x4.jpeg",
                    },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectPreset(p)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:border-[#059669] hover:text-[#059669] rounded-lg transition-colors cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
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
                      <Bike className="w-4 h-4 text-[#059669]" />
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
                      <Car className="w-4 h-4 text-[#059669]" />
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
                    placeholder="e.g. Royal Enfield / Hyundai / Maruti"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
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
                    placeholder="e.g. Hunter 350 / Swift VXi / Thar 4x4"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
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
                    className="w-full h-10 px-3 text-xs font-mono font-bold uppercase bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
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
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
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
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV (Electric)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Mileage / Fuel Econ
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45 km/l"
                    value={newMileage}
                    onChange={(e) => setNewMileage(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Hourly Rate (₹/hr)
                  </label>
                  <input
                    type="number"
                    required
                    value={newHourlyRate}
                    onChange={(e) => setNewHourlyRate(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs font-bold bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
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
                    className="w-full h-10 px-3 text-xs font-bold bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs font-bold bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-black/70 block mb-1">
                  Photo URL
                </label>
                <input
                  type="text"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingVehicle}
                className={`w-full h-12 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
                  isSubmittingVehicle
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : "bg-[#059669] hover:bg-[#047857] text-white cursor-pointer active:scale-98"
                }`}
              >
                {isSubmittingVehicle ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-800" />
                    <span>Syncing Vehicle to Google Sheets...</span>
                  </>
                ) : (
                  <span>Submit Vehicle for Admin Verification</span>
                )}
              </button>
            </form>
          )}

          {/* TAB 4: VERIFY CUSTOMER HANDOVER OTP */}
          {activeTab === "otp" && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div>
                <h4 className="text-base font-bold text-black">
                  Verify Customer Handover OTP
                </h4>
                <p className="text-xs text-black/50 mt-0.5">
                  When a renter arrives at the Vadodara Central Hub, enter their 4-digit code to release vehicle keys and mark trip active.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 bg-[#FAFAF9] p-6 rounded-2xl border border-black/5">
                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Select Customer Booking
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    required
                    className="w-full h-11 px-3 text-xs bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden font-medium"
                  >
                    <option value="">-- Select Pending Booking --</option>
                    {bookings
                      .filter(
                        (b) =>
                          b.status === "confirmed" ||
                          b.status === "confirmed_pay_at_hub"
                      )
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bookingCode} • {b.vehicleName} ({b.renterName}) - {b.status === "confirmed_pay_at_hub" ? "Pay at Hub" : "Confirmed"}
                        </option>
                      ))}
                  </select>
                  {bookings.find((b) => b.id === selectedBookingId)?.status === "confirmed_pay_at_hub" && (
                    <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Pay on Handover:</strong> Collect <strong>₹{bookings.find((b) => b.id === selectedBookingId)?.totalAmount}</strong> before handing over keys.
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-black/70 block mb-1">
                    Enter Renter&apos;s 4-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 5829"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full h-12 text-center text-2xl font-mono font-bold tracking-widest bg-white border border-black/15 rounded-xl focus:border-[#059669] focus:outline-hidden"
                  />
                  <span className="text-[10px] text-black/40 mt-1 block text-center">
                    (Renter can view this code in their &quot;My Trips&quot; console)
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-black hover:bg-black/90 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span>Verify OTP & Release Machine</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ADMIN VERIFICATION & APPROVAL CENTER */}
          {activeTab === "admin" && (
            <div className="space-y-6">
              {/* Header Desk Banner */}
              <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-emerald-950">
                      Ved Travels Fleet & Payment Desk
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Sayajigunj Central Hub Admin Console • Verify offline UPI UTRs, manage hub cash collections, and approve host fleet.
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-bold text-emerald-900 shadow-xs">
                  <span>Pending Tasks:</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-xs">
                    {totalAdminTasks}
                  </span>
                </div>
              </div>

              {/* Google Sheets Cloud Database Status Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Google Sheets Database (Bookings & Vehicles)
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      100% Free architecture: Every booking, offline payment, and host vehicle auto-syncs to your Google Sheet without paid SQL servers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {googleSheetsSyncing ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Syncing Row...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Cloud Sync Ready
                    </span>
                  )}
                </div>
              </div>

              {/* Segmented Sub-Navigation for Admin Operations */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setAdminSubTab("upi")}
                  className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adminSubTab === "upi"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>UPI Advance ({pendingUpiBookings.length})</span>
                  {pendingUpiBookings.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse"></span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAdminSubTab("hub")}
                  className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adminSubTab === "hub"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pay at Hub ({hubPayBookings.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminSubTab("vehicles")}
                  className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adminSubTab === "vehicles"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Car className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Host Vehicles ({pendingVehicles.length})</span>
                  {pendingVehicles.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse"></span>
                  )}
                </button>
              </div>

              {/* SUBTAB 1: PENDING UPI ADVANCE VERIFICATIONS */}
              {adminSubTab === "upi" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-black/60">
                      UPI Advance Payments Awaiting UTR Verification ({pendingUpiBookings.length})
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Renters who sent advance to <strong>9546883777@upi</strong>. Check UTR on your GPay/PhonePe and approve to release the 4-digit handover OTP.
                    </p>
                  </div>

                  {pendingUpiBookings.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <CheckCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                      <h5 className="font-bold text-sm text-black">No Pending UPI Verifications</h5>
                      <p className="text-xs text-black/50 max-w-md mx-auto">
                        All online UPI payments have been verified. When a customer pays advance and submits their 12-digit UTR, it will appear here for 1-click confirmation.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingUpiBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bg-white border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold bg-black text-white px-2.5 py-0.5 rounded-md">
                                {b.bookingCode}
                              </span>
                              <h5 className="font-bold text-sm sm:text-base text-black">
                                {b.vehicleName}
                              </h5>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                UPI Advance
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 space-y-0.5">
                              <div>
                                Renter: <strong className="text-slate-900">{b.renterName}</strong> • Phone:{" "}
                                <strong className="text-slate-900 font-mono">{b.renterPhone}</strong>
                              </div>
                              <div>
                                Duration: <strong className="text-slate-900">{b.durationHours} Hours</strong> • Starts:{" "}
                                <span className="text-slate-900">{b.startDate}</span>
                              </div>
                              <div>
                                Handover Point:{" "}
                                <strong className="text-slate-900">
                                  {b.doorstepDelivery
                                    ? `Doorstep Delivery (${b.deliveryAddress || "Vadodara Address"})`
                                    : "Sayajigunj Central Hub (Platform 1)"}
                                </strong>
                              </div>
                            </div>

                            {/* UTR Box */}
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 max-w-md">
                              <div>
                                <span className="text-[10px] font-bold text-amber-900 uppercase block">
                                  Submitted UPI UTR / Transaction ID
                                </span>
                                <span className="text-xs font-mono font-bold text-amber-950">
                                  {b.upiUtr ? b.upiUtr : "Pending customer submission (ask via WhatsApp)"}
                                </span>
                              </div>
                              {b.upiUtr && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(b.upiUtr!, "UTR")}
                                  className="p-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                                  title="Copy UTR"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </button>
                              )}
                            </div>

                            <div className="text-xs font-bold text-emerald-700">
                              Total Fare: {formatINR(b.totalAmount)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 w-full lg:w-56 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0">
                            <button
                              type="button"
                              onClick={() => verifyOfflineBooking(b.id)}
                              className="h-10 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify UPI & Release OTP</span>
                            </button>

                            <a
                              href={`https://wa.me/91${b.renterPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                `Hi ${b.renterName}, this is Ved Travels Vadodara regarding your reservation ${b.bookingCode} for ${b.vehicleName}. We are verifying your advance UPI payment.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-10 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Message on WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 2: PAY AT HUB RESERVATIONS */}
              {adminSubTab === "hub" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-black/60">
                      Pay at Sayajigunj Hub Reservations ({hubPayBookings.length})
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Customers who chose to pay in cash or UPI at the Sayajigunj Hub counter upon vehicle pickup. Collect full amount before handing over keys.
                    </p>
                  </div>

                  {hubPayBookings.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <CheckCheck className="w-10 h-10 text-amber-600 mx-auto" />
                      <h5 className="font-bold text-sm text-black">No Hub Cash Reservations Pending</h5>
                      <p className="text-xs text-black/50 max-w-md mx-auto">
                        There are currently no customers scheduled to pay at the counter.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hubPayBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bg-white border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold bg-amber-600 text-white px-2.5 py-0.5 rounded-md">
                                {b.bookingCode}
                              </span>
                              <h5 className="font-bold text-sm sm:text-base text-black">
                                {b.vehicleName}
                              </h5>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                Pay at Hub Counter
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 space-y-0.5">
                              <div>
                                Renter: <strong className="text-slate-900">{b.renterName}</strong> • Phone:{" "}
                                <strong className="text-slate-900 font-mono">{b.renterPhone}</strong>
                              </div>
                              <div>
                                Starts: <strong className="text-slate-900">{b.startDate}</strong> ({b.durationHours} Hours)
                              </div>
                              <div>
                                Pickup Hub: <strong className="text-slate-900">Sayajigunj Central Hub (Platform 1)</strong>
                              </div>
                            </div>

                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4 max-w-md">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-amber-800 block">
                                  Cash/UPI to Collect at Counter
                                </span>
                                <div className="text-base font-bold text-amber-950">
                                  {formatINR(b.totalAmount)}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                  Customer OTP
                                </span>
                                <span className="text-sm font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                                  {b.otp}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 w-full lg:w-56 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0">
                            <button
                              type="button"
                              onClick={() => verifyOfflineBooking(b.id)}
                              className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Confirm Payment Received</span>
                            </button>

                            <a
                              href={`https://wa.me/91${b.renterPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                `Hi ${b.renterName}, this is Ved Travels Vadodara regarding your reservation ${b.bookingCode} for ${b.vehicleName}. We look forward to seeing you at our Sayajigunj Hub!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-10 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>WhatsApp Renter</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 3: HOST VEHICLES PENDING APPROVAL */}
              {adminSubTab === "vehicles" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-black/50">
                      Vehicles Awaiting Fleet Ops Approval ({pendingVehicles.length})
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Review GJ-06 registered vehicles submitted by local Vadodara hosts.
                    </p>
                  </div>

                  {pendingVehicles.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <CheckCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                      <h5 className="font-bold text-sm text-black">All Host Vehicles Verified!</h5>
                      <p className="text-xs text-black/50 max-w-md mx-auto">
                        There are currently no machines awaiting review. When a host attaches a bike or car, it will appear here for 1-click publishing.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("add")}
                        className="mt-3 px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-black/80 cursor-pointer"
                      >
                        Test Submit a Host Machine
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingVehicles.map((v) => (
                        <div
                          key={v.id}
                          className="bg-white border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-16 rounded-xl overflow-hidden bg-black/5 shrink-0 relative">
                              <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-sm sm:text-base text-black">
                                  {v.name}
                                </h5>
                                <span className="text-xs font-mono font-bold bg-black/5 text-black px-2 py-0.5 rounded border border-black/10">
                                  {v.plate}
                                </span>
                              </div>
                              <p className="text-xs text-black/60">
                                Host: <strong className="text-black">{v.hostName}</strong> • {v.category === "bike" ? "Two-Wheeler" : "Car"} • {v.transmission} • {v.fuel}
                              </p>
                              <div className="text-xs font-bold text-[#059669]">
                                Tariff: {formatINR(v.hourlyRate)}/hr • {formatINR(v.dailyRate)}/day
                              </div>
                            </div>
                          </div>

                          {/* Actions: Approve & Reject */}
                          <div className="flex items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0">
                            <button
                              type="button"
                              onClick={() => approveVehicle(v.id)}
                              className="flex-1 md:flex-initial h-10 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve & Publish to Fleet</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => rejectVehicle(v.id)}
                              className="h-10 px-3 rounded-xl border border-red-300 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

