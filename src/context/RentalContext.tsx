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
  VADODARA_LOCATIONS,
  TariffSlabs,
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

// Exactly matching client's tariff card: 1 Hr, 3 Hrs, 6 Hrs, 12 Hrs, 24 Hrs (1 Day)
export const DURATION_PRESETS: DurationOption[] = [
  { id: "1h", label: "1 Hr", hours: 1, isDaily: false, multiplier: 1 },
  { id: "3h", label: "3 Hrs", hours: 3, isDaily: false, multiplier: 3 },
  { id: "6h", label: "6 Hrs", hours: 6, isDaily: false, multiplier: 6 },
  { id: "12h", label: "12 Hrs", hours: 12, isDaily: false, multiplier: 12 },
  { id: "24h", label: "24 Hrs (1 Day)", hours: 24, isDaily: true, multiplier: 1 },
];

export interface TariffCalculation {
  baseRent: number;
  deposit: number;
  deliveryFee: number;
  total: number;
  rateText: string;
  isMinEnforced: boolean;
}

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
  addVehicle: (
    newVehicle: Omit<Vehicle, "id" | "rating" | "tripsCount" | "approvalStatus" | "slabs" | "minHours"> & {
      slabs?: TariffSlabs;
      minHours?: number;
    }
  ) => void;
  approveVehicle: (vehicleId: string) => void;
  rejectVehicle: (vehicleId: string) => void;

  // Bookings & Slot Lock
  bookings: Booking[];
  isVehicleSlotLocked: (vehicleId: string, duration?: DurationOption) => boolean;
  createBooking: (params: {
    vehicle: Vehicle;
    duration: DurationOption;
    doorstepDelivery: boolean;
    pickupLocation?: string;
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
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
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
  ) => TariffCalculation;

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

const VEHICLES_KEY = "ved_travels_vehicles_v4_slabs";
const BOOKINGS_KEY = "ved_travels_bookings_v4";
const USER_KEY = "ved_travels_user_v4";

export function RentalProvider({ children }: { children: React.ReactNode }) {
  // State initialization with localStorage fallback
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Search & Filter
  const [searchCategory, setSearchCategory] = useState<"all" | "bike" | "car">("all");
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(DURATION_PRESETS[4]); // 24 Hrs Default
  const [selectedLocation, setSelectedLocation] = useState<string>("Vadodara Railway Station");
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

  // Load from localStorage on client mount & ensure fresh slab-based fleet
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      const storedVehicles = localStorage.getItem(VEHICLES_KEY);
      if (storedVehicles) {
        const parsed = JSON.parse(storedVehicles);
        // If older cached fleet lacks slabs, force refresh to new official 10 vehicles
        if (Array.isArray(parsed) && parsed.length === INITIAL_VEHICLES.length && parsed[0]?.slabs) {
          setVehicles(parsed);
        } else {
          setVehicles(INITIAL_VEHICLES);
          localStorage.setItem(VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLES));
        }
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
    const updated: Vehicle[] = vehicles.map((v) =>
      v.id === vehicleId
        ? {
            ...v,
            hourlyRate,
            dailyRate,
            slabs: {
              ...v.slabs,
              hr24: dailyRate,
              hr12: v.slabs.hr12,
            },
          }
        : v
    );
    saveVehicles(updated);
    toast.success("Tariff rates updated!");
  };

  const addVehicle = (
    newVehicle: Omit<Vehicle, "id" | "rating" | "tripsCount" | "approvalStatus" | "slabs" | "minHours"> & {
      slabs?: TariffSlabs;
      minHours?: number;
    }
  ) => {
    const id = `host-veh-${Date.now()}`;
    const isCar = newVehicle.category === "car";
    const defaultSlabs: TariffSlabs = newVehicle.slabs || (isCar
      ? {
          hr12: Math.round(newVehicle.dailyRate * 0.72) || 2500,
          hr24: newVehicle.dailyRate || 3500,
        }
      : {
          hr1: newVehicle.hourlyRate || 100,
          hr3: Math.round((newVehicle.hourlyRate || 100) * 2.6),
          hr6: Math.round((newVehicle.hourlyRate || 100) * 5.6),
          hr12: Math.round((newVehicle.hourlyRate || 100) * 10.5),
          hr24: newVehicle.dailyRate || 1650,
        });

    const vehicleWithMeta: Vehicle = {
      ...newVehicle,
      id,
      rating: 5.0,
      tripsCount: 0,
      ownerType: "host",
      approvalStatus: "pending_approval",
      available: false, // Locked until approved by Admin
      slabs: defaultSlabs,
      minHours: newVehicle.minHours || (isCar ? 12 : 1),
      bookedSlots: [],
    };
    const updated = [vehicleWithMeta, ...vehicles];
    saveVehicles(updated);

    toast.success(`${newVehicle.name} Submitted for Verification!`, {
      description: "Our Vadodara Hub Admin will review and verify your GJ-06 listing.",
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

  // Official Slab Pricing Engine matching client's exact tariff card
  const calculateTariff = (
    vehicle: Vehicle,
    duration: DurationOption,
    withDelivery: boolean = doorstepDelivery
  ): TariffCalculation => {
    let baseRent = 0;
    let rateText = "";
    const isCar = vehicle.category === "car" || vehicle.minHours >= 12;

    if (isCar) {
      // Smart Car Rule: Cars start at 12 hours minimum
      if (duration.hours <= 12) {
        baseRent = vehicle.slabs?.hr12 || (vehicle.hourlyRate * 12);
        rateText = duration.hours < 12 ? "Min 12 Hrs Package" : "12 Hrs Slab";
      } else if (duration.hours <= 24) {
        baseRent = vehicle.slabs?.hr24 || vehicle.dailyRate;
        rateText = "24 Hrs (1 Day) Slab";
      } else {
        const days = Math.max(1, Math.ceil(duration.hours / 24));
        const dayRate = vehicle.slabs?.hr24 || vehicle.dailyRate;
        baseRent = dayRate * days;
        rateText = `₹${dayRate.toLocaleString("en-IN")}/day × ${days} days`;
      }
    } else {
      // Two-Wheelers: 1h, 3h, 6h, 12h, 24h exact slabs
      if (duration.hours <= 1) {
        baseRent = vehicle.slabs?.hr1 ?? vehicle.hourlyRate;
        rateText = "1 Hr Slab";
      } else if (duration.hours <= 3) {
        baseRent = vehicle.slabs?.hr3 ?? (vehicle.hourlyRate * 3);
        rateText = "3 Hrs Slab";
      } else if (duration.hours <= 6) {
        baseRent = vehicle.slabs?.hr6 ?? (vehicle.hourlyRate * 6);
        rateText = "6 Hrs Slab";
      } else if (duration.hours <= 12) {
        baseRent = vehicle.slabs?.hr12 ?? (vehicle.hourlyRate * 12);
        rateText = "12 Hrs Slab";
      } else if (duration.hours <= 24) {
        baseRent = vehicle.slabs?.hr24 ?? vehicle.dailyRate;
        rateText = "24 Hrs (1 Day) Slab";
      } else {
        const days = Math.max(1, Math.ceil(duration.hours / 24));
        const dayRate = vehicle.slabs?.hr24 ?? vehicle.dailyRate;
        baseRent = dayRate * days;
        rateText = `₹${dayRate.toLocaleString("en-IN")}/day × ${days} days`;
      }
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
      isMinEnforced: isCar && duration.hours < 12,
    };
  };

  // Booking actions with Slot Lock & OTP generation & Google Sheets Sync
  const createBooking = (params: {
    vehicle: Vehicle;
    duration: DurationOption;
    doorstepDelivery: boolean;
    pickupLocation?: string;
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

    const resolvedLocation = params.pickupLocation || selectedLocation || "Vadodara Railway Station";

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
      pickupLocation: resolvedLocation,
      deliveryAddress: params.doorstepDelivery
        ? params.deliveryAddress || `${resolvedLocation}, Vadodara`
        : resolvedLocation,
      deliveryFee,
      securityDeposit: deposit,
      totalAmount: total,
      otp,
      paymentMode: params.paymentMode,
      upiUtr: params.upiUtr,
      status,
      createdAt: "Today",
      hubName: resolvedLocation,
      hubAddress: `${resolvedLocation}, Vadodara, Gujarat`,
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
          description: `Row appended to 'Bookings' spreadsheet for ${newBooking.bookingCode} (${resolvedLocation}).`,
        });
        const marked = updatedBookings.map((b) =>
          b.id === newBooking.id ? { ...b, syncedToGoogleSheets: true } : b
        );
        saveBookings(marked);
      }
    });

    return newBooking;
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
      toast.success("4-Digit OTP Verified!", {
        description: `Handover successful for ${booking.vehicleName}. Trip is now IN-PROGRESS.`,
      });
      // Sync update to Google Sheets
      updateBookingStatusInGoogleSheets(booking.bookingCode, "in_trip");
      return true;
    } else {
      toast.error("Invalid 4-Digit OTP", {
        description: "Please check the OTP on renter's phone and try again.",
      });
      return false;
    }
  };

  const verifyOfflineBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: "confirmed" as const } : b
    );
    saveBookings(updated);
    toast.success("Payment Verified & Slot Confirmed!", {
      description: `Renter ${booking.renterName}'s booking is confirmed. Ready for pickup at ${booking.pickupLocation || booking.hubName}.`,
    });
    // Sync to Google Sheets
    updateBookingStatusInGoogleSheets(booking.bookingCode, "confirmed");
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: "cancelled" as const } : b
    );
    saveBookings(updated);

    // Release vehicle slot
    const updatedVehicles = vehicles.map((v) => {
      if (v.id === booking.vehicleId && v.bookedSlots) {
        return {
          ...v,
          bookedSlots: v.bookedSlots.filter((s) => s.bookingId !== bookingId),
        };
      }
      return v;
    });
    saveVehicles(updatedVehicles);

    toast.info("Booking Cancelled", {
      description: `Time slot released for ${booking.vehicleName}.`,
    });
    // Sync update to Google Sheets
    updateBookingStatusInGoogleSheets(booking.bookingCode, "cancelled");
  };

  // UI modal openers
  const openAuthModal = (role: "renter" | "host" | "admin" = "renter") => {
    setAuthModalDefaultRole(role);
    setAuthModalOpen(true);
  };
  const closeAuthModal = () => setAuthModalOpen(false);

  const openMyTripsModal = () => setMyTripsModalOpen(true);
  const closeMyTripsModal = () => setMyTripsModalOpen(false);

  const openHostDashboard = () => setHostDashboardOpen(true);
  const closeHostDashboard = () => setHostDashboardOpen(false);

  const openBookingModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    // Smart Car Rule: Auto-enforce 12h if car is selected and current duration is < 12h
    if (vehicle.category === "car" && selectedDuration.hours < 12) {
      setSelectedDuration(DURATION_PRESETS[3]); // 12h
      toast.info("Cars require minimum 12-hour booking", {
        description: `Duration automatically set to 12 Hours (${DURATION_PRESETS[3].label}).`,
      });
    }
  };
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
        selectedLocation,
        setSelectedLocation,
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
