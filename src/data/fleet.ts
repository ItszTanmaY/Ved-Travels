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
  deliveryFee: number;
  securityDeposit: number;
  totalAmount: number;
  otp: string; // 4-digit handover OTP
  paymentMode: "upi_advance" | "pay_at_hub";
  upiUtr?: string;
  status:
    | "pending_offline_verification"
    | "confirmed_pay_at_hub"
    | "confirmed"
    | "in_trip"
    | "completed"
    | "cancelled";
  createdAt: string;
  hubName: string;
  hubAddress: string;
  syncedToGoogleSheets?: boolean;
}

export const VED_UPI_CONFIG = {
  upiId: process.env.NEXT_PUBLIC_VED_UPI_ID || "9546883777@upi",
  accountName: process.env.NEXT_PUBLIC_VED_UPI_NAME || "Ved Travels Vadodara",
  phone: "+91 95468 83777",
  whatsappNumber: process.env.NEXT_PUBLIC_VED_WHATSAPP_NUMBER || "919546883777",
  bankName: "Sayajigunj Central Branch",
  hubLocation: "Opp. Vadodara Junction Platform 1 & RC Dutt Road",
};

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "renter" | "host" | "admin";
  avatar?: string;
  kycStatus: "unverified" | "pending" | "verified";
  dlNumber?: string;
  aadhaarNumber?: string;
  dlVerified?: boolean;
}

