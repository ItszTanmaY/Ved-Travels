export interface TariffSlabs {
  hr1?: number;
  hr3?: number;
  hr6?: number;
  hr12: number;
  hr24: number;
}

export interface Vehicle {
  id: string;
  name: string;
  category: "bike" | "car";
  brand: string;
  plate: string;
  transmission: "Manual" | "Automatic";
  fuel: "Petrol" | "Diesel" | "EV";
  seats: number;
  mileage: string;
  hourlyRate: number;
  dailyRate: number;
  slabs: TariffSlabs;
  minHours: number; // 1 for two-wheelers, 6 for cars
  securityDeposit: number;
  rating: number;
  tripsCount: number;
  ownerType: "fleet" | "host";
  hostId?: string;
  hostName: string;
  available: boolean;
  approvalStatus: "approved" | "pending_approval" | "rejected";
  images: string[];
  features: string[];
  bookedSlots?: Array<{ start: string; end: string; bookingId: string }>;
}

export interface Booking {
  id: string;
  bookingCode: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  vehicleCategory: "bike" | "car";
  vehicleImage: string;
  renterId: string;
  renterName: string;
  renterPhone: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  durationLabel: string;
  baseRent: number;
  doorstepDelivery: boolean;
  deliveryAddress?: string;
  pickupLocation: string; // One of the 6 Vadodara service points
  deliveryFee: number;
  securityDeposit: number;
  totalAmount: number;
  otp: string; // 4-digit handover OTP
  paymentMode: "upi_advance" | "pay_at_hub" | "whatsapp_booking";
  upiUtr?: string;
  status:
    | "pending_payment"
    | "pending_offline_verification"
    | "confirmed_pay_at_hub"
    | "confirmed_whatsapp"
    | "confirmed"
    | "in_trip"
    | "completed"
    | "cancelled";
  createdAt: string;
  hubName: string;
  hubAddress: string;
  syncedToGoogleSheets?: boolean;
  dlPhotoUrl?: string;
  hostName?: string;
  hostId?: string;
  hostPayoutStatus?: "pending" | "paid";
  hostEarnings?: number;
  platformFee?: number;
}

export const VED_BUSINESS_CONFIG = {
  name: "Ved Travels",
  owner: "Shantanu Shekhar",
  phone: "+91 95468 83777",
  rawPhone: "9546883777",
  whatsappNumber: process.env.NEXT_PUBLIC_VED_WHATSAPP_NUMBER || "919546883777",
  email: "vedtravels0777@gmail.com",
  availabilityBadge: "24×7 Available",
  upiId: process.env.NEXT_PUBLIC_VED_UPI_ID || "9546883777@upi",
  accountName: process.env.NEXT_PUBLIC_VED_UPI_NAME || "Ved Travels Vadodara",
  tagline: "Vadodara's Premier Self-Drive Fleet & Host Marketplace",
};

export const VED_UPI_CONFIG = {
  upiId: VED_BUSINESS_CONFIG.upiId,
  accountName: VED_BUSINESS_CONFIG.accountName,
  phone: VED_BUSINESS_CONFIG.phone,
  whatsappNumber: VED_BUSINESS_CONFIG.whatsappNumber,
  email: VED_BUSINESS_CONFIG.email,
  bankName: "Sayajigunj Central Branch",
  hubLocation: "Opp. Vadodara Junction Platform 1 & RC Dutt Road",
};

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  role: "renter" | "host" | "admin";
  avatar?: string;
  hostStatus?: "approved" | "pending_approval" | "rejected";
  kycStatus: "unverified" | "pending" | "verified";
  dlNumber?: string;
  aadhaarNumber?: string;
  dlPhotoUrl?: string;
  dlVerified?: boolean;
  createdAt?: string;
}

// Exact 6 Vadodara Service Points
export const VADODARA_LOCATIONS = [
  {
    id: "ajwa-road",
    name: "Ajwa Road",
    landmark: "Near Ajwa Cross Road, Vadodara",
    badge: "24×7 Hub Point",
  },
  {
    id: "waghodia-road",
    name: "Waghodia Road",
    landmark: "Near Express Highway Corridor, Vadodara",
    badge: "Active Delivery Zone",
  },
  {
    id: "sumandeep",
    name: "Sumandeep Vidyapith",
    landmark: "Piparia, Campus Gate & Medical Circle, Vadodara",
    badge: "Campus Special",
  },
  {
    id: "parul-univ",
    name: "Parul University",
    landmark: "Limda, Main Campus Gate, Vadodara",
    badge: "Student Hub",
  },
  {
    id: "railway-station",
    name: "Vadodara Railway Station",
    landmark: "Platform 1 / Station Circle & Sayajigunj, Vadodara",
    badge: "Central Bay 04",
  },
  {
    id: "airport",
    name: "Vadodara Airport",
    landmark: "Civil Aerodrome Harni, Arrival Terminal Bay, Vadodara",
    badge: "Terminal Meet & Greet",
  },
] as const;

