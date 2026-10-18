"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Vehicle,
  Booking,
  User,
  INITIAL_VEHICLES,
  DEMO_RENTER,
  DEMO_HOST,
  DEMO_ADMIN,
  VADODARA_CENTRAL_HUB,
} from "@/data/fleet";
import { toast } from "sonner";
import {
  syncBookingToGoogleSheets,
  syncVehicleToGoogleSheets,
  updateBookingStatusInGoogleSheets,
  approveVehicleInGoogleSheets,
} from "@/lib/googleSheets";

export interface DurationOption {
  id: string;
  label: string;
  hours: number;
  isDaily: boolean;
  multiplier: number;
}

export const DURATION_PRESETS: DurationOption[] = [
  { id: "6h", label: "6 Hours", hours: 6, isDaily: false, multiplier: 6 },
  { id: "12h", label: "12 Hours", hours: 12, isDaily: false, multiplier: 12 },
  { id: "24h", label: "1 Day (24 Hrs)", hours: 24, isDaily: true, multiplier: 1 },
  { id: "3d", label: "3 Days", hours: 72, isDaily: true, multiplier: 3 },
  { id: "7d", label: "7 Days (Week)", hours: 168, isDaily: true, multiplier: 7 },
];

interface RentalContextType {
  // Auth
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  loginAsDemoRenter: () => void;
  loginAsDemoHost: () => void;
  loginAsDemoAdmin: () => void;
  updateKyc: (dlNumber: string, aadhaarNumber: string) => void;

  // Fleet
  vehicles: Vehicle[];
  toggleVehicleAvailability: (vehicleId: string) => void;
  updateVehiclePricing: (vehicleId: string, hourlyRate: number, dailyRate: number) => void;
  addVehicle: (newVehicle: Omit<Vehicle, "id" | "rating" | "tripsCount" | "approvalStatus">) => void;
  approveVehicle: (vehicleId: string) => void;
  rejectVehicle: (vehicleId: string) => void;

  // Bookings & Slot Lock
  bookings: Booking[];
  isVehicleSlotLocked: (vehicleId: string, duration?: DurationOption) => boolean;
  createBooking: (params: {
    vehicle: Vehicle;
    duration: DurationOption;
    doorstepDelivery: boolean;
    deliveryAddress?: string;
    paymentMode: "upi_advance" | "pay_at_hub";
    upiUtr?: string;
  }) => Booking;
  verifyHandoverOtp: (bookingId: string, enteredOtp: string) => boolean;
  verifyOfflineBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  googleSheetsSyncing: boolean;

  // Search & Filter state
  searchCategory: "all" | "bike" | "car";
  setSearchCategory: (cat: "all" | "bike" | "car") => void;
  selectedDuration: DurationOption;
  setSelectedDuration: (duration: DurationOption) => void;
  doorstepDelivery: boolean;
  setDoorstepDelivery: (val: boolean) => void;
  pickupTime: string;
  setPickupTime: (time: string) => void;
  dropTime: string;
  setDropTime: (time: string) => void;

  // Pricing helper
  calculateTariff: (
    vehicle: Vehicle,
    duration: DurationOption,
    withDelivery?: boolean
  ) => {
    baseRent: number;
    deposit: number;
    deliveryFee: number;
    total: number;
    rateText: string;
  };

  // UI Modal controllers
  authModalOpen: boolean;
  openAuthModal: (role?: "renter" | "host" | "admin") => void;
  closeAuthModal: () => void;
  authModalDefaultRole: "renter" | "host" | "admin";

  myTripsModalOpen: boolean;
  openMyTripsModal: () => void;
  closeMyTripsModal: () => void;

  hostDashboardOpen: boolean;
  openHostDashboard: () => void;
  closeHostDashboard: () => void;