export const VADODARA_CENTRAL_HUB = {
  name: "Vadodara Main Hub (Sayajigunj / Alkapuri Central)",
  address: "Station Circle Bay 04, Opp. Vadodara Junction (Platform 1) & RC Dutt Road, Vadodara, Gujarat 390005",
  landmark: "Near Kadak Bazaar & Express Tower Circle",
  timings: "24 Hours / 7 Days Active",
  helpline: "+91 95468 83777",
  googleMapsUrl: "https://maps.google.com/?q=Vadodara+Railway+Station+Sayajigunj",
  deliveryCharge: 199,
};

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "activa-6g",
    name: "Honda Activa 6G Deluxe",
    category: "bike",
    brand: "Honda",
    plate: "GJ-06-MR-7104",
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 2,
    mileage: "52 km/l",
    hourlyRate: 49,
    dailyRate: 449,
    securityDeposit: 999,
    rating: 4.9,
    tripsCount: 148,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: [
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["2 ISI Helmets Included", "Mobile Phone Holder", "Silent Start ACG", "Zero Paperwork"],
  },
  {
    id: "classic-350",
    name: "Royal Enfield Classic 350 Reborn",
    category: "bike",
    brand: "Royal Enfield",
    plate: "GJ-06-EC-3500",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 2,
    mileage: "36 km/l",
    hourlyRate: 119,
    dailyRate: 1299,
    securityDeposit: 1500,
    rating: 4.95,
    tripsCount: 92,
    ownerType: "host",
    hostId: "demo-host-1",
    hostName: "Keval Pandya (Superhost)",
    available: true,
    approvalStatus: "approved",
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["2 Helmets Included", "Dual-Channel ABS", "USB Fast Charger", "All Gujarat Permit"],
  },
  {
    id: "hunter-350",
    name: "Royal Enfield Hunter 350 Dapper",
    category: "bike",
    brand: "Royal Enfield",
    plate: "GJ-06-NN-2849",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 2,
    mileage: "36 km/l",
    hourlyRate: 99,
    dailyRate: 1149,
    securityDeposit: 1500,
    rating: 4.92,
    tripsCount: 76,
    ownerType: "host",
    hostId: "demo-host-1",
    hostName: "Keval Pandya (Superhost)",
    available: true,
    approvalStatus: "approved",
    images: [
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["2 Helmets Included", "Dual Disc Brakes", "Lightweight Agile Chassis", "Clean Sanitized"],
  },
  {
    id: "ntorq-125",
    name: "TVS Ntorq 125 Race Edition",
    category: "bike",
    brand: "TVS",
    plate: "GJ-06-TQ-1250",
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 2,
    mileage: "47 km/l",
    hourlyRate: 59,
    dailyRate: 549,
    securityDeposit: 999,
    rating: 4.88,
    tripsCount: 64,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["Bluetooth Turn-by-Turn GPS", "2 ISI Helmets", "High Pick-up", "Full Tank Option"],
  },
  {
    id: "swift-vxi",
    name: "Maruti Suzuki Swift VXi DualJet",
    category: "car",
    brand: "Maruti Suzuki",
    plate: "GJ-06-FB-4182",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 5,
    mileage: "22.5 km/l",
    hourlyRate: 119,
    dailyRate: 1699,
    securityDeposit: 2500,
    rating: 4.9,
    tripsCount: 165,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["Chilled AC", "Touchscreen Audio", "Fastag Enabled", "Unlimited KMs Option"],
  },
  {
    id: "creta-sx",
    name: "Hyundai Creta SX Executive",
    category: "car",
    brand: "Hyundai",
    plate: "GJ-06-TC-9045",
    transmission: "Automatic",
    fuel: "Diesel",
    seats: 5,
    mileage: "18.5 km/l",
    hourlyRate: 199,
    dailyRate: 2799,
    securityDeposit: 3500,
    rating: 4.97,
    tripsCount: 84,
    ownerType: "host",
    hostId: "demo-host-1",
    hostName: "Keval Pandya (Superhost)",
    available: true,
    approvalStatus: "approved",
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["Panoramic Sunroof", "Wireless Apple CarPlay", "Fastag Auto-Debit", "Cruise Control"],
  },
  {
    id: "nexon-dark",
    name: "Tata Nexon Dark Edition",
    category: "car",
    brand: "Tata",
    plate: "GJ-06-NX-8821",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 5,
    mileage: "17.5 km/l",
    hourlyRate: 179,
    dailyRate: 2499,
    securityDeposit: 3000,
    rating: 4.94,
    tripsCount: 58,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["5-Star NCAP Safety", "Harman Sound System", "Fastag Enabled", "Rear Parking Camera"],
  },
  {
    id: "thar-4x4",
    name: "Mahindra Thar 4x4 Hard Top",
    category: "car",
    brand: "Mahindra",
    plate: "GJ-06-TH-0044",
    transmission: "Automatic",
    fuel: "Diesel",
    seats: 4,
    mileage: "14 km/l",
    hourlyRate: 249,
    dailyRate: 3699,
    securityDeposit: 5000,
    rating: 4.99,
    tripsCount: 112,
    ownerType: "fleet",
    hostName: "Ved Fleet Hub",
    available: true,
    approvalStatus: "approved",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80",
    ],
    features: ["4x4 Low & High Range", "Convertible Hardtop", "Hill Descent Control", "Statue of Unity Ready"],
  },
];

export const DEMO_RENTER: User = {
  id: "demo-renter-1",
  name: "Amit Dave",
  phone: "9825123456",
  email: "amit.dave@vedtravels.in",
  role: "renter",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  kycStatus: "verified",
  dlNumber: "GJ06 20190048192",
  aadhaarNumber: "XXXX XXXX 8291",
  dlVerified: true,
};

export const DEMO_HOST: User = {
  id: "demo-host-1",
  name: "Keval Pandya",
  phone: "9825987654",
  email: "keval.host@vedtravels.in",
  role: "host",
  avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
  kycStatus: "verified",
  dlNumber: "GJ06 20150012481",
  aadhaarNumber: "XXXX XXXX 5510",
  dlVerified: true,
};

export const DEMO_ADMIN: User = {
  id: "demo-admin-1",
  name: "Vedraj Patel (Fleet Admin)",
  phone: "9546883777",
  email: "admin@vedtravels.in",
  role: "admin",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  kycStatus: "verified",
  dlNumber: "GJ06 20120000101",
  aadhaarNumber: "XXXX XXXX 1001",
  dlVerified: true,
};
