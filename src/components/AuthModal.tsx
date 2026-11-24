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
  Phone,
  RefreshCw,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { VED_BUSINESS_CONFIG } from "@/data/fleet";

export default function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    authModalDefaultRole,
    signInWithGoogle,
    registerUser,
    loginWithCredentials,
  } = useRental();

  const [role, setRole] = useState<"renter" | "host">(
    authModalDefaultRole === "host" ? "host" : "renter"
  );
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Optional Phone Login alternative
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");

  if (!authModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle(role);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);
    setOtpSent(true);

    toast.info(`Verification code sent to +91 ${cleanPhone}`, {
      description: `Security OTP: ${randomOtp}`,
      duration: 10000,
    });
  };

  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.length !== 4) {
      toast.error("Please enter the 4-digit verification code");
      return;
    }
    if (enteredOtp !== generatedOtp) {
      toast.error("Invalid verification code. Please check your SMS code.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const user = loginWithCredentials(cleanPhone, enteredOtp);
    if (!user) {
      registerUser({
        name: name.trim() || (role === "host" ? "Host Partner" : "Vadodara Traveler"),
        phone: cleanPhone,
        email: `${cleanPhone}@vedtravels.in`,
        role: role,
        kycStatus: "unverified",
      });
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

        {/* Modal Header */}
        <div className="mb-5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Access • Ved Travels Vadodara</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to Ved Travels
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Vadodara&apos;s premier self-drive fleet & verified host marketplace.
          </p>
        </div>

        {/* Role Selector: Renter vs Host Partner */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Select Your Account Type:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRole("renter")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                role === "renter"
                  ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-950 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold">Renter</span>
                <UserIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[10px] text-slate-500 leading-snug">
                Self-drive bikes & cars in Vadodara
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("host")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                role === "host"
                  ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/30 text-amber-950 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold">Host Partner</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-[10px] text-slate-500 leading-snug">
                List machine & earn up to ₹75K/mo
              </span>
            </button>
          </div>

          {role === "host" && (
            <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-normal">
              <strong>Host Notice:</strong> All host accounts and vehicles undergo verification by our Vadodara operations desk before going live.
            </div>
          )}
        </div>

        {/* PRIMARY AUTH METHOD: 1-CLICK GOOGLE SIGN-IN */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full h-13 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                <span>Signing in with Google...</span>
              </>
            ) : (
              <>
                {/* Official Google SVG Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-500 leading-relaxed px-2">
            Secure, encrypted authentication powered by Firebase Google Sign-In. Zero passwords required.
          </p>
        </div>

        {/* Divider for optional phone login */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-semibold text-[10px] tracking-wider">
              Or sign in with mobile
            </span>
          </div>
        </div>

        {/* Optional Mobile Phone Verification */}
        {!showPhoneLogin ? (
          <button
            type="button"
            onClick={() => setShowPhoneLogin(true)}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>Use Mobile Number Instead</span>
          </button>
        ) : (
          <div className="space-y-3 pt-1">
            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
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

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Send 4-Digit Security Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  4-Digit security code sent to +91 {phoneNumber}. Enter below:
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Enter 4-Digit Code
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
                  type="submit"
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Verify & Sign In</span>
                  <CheckCircle className="w-4 h-4 text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs text-slate-500 hover:underline cursor-pointer block text-center"
                >
                  ← Change Mobile Number
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