  selectedVehicle: Vehicle | null;
  openBookingModal: (vehicle: Vehicle) => void;
  closeBookingModal: () => void;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

const VEHICLES_KEY = "ved_travels_vehicles_v3";
const BOOKINGS_KEY = "ved_travels_bookings_v3";
const USER_KEY = "ved_travels_user_v3";

export function RentalProvider({ children }: { children: React.ReactNode }) {
  // State initialization with localStorage fallback
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Search & Filter
  const [searchCategory, setSearchCategory] = useState<"all" | "bike" | "car">("all");
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(DURATION_PRESETS[2]); // 1 Day
  const [doorstepDelivery, setDoorstepDelivery] = useState<boolean>(false);
  const [pickupTime, setPickupTime] = useState<string>("09:00 AM Today");
  const [dropTime, setDropTime] = useState<string>("09:00 AM Tomorrow");

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<"renter" | "host" | "admin">("renter");
  const [myTripsModalOpen, setMyTripsModalOpen] = useState(false);
  const [hostDashboardOpen, setHostDashboardOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [googleSheetsSyncing, setGoogleSheetsSyncing] = useState<boolean>(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      const storedVehicles = localStorage.getItem(VEHICLES_KEY);
      if (storedVehicles) {
        setVehicles(JSON.parse(storedVehicles));
      } else {
        localStorage.setItem(VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLES));
      }

      const storedBookings = localStorage.getItem(BOOKINGS_KEY);
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      }
    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
  }, []);

  // Save changes
  const saveUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  const saveVehicles = (list: Vehicle[]) => {
    setVehicles(list);
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(list));
  };

  const saveBookings = (list: Booking[]) => {
    setBookings(list);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  };

  // Auth actions
  const login = (user: User) => {
    saveUser(user);
    const roleLabel =
      user.role === "admin"
        ? "Fleet Operations Admin"
        : user.role === "host"
        ? "Vehicle Host (Partner)"
        : "Customer (Renter)";
    toast.success(`Welcome to Ved Travels, ${user.name}!`, {
      description: `Active role: ${roleLabel}`,
    });
    setAuthModalOpen(false);
  };

  const logout = () => {
    saveUser(null);
    toast.info("Logged out from Ved Travels");
    setHostDashboardOpen(false);
    setMyTripsModalOpen(false);
  };

  const loginAsDemoRenter = () => {
    login(DEMO_RENTER);
  };

  const loginAsDemoHost = () => {
    login(DEMO_HOST);
  };

  const loginAsDemoAdmin = () => {
    login(DEMO_ADMIN);
  };

  const updateKyc = (dlNumber: string, aadhaarNumber: string) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      dlNumber,
      aadhaarNumber,
      kycStatus: "verified",
      dlVerified: true,
    };
    saveUser(updated);
    toast.success("KYC Verified Successfully!", {
      description: "Driving License & Aadhaar authenticated for paperless vehicle handover.",
    });
  };

  // Fleet management actions
  const toggleVehicleAvailability = (vehicleId: string) => {
    const updated = vehicles.map((v) => {
      if (v.id === vehicleId) {
        const nextState = !v.available;
        toast.info(`${v.name} status updated`, {
          description: nextState ? "Now LIVE & available for bookings" : "Paused for personal use",
        });
        return { ...v, available: nextState };
      }
      return v;
    });
    saveVehicles(updated);
  };

  const updateVehiclePricing = (vehicleId: string, hourlyRate: number, dailyRate: number) => {
    const updated = vehicles.map((v) =>
      v.id === vehicleId ? { ...v, hourlyRate, dailyRate } : v
    );
    saveVehicles(updated);
    toast.success("Tariff rates updated!");
  };

  const addVehicle = (newVehicle: Omit<Vehicle, "id" | "rating" | "tripsCount" | "approvalStatus">) => {
    const id = `host-veh-${Date.now()}`;
    const vehicleWithMeta: Vehicle = {
      ...newVehicle,
      id,
      rating: 5.0,
      tripsCount: 0,
      ownerType: "host",
      approvalStatus: "pending_approval",
      available: false, // Locked until approved by Admin
      bookedSlots: [],
    };
    const updated = [vehicleWithMeta, ...vehicles];
    saveVehicles(updated);

    toast.success(`${newVehicle.name} Submitted for Verification!`, {
      description: "Our Sayajigunj Hub Admin will review and verify your GJ-06 listing.",
      duration: 6000,
    });

    // Seamless background sync to Google Sheets "Vehicles" tab
    syncVehicleToGoogleSheets(vehicleWithMeta).then((res) => {
      if (res && res.success) {
        toast.success("Synced to Google Sheets Database!", {
          description: `Row added to 'Vehicles' sheet for ${vehicleWithMeta.name}.`,
        });
      }
    });
  };

  const approveVehicle = (vehicleId: string) => {
    const updated = vehicles.map((v) =>
      v.id === vehicleId ? { ...v, approvalStatus: "approved" as const, available: true } : v
    );
    saveVehicles(updated);
    const target = vehicles.find((v) => v.id === vehicleId);

    toast.success(`${target?.name || "Vehicle"} Approved & Published!`, {
      description: "Now live on Ved Travels Vadodara homepage for instant customer bookings.",
    });

    // Sync status to Google Sheets
    approveVehicleInGoogleSheets(vehicleId);
  };

  const rejectVehicle = (vehicleId: string) => {
    const updated = vehicles.map((v) =>
      v.id === vehicleId ? { ...v, approvalStatus: "rejected" as const, available: false } : v
    );
    saveVehicles(updated);
    toast.error("Vehicle listing rejected", {
      description: "Please ensure registration is GJ-06 and commercial insurance details are complete.",
    });
  };

  // Real time-slot overlap check
  const isVehicleSlotLocked = (vehicleId: string, duration: DurationOption = selectedDuration) => {
    return bookings.some(
      (b) =>
        b.vehicleId === vehicleId &&
        (b.status === "confirmed" ||
          b.status === "confirmed_pay_at_hub" ||
          b.status === "pending_offline_verification" ||
          b.status === "in_trip") &&
        b.durationHours === duration.hours
    );
  };

  // Pricing calculator: Hourly for < 24h, Daily for 24h+
  const calculateTariff = (
    vehicle: Vehicle,
    duration: DurationOption,
    withDelivery: boolean = doorstepDelivery
  ) => {
    let baseRent = 0;
    let rateText = "";

    if (duration.hours < 24) {
      // Under 24 hours: Apply hourly rate
      baseRent = vehicle.hourlyRate * duration.hours;
      rateText = `₹${vehicle.hourlyRate}/hr × ${duration.hours} hrs`;
    } else {
      // 24 hours or more: Apply daily rate
      const days = Math.max(1, Math.round(duration.hours / 24));
      baseRent = vehicle.dailyRate * days;
      rateText = `₹${vehicle.dailyRate.toLocaleString("en-IN")}/day × ${days} ${days === 1 ? "day" : "days"}`;
    }

    const deliveryFee = withDelivery ? VADODARA_CENTRAL_HUB.deliveryCharge : 0;
    const deposit = vehicle.securityDeposit;
    const total = baseRent + deliveryFee + deposit;

    return {
      baseRent,
      deposit,
      deliveryFee,
      total,
      rateText,
    };
  };

  // Booking actions with Slot Lock & OTP generation & Google Sheets Sync
  const createBooking = (params: {
    vehicle: Vehicle;
    duration: DurationOption;
    doorstepDelivery: boolean;
    deliveryAddress?: string;
    paymentMode: "upi_advance" | "pay_at_hub";
    upiUtr?: string;
  }) => {
    // Overlapping double-booking check
    if (isVehicleSlotLocked(params.vehicle.id, params.duration)) {
      toast.error("Time-Slot Already Reserved!", {
        description: `This ${params.vehicle.name} is currently reserved for the selected ${params.duration.label} slot.`,
      });
      throw new Error("Slot already booked");
    }

    // Generate secure 4-digit handover OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingCode = `VED-GJ06-${Math.floor(10000 + Math.random() * 90000)}`;

    const { baseRent, deposit, deliveryFee, total } = calculateTariff(
      params.vehicle,
      params.duration,
      params.doorstepDelivery
    );

    const status: Booking["status"] =
      params.paymentMode === "upi_advance"
        ? "pending_offline_verification"
        : "confirmed_pay_at_hub";

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      bookingCode,
      vehicleId: params.vehicle.id,
      vehicleName: params.vehicle.name,
      vehiclePlate: params.vehicle.plate,
      vehicleCategory: params.vehicle.category,
      vehicleImage: params.vehicle.images[0] || "",
      renterId: currentUser ? currentUser.id : "guest-renter",
      renterName: currentUser ? currentUser.name : "Vadodara Traveler",
      renterPhone: currentUser ? currentUser.phone : "9546883777",
      startDate: pickupTime,
      endDate: dropTime,
      durationHours: params.duration.hours,
      durationLabel: params.duration.label,
      baseRent,
      doorstepDelivery: params.doorstepDelivery,
      deliveryAddress: params.deliveryAddress || "Vadodara Main Hub",
      deliveryFee,
      securityDeposit: deposit,
      totalAmount: total,
      otp,
      paymentMode: params.paymentMode,
      upiUtr: params.upiUtr,
      status,
      createdAt: "Today",
      hubName: VADODARA_CENTRAL_HUB.name,
      hubAddress: VADODARA_CENTRAL_HUB.address,
      syncedToGoogleSheets: false,
    };

    const updatedBookings = [newBooking, ...bookings];
    saveBookings(updatedBookings);

    // Lock slot on vehicle
    const slot = {
      start: pickupTime,
      end: dropTime,
      bookingId: newBooking.id,
    };
    const updatedVehicles = vehicles.map((v) =>
      v.id === params.vehicle.id
        ? {
            ...v,
            bookedSlots: [...(v.bookedSlots || []), slot],
          }
        : v
    );
    saveVehicles(updatedVehicles);

    // Background sync to Google Sheets "Bookings" tab
    setGoogleSheetsSyncing(true);
    syncBookingToGoogleSheets(newBooking).then((res) => {
      setGoogleSheetsSyncing(false);
      if (res && res.success) {
        toast.success("Synced to Google Sheets Database!", {
          description: `Row appended to 'Bookings' spreadsheet for ${newBooking.bookingCode}.`,
        });
        const marked = updatedBookings.map((b) =>
          b.id === newBooking.id ? { ...b, syncedToGoogleSheets: true } : b
        );
        saveBookings(marked);
      }
    });

    return newBooking;
  };

  const verifyOfflineBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: "confirmed" as const } : b
    );
    saveBookings(updated);
    updateBookingStatusInGoogleSheets(booking.bookingCode, "confirmed");

    toast.success("Offline Booking Verified & Confirmed!", {
      description: `Payment confirmed for ${booking.vehicleName}. 4-digit OTP is active for handover.`,
    });
  };

  const verifyHandoverOtp = (bookingId: string, enteredOtp: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      toast.error("Booking not found");
      return false;
    }

    if (booking.otp === enteredOtp.trim()) {
      const updated = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "in_trip" as const } : b
      );
      saveBookings(updated);
      updateBookingStatusInGoogleSheets(booking.bookingCode, "in_trip");

      toast.success("OTP Verified! Trip Handover Commenced", {
        description: `Vehicle keys handed over to ${booking.renterName}. Machine in trip.`,
      });
      return true;
    } else {
      toast.error("Invalid 4-digit OTP", {
        description: "Please verify the 4-digit OTP shown in the customer's 'My Trips' console.",
      });
      return false;
    }
  };

  const cancelBooking = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: "cancelled" as const } : b
    );
    saveBookings(updated);

    if (target) {
      // Release locked slot on vehicle
      const updatedVehicles = vehicles.map((v) =>
        v.id === target.vehicleId
          ? {
              ...v,
              bookedSlots: (v.bookedSlots || []).filter((s) => s.bookingId !== bookingId),
            }
          : v
      );
      saveVehicles(updatedVehicles);
    }

    toast.info("Booking Cancelled", {
      description: "Time-slot released. 100% deposit refunded to your UPI account.",
    });
  };

  // Modal actions
  const openAuthModal = (role: "renter" | "host" | "admin" = "renter") => {
    setAuthModalDefaultRole(role);
    setAuthModalOpen(true);
  };
  const closeAuthModal = () => setAuthModalOpen(false);

  const openMyTripsModal = () => setMyTripsModalOpen(true);
  const closeMyTripsModal = () => setMyTripsModalOpen(false);

  const openHostDashboard = () => setHostDashboardOpen(true);
  const closeHostDashboard = () => setHostDashboardOpen(false);

  const openBookingModal = (vehicle: Vehicle) => setSelectedVehicle(vehicle);
  const closeBookingModal = () => setSelectedVehicle(null);

  return (
    <RentalContext.Provider
      value={{
        currentUser,
        login,
        logout,
        loginAsDemoRenter,
        loginAsDemoHost,
        loginAsDemoAdmin,
        updateKyc,
        vehicles,
        toggleVehicleAvailability,
        updateVehiclePricing,
        addVehicle,
        approveVehicle,
        rejectVehicle,
        bookings,
        isVehicleSlotLocked,
        createBooking,
        verifyHandoverOtp,
        verifyOfflineBooking,
        cancelBooking,
        googleSheetsSyncing,
        searchCategory,
        setSearchCategory,
        selectedDuration,
        setSelectedDuration,
        doorstepDelivery,
        setDoorstepDelivery,
        pickupTime,
        setPickupTime,
        dropTime,
        setDropTime,
        calculateTariff,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalDefaultRole,
        myTripsModalOpen,
        openMyTripsModal,
        closeMyTripsModal,
        hostDashboardOpen,
        openHostDashboard,
        closeHostDashboard,
        selectedVehicle,
        openBookingModal,
        closeBookingModal,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
}

export function useRental() {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error("useRental must be used within a RentalProvider");
  }
  return context;
}
