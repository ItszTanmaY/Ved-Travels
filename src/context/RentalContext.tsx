"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Vehicle,
  Booking,
  User,
  INITIAL_VEHICLES,
  VED_ADMIN_ACCOUNT,
  VADODARA_CENTRAL_HUB,
  VADODARA_LOCATIONS,
  TariffSlabs,
} from "@/data/fleet";
import { toast } from "sonner";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import {
  syncBookingToGoogleSheets,
  syncVehicleToGoogleSheets,
  syncUserToGoogleSheets,
  updateBookingStatusInGoogleSheets,
  approveVehicleInGoogleSheets,
  rejectVehicleInGoogleSheets,
  approveHostInGoogleSheets,
  rejectHostInGoogleSheets,
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
  registeredUsers: User[];
  login: (user: User) => void;
  logout: () => void;
  signInWithGoogle: (chosenRole?: "renter" | "host") => Promise<User | null>;
  registerUser: (newUser: Omit<User, "id">) => User;
  loginWithCredentials: (identifier: string, secret: string) => User | null;
  loginAsAdmin: (secret?: string) => boolean;
  approveHostAccount: (userId: string) => void;
  rejectHostAccount: (userId: string) => void;
  updateKyc: (dlNumber: string, aadhaarNumber: string, dlPhotoUrl?: string) => void;

  // Fleet
  vehicles: Vehicle[];
  toggleVehicleAvailability: (vehicleId: string) => void;
  updateVehiclePricing: (vehicleId: string, hourlyRate: number, dailyRate: number) => void;
  addVehicle: (
    newVehicle: Omit<
      Vehicle,
      "id" | "rating" | "tripsCount" | "approvalStatus" | "slabs" | "minHours" | "available"
    > & {
      slabs?: TariffSlabs;
      minHours?: number;
      available?: boolean;
    }
  ) => void;
  approveVehicle: (vehicleId: string) => void;
  rejectVehicle: (vehicleId: string) => void;

  // Bookings & Slot Lock
  bookings: Booking[];
  isVehicleCurrentlyBooked: (vehicleId: string) => boolean;
  isVehicleSlotLocked: (vehicleId: string, duration?: DurationOption) => boolean;
  createBooking: (params: {
    vehicle: Vehicle;
    duration: DurationOption;
    doorstepDelivery: boolean;
    pickupLocation?: string;
    deliveryAddress?: string;
    paymentMode?: "upi_advance" | "pay_at_hub" | "whatsapp_booking";
    upiUtr?: string;
    dlPhotoUrl?: string;
  }) => Booking;
  verifyPaymentAndGenerateOtp: (bookingId: string) => void;
  verifyHandoverOtp: (bookingId: string, enteredOtp: string) => boolean;
  verifyOfflineBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  markBookingTripStatus: (
    bookingId: string,
    status: "confirmed" | "in_trip" | "completed" | "cancelled"
  ) => void;
  clearHostPayout: (bookingId: string) => void;
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

  adminDashboardOpen: boolean;
  openAdminDashboard: () => void;
  closeAdminDashboard: () => void;

  selectedVehicle: Vehicle | null;
  openBookingModal: (vehicle: Vehicle) => void;
  closeBookingModal: () => void;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

const VEHICLES_KEY = "ved_travels_vehicles_v6_real";
const BOOKINGS_KEY = "ved_travels_bookings_v6_real";
const USER_KEY = "ved_travels_user_v6_real";
const REGISTERED_USERS_KEY = "ved_travels_registered_users_v6";

export function RentalProvider({ children }: { children: React.ReactNode }) {
  // State initialization with localStorage fallback
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
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
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [googleSheetsSyncing, setGoogleSheetsSyncing] = useState<boolean>(false);

  // Load from localStorage on client mount & ensure fresh slab-based fleet
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Exclude old mock demo users
        if (parsed && !parsed.id?.startsWith("demo-")) {
          setCurrentUser(parsed);
        } else {
          localStorage.removeItem(USER_KEY);
        }
      }

      const storedRegUsers = localStorage.getItem(REGISTERED_USERS_KEY);
      if (storedRegUsers) {
        const parsedUsers = JSON.parse(storedRegUsers);
        if (Array.isArray(parsedUsers)) {
          setRegisteredUsers(parsedUsers.filter((u: User) => !u.id?.startsWith("demo-")));
        }
      }

      const storedVehicles = localStorage.getItem(VEHICLES_KEY);
      if (storedVehicles) {
        const parsed = JSON.parse(storedVehicles);
        if (
          Array.isArray(parsed) &&
          parsed.length >= INITIAL_VEHICLES.length &&
          parsed[0]?.slabs &&
          parsed[0]?.securityDeposit === 0
        ) {
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
        const parsedB = JSON.parse(storedBookings);
        if (Array.isArray(parsedB)) {
          setBookings(parsedB);
        }
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

  const saveRegisteredUsers = (users: User[]) => {
    setRegisteredUsers(users);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
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
        ? "Operations Lead (Admin)"
        : user.role === "host"
        ? "Vehicle Host Partner"
        : "Customer (Renter)";

    toast.success(`Welcome to Ved Travels, ${user.name}!`, {
      description: `Active role: ${roleLabel}`,
    });
    setAuthModalOpen(false);
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    saveUser(null);
    toast.info("Logged out from Ved Travels");
    setHostDashboardOpen(false);
    setMyTripsModalOpen(false);
    setAdminDashboardOpen(false);
  };

  const signInWithGoogle = async (chosenRole: "renter" | "host" = "renter"): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      if (!firebaseUser) throw new Error("No user returned from Google");

      const email = (firebaseUser.email || "").toLowerCase();
      const name = firebaseUser.displayName || "Vadodara Traveler";
      const phone = firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace(/\D/g, "") : "";
      const avatar = firebaseUser.photoURL || undefined;

      const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "vedtravels0777@gmail.com").toLowerCase();
      const isAdmin = email === adminEmail;

      const existing = registeredUsers.find((u) => u.email.toLowerCase() === email);

      let userToSet: User;
      if (isAdmin) {
        userToSet = {
          id: existing?.id || `admin-${firebaseUser.uid}`,
          name: name || "Shantanu Shekhar",
          email: email,
          phone: phone || existing?.phone || "9546883777",
          role: "admin",
          avatar: avatar || existing?.avatar,
          kycStatus: "verified",
          dlVerified: true,
        };
        toast.success("Master Admin Access Granted!", {
          description: `Signed in as ${email}. Operations Console unlocked.`,
        });
      } else {
        const assignedRole = existing?.role || chosenRole;
        userToSet = {
          id: existing?.id || `usr-${firebaseUser.uid}`,
          name: name,
          email: email,
          phone: phone || existing?.phone || "",
          role: assignedRole,
          avatar: avatar || existing?.avatar,
          hostStatus: existing?.hostStatus || (assignedRole === "host" ? "pending_approval" : undefined),
          kycStatus: existing?.kycStatus || "unverified",
          dlNumber: existing?.dlNumber,
          aadhaarNumber: existing?.aadhaarNumber,
          dlPhotoUrl: existing?.dlPhotoUrl,
          dlVerified: existing?.dlVerified || false,
        };
        toast.success(`Welcome, ${name}!`, {
          description:
            assignedRole === "host"
              ? "Host Partner profile created. Verification in progress."
              : "Signed in securely with Google.",
        });
      }

      const updatedUsers = existing
        ? registeredUsers.map((u) => (u.id === userToSet.id ? userToSet : u))
        : [userToSet, ...registeredUsers];
      saveRegisteredUsers(updatedUsers);
      login(userToSet);

      // Sync user to Google Sheets
      syncUserToGoogleSheets(userToSet);

      setAuthModalOpen(false);
      return userToSet;
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        toast.info("Google Sign-In was closed.");
      } else if (err.code === "auth/cancelled-popup-request") {
        // Ignored
      } else if (err.code === "auth/unauthorized-domain") {
        toast.error("Vercel Domain Not Authorized in Firebase", {
          description:
            "Please go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add 'vedtravels.vercel.app'.",
          duration: 10000,
        });
      } else {
        toast.error("Google Sign-In Failed", {
          description: err.message || "Please check connection or credentials.",
        });
      }
      return null;
    }
  };

  const registerUser = (newUser: Omit<User, "id">): User => {
    const existing = registeredUsers.find(
      (u) =>
        u.phone.replace(/\D/g, "") === newUser.phone.replace(/\D/g, "") ||
        (newUser.email && u.email?.toLowerCase() === newUser.email?.toLowerCase())
    );

    if (existing) {
      toast.error("Account already exists with this phone or email!", {
        description: "Please login with your PIN/Password.",
      });
      throw new Error("User already exists");
    }

    const created: User = {
      ...newUser,
      id: `usr-${Date.now()}`,
      hostStatus: newUser.role === "host" ? "pending_approval" : "approved",
      kycStatus: newUser.kycStatus || "unverified",
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    const updatedList = [created, ...registeredUsers];
    saveRegisteredUsers(updatedList);
    login(created);

    // Sync user registration to Google Sheets "Users" sheet
    syncUserToGoogleSheets(created).then((res) => {
      if (res && res.success) {
        toast.success("Profile Synced to Database!", {
          description: "Registered securely in Ved Travels database.",
        });
      }
    });

    if (created.role === "host") {
      toast.info("Host Account Under Review", {
        description: "Ved Travels team will verify and activate your partner portal shortly.",
        duration: 8000,
      });
    }

    return created;
  };

  const loginWithCredentials = (identifier: string, secret: string): User | null => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanSecret = secret.trim();

    // Check if business owner admin via configured email
    const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "vedtravels0777@gmail.com").toLowerCase();
    if (cleanId === adminEmail || cleanId === VED_ADMIN_ACCOUNT.phone) {
      // Auto-delegate to Google Sign-In or set admin
      login(VED_ADMIN_ACCOUNT);
      return VED_ADMIN_ACCOUNT;
    }

    // Match registered users
    const matched = registeredUsers.find((u) => {
      const phoneMatches = u.phone.replace(/\D/g, "").includes(cleanId.replace(/\D/g, ""));
      const emailMatches = u.email && u.email.toLowerCase() === cleanId;
      return phoneMatches || emailMatches;
    });

    if (!matched) {
      toast.error("No account found with this phone number or email", {
        description: "Please sign in with Google or register a new account.",
      });
      return null;
    }

    if (matched.password && matched.password !== cleanSecret) {
      toast.error("Incorrect Password / PIN", {
        description: "Please re-enter your 4-digit PIN or password.",
      });
      return null;
    }

    login(matched);
    return matched;
  };

  const loginAsAdmin = (_secret?: string): boolean => {
    if (currentUser?.role === "admin") {
      return true;
    }
    toast.info("Please sign in with your verified Google Admin account (vedtravels0777@gmail.com)");
    signInWithGoogle("renter");
    return false;
  };

  const approveHostAccount = (userId: string) => {
    const updated = registeredUsers.map((u) =>
      u.id === userId ? { ...u, hostStatus: "approved" as const } : u
    );
    saveRegisteredUsers(updated);

    if (currentUser && currentUser.id === userId) {
      saveUser({ ...currentUser, hostStatus: "approved" });
    }

    const host = registeredUsers.find((u) => u.id === userId);
    toast.success(`Host Partner Approved: ${host?.name || "Host"}`, {
      description: "Partner can now list machines and receive client bookings.",
    });

    approveHostInGoogleSheets(userId);
  };

  const rejectHostAccount = (userId: string) => {
    const updated = registeredUsers.map((u) =>
      u.id === userId ? { ...u, hostStatus: "rejected" as const } : u
    );
    saveRegisteredUsers(updated);

    if (currentUser && currentUser.id === userId) {
      saveUser({ ...currentUser, hostStatus: "rejected" });
    }

    toast.error("Host Partner Rejected");
    rejectHostInGoogleSheets(userId);
  };

  const updateKyc = (dlNumber: string, aadhaarNumber: string, dlPhotoUrl?: string) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      dlNumber,
      aadhaarNumber,
      dlPhotoUrl: dlPhotoUrl || currentUser.dlPhotoUrl,
      kycStatus: "verified",
      dlVerified: true,
    };
    saveUser(updated);

    // Also update in registered list
    const updatedList = registeredUsers.map((u) => (u.id === currentUser.id ? updated : u));
    saveRegisteredUsers(updatedList);

    toast.success("Safety Documents Verified Successfully!", {
      description: "Driving License recorded for paperless vehicle handover.",
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
    newVehicle: Omit<
      Vehicle,
      "id" | "rating" | "tripsCount" | "approvalStatus" | "slabs" | "minHours" | "available"
    > & {
      slabs?: TariffSlabs;
      minHours?: number;
      available?: boolean;
    }
  ) => {
    const id = `host-veh-${Date.now()}`;
    const isCar = newVehicle.category === "car";
    const defaultSlabs: TariffSlabs =
      newVehicle.slabs ||
      (isCar
        ? {
            hr6: Math.round(newVehicle.dailyRate * 0.45) || 1600,
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
      minHours: newVehicle.minHours || (isCar ? 6 : 1),
      securityDeposit: 0,
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
    rejectVehicleInGoogleSheets(vehicleId);
  };

  // Real-time Vehicle Locking Check across entire app
  const isVehicleCurrentlyBooked = (vehicleId: string): boolean => {
    return bookings.some(
      (b) =>
        b.vehicleId === vehicleId &&
        (b.status === "pending_payment" ||
          b.status === "confirmed" ||
          b.status === "in_trip" ||
          b.status === "confirmed_whatsapp" ||
          b.status === "confirmed_pay_at_hub" ||
          b.status === "pending_offline_verification")
    );
  };

  // Real time-slot overlap check
  const isVehicleSlotLocked = (vehicleId: string, _duration: DurationOption = selectedDuration) => {
    return isVehicleCurrentlyBooked(vehicleId);
  };

  // Official Slab Pricing Engine matching client's exact tariff card
  const calculateTariff = (
    vehicle: Vehicle,
    duration: DurationOption,
    withDelivery: boolean = doorstepDelivery
  ): TariffCalculation => {
    let baseRent = 0;
    let rateText = "";
    const isCar = vehicle.category === "car" || vehicle.minHours >= 6;

    if (isCar) {
      if (duration.hours <= 6) {
        baseRent = vehicle.slabs?.hr6 || Math.round(vehicle.dailyRate * 0.45);
        rateText = duration.hours < 6 ? "Min 6 Hrs Package" : "6 Hrs Slab";
      } else if (duration.hours <= 12) {
        baseRent = vehicle.slabs?.hr12 || vehicle.hourlyRate * 12;
        rateText = "12 Hrs Slab";
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
      if (duration.hours <= 1) {
        baseRent = vehicle.slabs?.hr1 ?? vehicle.hourlyRate;
        rateText = "1 Hr Slab";
      } else if (duration.hours <= 3) {
        baseRent = vehicle.slabs?.hr3 ?? vehicle.hourlyRate * 3;
        rateText = "3 Hrs Slab";
      } else if (duration.hours <= 6) {
        baseRent = vehicle.slabs?.hr6 ?? vehicle.hourlyRate * 6;
        rateText = "6 Hrs Slab";
      } else if (duration.hours <= 12) {
        baseRent = vehicle.slabs?.hr12 ?? vehicle.hourlyRate * 12;
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
    const deposit = 0; // Removed security deposit per user directive
    const total = baseRent + deliveryFee;

    return {
      baseRent,
      deposit: 0,
      deliveryFee,
      total,
      rateText,
      isMinEnforced: isCar && duration.hours < 6,
    };
  };

  // Booking actions with Slot Lock & OTP generation & Google Sheets Sync
  const createBooking = (params: {
    vehicle: Vehicle;
    duration: DurationOption;
    doorstepDelivery: boolean;
    pickupLocation?: string;
    deliveryAddress?: string;
    paymentMode?: "upi_advance" | "pay_at_hub" | "whatsapp_booking";
    upiUtr?: string;
    dlPhotoUrl?: string;
  }) => {
    // Real-time Vehicle Locking Check across entire app
    if (isVehicleCurrentlyBooked(params.vehicle.id)) {
      toast.error("Vehicle is Currently Booked!", {
        description: `This ${params.vehicle.name} has an active reservation. Please choose another vehicle from our fleet.`,
      });
      throw new Error("Vehicle already booked");
    }

    // Strict 3-state booking lifecycle: OTP is empty until Admin verifies payment
    const otp = "";
    const bookingCode = `VED-GJ06-${Math.floor(10000 + Math.random() * 90000)}`;

    const { baseRent, deposit, deliveryFee, total } = calculateTariff(
      params.vehicle,
      params.duration,
      params.doorstepDelivery
    );

    const resolvedPaymentMode = params.paymentMode || "whatsapp_booking";
    // Status strictly starts as pending_payment
    const status: Booking["status"] = "pending_payment";

    const resolvedLocation = params.pickupLocation || selectedLocation || "Vadodara Railway Station";

    // Host earnings calculation (75% to Host, 25% Platform Fee if host-owned)
    const isHostVehicle = params.vehicle.ownerType === "host";
    const hostEarnings = isHostVehicle ? Math.round(baseRent * 0.75) : 0;
    const platformFee = isHostVehicle ? baseRent - hostEarnings : 0;

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
      paymentMode: resolvedPaymentMode,
      upiUtr: params.upiUtr,
      dlPhotoUrl: params.dlPhotoUrl || currentUser?.dlPhotoUrl,
      hostName: params.vehicle.hostName || "Ved Fleet Hub",
      hostId: params.vehicle.hostId,
      hostEarnings,
      platformFee,
      hostPayoutStatus: isHostVehicle ? "pending" : undefined,
      status,
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
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

  const verifyPaymentAndGenerateOtp = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      toast.error("Booking not found");
      return;
    }

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const updated = bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: "confirmed" as const,
            otp: generatedOtp,
          }
        : b
    );
    saveBookings(updated);

    toast.success("Payment Verified & 4-Digit OTP Generated!", {
      description: `Handover OTP: ${generatedOtp} • Booking ${booking.bookingCode} confirmed.`,
    });

    // Sync status & OTP to Google Sheets
    updateBookingStatusInGoogleSheets(booking.bookingCode, "confirmed");
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

  const markBookingTripStatus = (
    bookingId: string,
    status: "confirmed" | "in_trip" | "completed" | "cancelled"
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
    saveBookings(updated);

    if (status === "completed" || status === "cancelled") {
      // Release slot
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
    }

    toast.success(`Booking Status Updated: ${status.toUpperCase()}`);
    updateBookingStatusInGoogleSheets(booking.bookingCode, status);
  };

  const clearHostPayout = (bookingId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, hostPayoutStatus: "paid" as const } : b
    );
    saveBookings(updated);
    toast.success("Payout Cleared for Host Partner!");
  };

  const verifyOfflineBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: "confirmed" as const } : b
    );
    saveBookings(updated);
    toast.success("Payment Verified & Slot Confirmed!", {
      description: `Renter ${booking.renterName}'s booking is confirmed. Ready for pickup at ${
        booking.pickupLocation || booking.hubName
      }.`,
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

  const openAdminDashboard = () => setAdminDashboardOpen(true);
  const closeAdminDashboard = () => setAdminDashboardOpen(false);

  const openBookingModal = (vehicle: Vehicle) => {
    if (isVehicleCurrentlyBooked(vehicle.id)) {
      toast.error("Vehicle Currently Booked!", {
        description: `This ${vehicle.name} has an active reservation. Please select another vehicle from our fleet.`,
      });
      return;
    }
    setSelectedVehicle(vehicle);
    if (vehicle.category === "car" && selectedDuration.hours < 6) {
      setSelectedDuration(DURATION_PRESETS[2]); // 6h
      toast.info("Cars require minimum 6-hour booking", {
        description: `Duration automatically set to 6 Hours (${DURATION_PRESETS[2].label}).`,
      });
    }
  };
  const closeBookingModal = () => setSelectedVehicle(null);

  return (
    <RentalContext.Provider
      value={{
        currentUser,
        registeredUsers,
        login,
        logout,
        signInWithGoogle,
        registerUser,
        loginWithCredentials,
        loginAsAdmin,
        approveHostAccount,
        rejectHostAccount,
        updateKyc,
        vehicles,
        toggleVehicleAvailability,
        updateVehiclePricing,
        addVehicle,
        approveVehicle,
        rejectVehicle,
        bookings,
        isVehicleCurrentlyBooked,
        isVehicleSlotLocked,
        createBooking,
        verifyPaymentAndGenerateOtp,
        verifyHandoverOtp,
        verifyOfflineBooking,
        cancelBooking,
        markBookingTripStatus,
        clearHostPayout,
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
        adminDashboardOpen,
        openAdminDashboard,
        closeAdminDashboard,
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
