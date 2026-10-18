"use client";

import React, { useState } from "react";
import { Copy, Check, QrCode, Smartphone, ShieldCheck, ExternalLink } from "lucide-react";
import { VED_UPI_CONFIG } from "@/data/fleet";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";

interface UpiPaymentBoxProps {
  amount: number;
  utrValue: string;
  onUtrChange: (value: string) => void;
  bookingCode?: string;
}

export function UpiPaymentBox({
  amount,
  utrValue,
  onUtrChange,
  bookingCode,
}: UpiPaymentBoxProps) {
  const [copied, setCopied] = useState(false);

  const upiId = VED_UPI_CONFIG.upiId;
  const payeeName = VED_UPI_CONFIG.accountName;

  // Standard UPI URI format supported by all Indian UPI apps (PhonePe, GPay, Paytm, BHIM)
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(
    `Ved Travels Booking ${bookingCode || "GJ06"}`
  )}`;

  // Real scannable dynamic QR code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUri
  )}&margin=10`;

  const copyUpiId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      toast.success("UPI ID Copied to Clipboard!", {
        description: `${upiId} (Paste into PhonePe / GPay / Paytm)`,
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Pay Advance via UPI (Zero Gateway Charges)
            </h4>
            <p className="text-[11px] text-slate-500">
              Scan with PhonePe, Google Pay, Paytm, or BHIM
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
          DIRECT UPI
        </span>
      </div>

      {/* QR Code and Instructions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Dynamic Scannable QR Code */}
        <div className="sm:col-span-5 flex flex-col items-center">
          <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-center relative group">
            <img
              src={qrCodeUrl}
              alt="Ved Travels UPI QR Code"
              className="w-36 h-36 object-contain rounded-xl"
              loading="lazy"
            />
            <div className="mt-1 text-[10px] font-bold text-slate-700">
              Scan & Pay: <strong className="text-emerald-700">{formatINR(amount)}</strong>
            </div>
          </div>
          <span className="text-[9px] text-slate-400 mt-1">
            Works with any UPI App
          </span>
        </div>

        {/* UPI ID Details & Copy Button */}
        <div className="sm:col-span-7 space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Ved Travels Official UPI ID:
            </label>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-9 px-3 bg-white border border-slate-300 rounded-xl flex items-center text-xs font-mono font-bold text-slate-900 select-all">
                {upiId}
              </div>
              <button
                type="button"
                onClick={copyUpiId}
                className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              Payee: <strong className="font-bold">{payeeName}</strong>
              <div className="text-[10px] text-emerald-800">
                100% Secure • Bank: {VED_UPI_CONFIG.bankName}
              </div>
            </div>
          </div>

          {/* Quick Pay deep link for mobile users */}
          <a
            href={upiUri}
            className="sm:hidden w-full h-9 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Open in UPI App on Phone</span>
            <ExternalLink className="w-3 h-3 text-white/70" />
          </a>
        </div>
      </div>

      {/* 12-Digit UTR Input */}
      <div className="pt-2 border-t border-slate-200 space-y-1.5">
        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>Enter 12-Digit UPI Transaction / UTR Number:</span>
          <span className="text-[10px] font-normal text-slate-500">
            (Shown in payment success screen)
          </span>
        </label>
        <input
          type="text"
          maxLength={12}
          placeholder="e.g. 4289XXXXXXXX"
          value={utrValue}
          onChange={(e) => onUtrChange(e.target.value.replace(/[^0-9A-Za-z]/g, ""))}
          className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold tracking-widest text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
        />
        <p className="text-[10px] text-slate-500">
          Our Sayajigunj Hub desk verifies the UTR number in Google Sheets upon arrival for 10-second handover.
        </p>
      </div>
    </div>
  );
}
