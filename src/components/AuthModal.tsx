"use client";

import { useState } from "react";
import { useRental } from "@/context/RentalContext";
import {
  X,
  User,
  Sparkles,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    authModalDefaultRole,
    login,
    loginAsDemoRenter,
    loginAsDemoHost,
    loginAsDemoAdmin,
  } = useRental();

  const [activeTab, setActiveTab] = useState<"renter" | "host" | "admin">(
    authModalDefaultRole || "renter"
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");

  if (!authModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setOtpSent(true);
    toast.info("Demo OTP Sent!", {
      description: "Use OTP: 1234 to log in.",
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp !== "1234" && enteredOtp.length !== 4) {
      toast.error("Please enter the 4-digit OTP (hint: 1234)");
      return;
    }

    login({
      id: `user-${Date.now()}`,
      name:
        name ||
        (activeTab === "admin"
          ? "Shantanu Shekhar (Admin)"
          : activeTab === "host"
          ? "Vadodara Host Partner"
          : "Vadodara Traveler"),
      phone: phoneNumber,
      email: `${phoneNumber}@vedtravels.in`,
      role: activeTab,
      kycStatus: "verified",
      dlNumber: "GJ06 20210084920",
      aadhaarNumber: "XXXX XXXX 1928",
      dlVerified: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 shadow-2xl p-5 sm:p-8 overflow-y-auto max-h-[92dvh] sm:max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95 z-30 shadow-xs"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Role Toggle Switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("renter");
              setOtpSent(false);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "renter"
                ? "bg-white text-emerald-950 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Renter Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("host");
              setOtpSent(false);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "host"
                ? "bg-white text-emerald-950 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Host Partner Login
          </button>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            {activeTab === "host"
              ? "Host Partner Portal"
              : activeTab === "admin"
              ? "Ved Travels Fleet Desk"
              : "Login to Ved Travels"}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {activeTab === "host"
              ? "Manage your listed bikes & cars and view weekly earnings."
              : activeTab === "admin"
              ? "Verify host vehicle submissions and fleet availability."
              : "Access your bookings, 4-digit handover OTP, and trip receipts."}
          </p>
        </div>

        {/* Phone / OTP Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                  placeholder="95468 XXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-11 pl-12 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>Send OTP Verification</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
              OTP sent to +91 {phoneNumber}. (Enter verification code <strong className="text-emerald-700 font-mono font-bold">1234</strong>)
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter 4-Digit OTP
              </label>
              <input
                type="text"
                maxLength={4}
                required
                placeholder="1234"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                className="w-full h-12 text-center text-xl font-mono font-bold tracking-widest bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>Verify & Continue</span>
              <CheckCircle className="w-4 h-4 text-white" />
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Change mobile number
            </button>
          </form>
        )}

        {/* Subtle Developer / Testing Quick Login Drawer */}
        <details className="mt-6 pt-4 border-t border-slate-100 text-xs">
          <summary className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer select-none">
            Quick 1-Click Demo Accounts (Optional)
          </summary>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              type="button"
              onClick={loginAsDemoRenter}
              className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Renter Demo</span>
            </button>
            <button
              type="button"
              onClick={loginAsDemoHost}
              className="py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Host Demo</span>
            </button>
            <button
              type="button"
              onClick={loginAsDemoAdmin}
              className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Demo</span>
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}