export type VadodaraLocationName = (typeof VADODARA_LOCATIONS)[number]["name"];

export const VADODARA_CENTRAL_HUB = {
  name: "Vadodara Railway Station Hub",
  address: "Station Circle Bay 04, Opp. Vadodara Junction (Platform 1) & RC Dutt Road, Vadodara, Gujarat 390005",
  landmark: "Near Kadak Bazaar & Express Tower Circle",
  timings: "24 Hours / 7 Days Active",
  helpline: "+91 95468 83777",
  email: "vedtravels0777@gmail.com",
  ownerName: "Shantanu Shekhar",
  googleMapsUrl: "https://maps.google.com/?q=Vadodara+Railway+Station+Sayajigunj",
  deliveryCharge: 199,
};

// Exact 10 Real Vehicles with Official Tariff Slabs
export const INITIAL_VEHICLES: Vehicle[] = [
  // -------------------------------------------------------------
  // A. BIKES & SCOOTERS (Slabs: 1h, 3h, 6h, 12h, 24h)
  // -------------------------------------------------------------
  {
    id: "honda-activa",
    name: "Honda Activa",
    category: "bike",
    brand: "Honda",
    plate: "GJ-06-MR-7104",
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 2,
    mileage: "52 km/l",
    hourlyRate: 100,
    dailyRate: 1650,
    slabs: {
      hr1: 100,
      hr3: 260,
      hr6: 560,
      hr12: 1050,
      hr24: 1650,
    },
    minHours: 1,
    securityDeposit: 0,
    rating: 4.9,
    tripsCount: 148,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/Activa.jpeg"],
    features: ["2 ISI Helmets Included", "Mobile Phone Mount", "Tubeless Tyres", "Silent Start ACG"],
  },
  {
    id: "yamaha-r15",
    name: "Yamaha R15",
    category: "bike",
    brand: "Yamaha",
    plate: "GJ-06-YR-1502",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 2,
    mileage: "45 km/l",
    hourlyRate: 160,
    dailyRate: 2500,
    slabs: {
      hr1: 160,
      hr3: 460,
      hr6: 800,
      hr12: 1650,
      hr24: 2500,
    },
    minHours: 1,
    securityDeposit: 0,
    rating: 4.95,
    tripsCount: 88,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/R15.jpeg"],
    features: ["VVA Engine", "Dual-Channel ABS", "2 Helmets Included", "Assist & Slipper Clutch"],
  },
  {
    id: "classic-350",
    name: "Royal Enfield Classic 350",
    category: "bike",
    brand: "Royal Enfield",
    plate: "GJ-06-EC-3500",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 2,
    mileage: "36 km/l",
    hourlyRate: 350,
    dailyRate: 3899,
    slabs: {
      hr1: 350,
      hr3: 600,
      hr6: 1699,
      hr12: 2699,
      hr24: 3899,
    },
    minHours: 1,
    securityDeposit: 0,
    rating: 4.96,
    tripsCount: 114,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/RoyalEnfieldClassic350.jpeg"],
    features: ["J-Series Engine", "Dual Disc Brakes", "2 Helmets Included", "Highway Touring Ready"],
  },

  // -------------------------------------------------------------
  // B. SELF-DRIVE CARS (Min 6 Hrs — Slabs: 6h, 12h, 24h)
  // -------------------------------------------------------------
  {
    id: "maruti-swift",
    name: "Maruti Swift",
    category: "car",
    brand: "Maruti Suzuki",
    plate: "GJ-06-SW-4182",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 5,
    mileage: "22 km/l",
    hourlyRate: 208,
    dailyRate: 3500,
    slabs: {
      hr6: 1600,
      hr12: 2500,
      hr24: 3500,
    },
    minHours: 6,
    securityDeposit: 0,
    rating: 4.9,
    tripsCount: 165,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/swift.jpeg"],
    features: ["Chilled AC", "Touchscreen Audio", "Fastag Enabled", "Dual Airbags"],
  },
  {
    id: "maruti-ciaz",
    name: "Maruti Ciaz",
    category: "car",
    brand: "Maruti Suzuki",
    plate: "GJ-06-CZ-8820",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 5,
    mileage: "20.5 km/l",
    hourlyRate: 208,
    dailyRate: 3500,
    slabs: {
      hr6: 1600,
      hr12: 2500,
      hr24: 3500,
    },
    minHours: 6,
    securityDeposit: 0,
    rating: 4.93,
    tripsCount: 78,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/ciaz.jpeg"],
    features: ["Executive Sedan Legroom", "SmartPlay Screen", "Fastag Enabled", "Cruise Control"],
  },
  {
    id: "honda-city",
    name: "Honda City",
    category: "car",
    brand: "Honda",
    plate: "GJ-06-HC-5501",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 5,
    mileage: "18.5 km/l",
    hourlyRate: 208,
    dailyRate: 3500,
    slabs: {
      hr6: 1600,
      hr12: 2500,
      hr24: 3500,
    },
    minHours: 6,
    securityDeposit: 0,
    rating: 4.97,
    tripsCount: 92,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/hondacity.jpeg"],
    features: ["i-VTEC Engine", "Electric Sunroof", "LaneWatch Camera", "Fastag Enabled"],
  },
  {
    id: "maruti-ertiga",
    name: "Maruti Ertiga",
    category: "car",
    brand: "Maruti Suzuki",
    plate: "GJ-06-ER-7070",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 7,
    mileage: "20 km/l",
    hourlyRate: 250,
    dailyRate: 4000,
    slabs: {
      hr6: 2000,
      hr12: 3000,
      hr24: 4000,
    },
    minHours: 6,
    securityDeposit: 0,
    rating: 4.92,
    tripsCount: 130,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/ertiga.jpeg"],
    features: ["7-Seater Family MUV", "Roof AC Vents", "Flexible Boot Space", "Fastag Enabled"],
  },
  {
    id: "kia-seltos",
    name: "Kia",
    category: "car",
    brand: "Kia",
    plate: "GJ-06-KA-4411",
    transmission: "Automatic",
    fuel: "Diesel",
    seats: 5,
    mileage: "18 km/l",
    hourlyRate: 291,
    dailyRate: 4500,
    slabs: {
      hr6: 2300,
      hr12: 3500,
      hr24: 4500,
    },
    minHours: 6,
    securityDeposit: 0,
    rating: 4.95,
    tripsCount: 82,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/kia.jpeg"],
    features: ["Automatic Transmission", "Bose Premium Audio", "Ventilated Seats", "Fastag Enabled"],
  },
  {
    id: "thar-roxx",
    name: "Mahindra Thar Roxx",
    category: "car",
    brand: "Mahindra",
    plate: "GJ-06-RX-0007",
    transmission: "Automatic",
    fuel: "Diesel",
    seats: 5,
    mileage: "15 km/l",
    hourlyRate: 375,
    dailyRate: 8000,
    slabs: {
      hr6: 3000,
      hr12: 4500,
      hr24: 8000,
    },
    minHours: 6,
    securityDeposit: 0,
    rating: 4.99,
    tripsCount: 64,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/TharRoxx.jpeg"],
    features: ["5-Door Premium 4x4", "Panoramic Sunroof", "mHawk Turbo Diesel", "Level 2 ADAS Ready"],
  },
  {
    id: "thar-4x4",
    name: "Mahindra Thar 4×4",
    category: "car",
    brand: "Mahindra",
    plate: "GJ-06-TH-0044",
    transmission: "Manual",
    fuel: "Diesel",
    seats: 4,
    mileage: "14 km/l",
    hourlyRate: 375,
    dailyRate: 8000,
    slabs: {
      hr6: 3000,
      hr12: 4500,
      hr24: 8000,
    },
    minHours: 6,
    securityDeposit: 0,
    rating: 4.98,
    tripsCount: 115,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: ["/images/Thar4x4.jpeg"],
    features: ["Mechanical Locking Diff", "Shift-on-the-fly 4x4", "Hard Top", "Statue of Unity Ready"],
  },
];

export const VED_ADMIN_ACCOUNT: User = {
  id: "admin-shantanu-0777",
  name: "Shantanu Shekhar",
  phone: "9546883777",
  email: "vedtravels0777@gmail.com",
  role: "admin",
  kycStatus: "verified",
  dlVerified: true,
};

