"use client";

import { useState } from "react";
import { useRental } from "@/context/RentalContext";
import {
  X,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { VED_BUSINESS_CONFIG } from "@/data/fleet";

export default function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    authModalDefaultRole,
    registerUser,
    loginWithCredentials,
    loginAsAdmin,
  } = useRental();

  const [mode, setMode] = useState<"login" | "register" | "admin">("login");
  const [role, setRole] = useState<"renter" | "host">(
    authModalDefaultRole === "host" ? "host" : "renter"
  );

  // Form fields
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  // OTP Login fallback state
  const [otpLoginMode, setOtpLoginMode] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");

  if (!authModalOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!password || password.length < 4) {
      toast.error("Please set a password / PIN with at least 4 digits");
      return;
    }

    try {
      registerUser({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || `${cleanPhone}@vedtravels.in`,
        password: password.trim(),
        role: role,
        kycStatus: "unverified",
      });
      // Reset form
      setName("");
      setPhoneNumber("");
      setEmail("");
      setPassword("");
    } catch {
      // error handled in context
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (!cleanPhone && !email) {
      toast.error("Please enter your mobile number or email");
      return;
    }

    if (otpLoginMode) {
      // OTP Verification mode
      if (!enteredOtp || enteredOtp.length !== 4) {
        toast.error("Please enter the 4-digit verification code");
        return;
      }
      if (enteredOtp !== generatedOtp) {
        toast.error("Invalid verification code. Please check SMS code.");
        return;
      }

      // Check if user exists or log them in with mobile
      const user = loginWithCredentials(cleanPhone || email, enteredOtp);
      if (!user) {
        // If not registered yet, auto register as renter
        registerUser({
          name: name.trim() || "Vadodara Traveler",
          phone: cleanPhone || "9546883777",
          email: email.trim() || `${cleanPhone}@vedtravels.in`,
          password: enteredOtp,
          role: "renter",
          kycStatus: "unverified",
        });
      }
      return;
    }

    // Standard Password / PIN login
    if (!password) {
      toast.error("Please enter your password or 4-digit PIN");
      return;
    }

    loginWithCredentials(cleanPhone || email, password);
  };

  const handleSendLoginOtp = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter your 10-digit mobile number first");
      return;
    }

    // Generate real mathematical 4-digit OTP
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);
    setOtpLoginMode(true);

    toast.info(`Verification code sent to +91 ${cleanPhone}`, {
      description: `Security OTP: ${randomOtp}`,
      duration: 10000,
    });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAsAdmin(adminPin);
    if (success) {
      setAdminPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 shadow-2xl p-5 sm:p-7 overflow-y-auto max-h-[94dvh] sm:max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95 z-30 shadow-xs"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Mode Selector (Login vs Register vs Admin) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setOtpLoginMode(false);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setOtpLoginMode(false);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
              mode === "admin"
                ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* VIEW 1: ADMIN LOGIN (FOR SHANTANU SHEKHAR) */}
        {mode === "admin" && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-2">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Ved Travels Fleet Operations</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Master Admin Portal
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Authorized access for Shantanu Shekhar ({VED_BUSINESS_CONFIG.email})
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <span className="font-bold block">Protected Operations Console:</span>
              <p className="text-[11px] text-emerald-700">
                Approves Host accounts, approves new vehicles before going live, monitors ongoing trips, and verifies handover OTPs.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter Master Admin PIN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter 4-digit Admin PIN"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full h-12 px-3.5 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1 text-center">
                Master passcode: <strong className="text-slate-600 font-mono">0777</strong>
              </span>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>
        )}

        {/* VIEW 2: REGISTER ACCOUNT */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Create Ved Travels Account
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Join Vadodara&apos;s premier self-drive community.
              </p>
            </div>

            {/* Role Switcher */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("renter")}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    role === "renter"
                      ? "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 text-emerald-950"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Rent Vehicles</span>
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Self-drive bikes & cars
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("host")}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    role === "host"
                      ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500 text-amber-950"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Host Partner</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    List & earn up to ₹75K/mo
                  </span>
                </button>
              </div>

              {role === "host" && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-normal">
                  <strong>Notice:</strong> Host Partner accounts start in <code className="font-bold text-amber-800">pending_approval</code> status until verified by our Vadodara operations desk.
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Parth Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                10-Digit Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="98250 XXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-11 pl-12 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. parth@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Create Password or 4-Digit PIN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="e.g. 4-digit PIN or password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer mt-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-500 pt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* VIEW 3: SIGN IN */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Welcome Back
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Sign in to view your bookings, 4-digit handover OTP, or host earnings.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile Number or Email
              </label>
              <input
                type="text"
                required
                placeholder="10-digit mobile or email address"
                value={phoneNumber || email}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes("@")) {
                    setEmail(val);
                    setPhoneNumber("");
                  } else {
                    setPhoneNumber(val);
                    setEmail("");
                  }
                }}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {!otpLoginMode ? (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Password / PIN
                  </label>
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Login via Mobile OTP
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password or PIN"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  4-Digit OTP sent to your mobile. Enter below to sign in:
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Enter 4-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full h-12 text-center text-xl font-mono font-bold tracking-widest bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden text-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setOtpLoginMode(false)}
                  className="text-xs text-slate-500 hover:underline cursor-pointer block"
                >
                  ← Back to Password / PIN login
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>{otpLoginMode ? "Verify & Sign In" : "Sign In to Account"}</span>
              <CheckCircle className="w-4 h-4 text-white" />
            </button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-500">
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Register Now
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
