"use client";

import React, { useState } from "react";
import { Coins, Sparkles, Tag, Copy, Check, ChevronRight, Gift, Flame } from "lucide-react";
import { toast } from "sonner";
import { VADODARA_CENTRAL_HUB } from "@/data/fleet";

interface Offer {
  id: string;
  badge: string;
  title: string;
  discount: string;
  code: string;
  description: string;
  gradient: string;
  accentColor: string;
}

const OFFERS: Offer[] = [
  {
    id: "offer-1",
    badge: "LIMITED PERIOD",
    title: "GET 15% OFF",
    discount: "FLAT 15% OFF",
    code: "LONGDRIVE15",
    description: "On all 3+ Day self-drive bookings in Vadodara. Unlimited Kms included.",
    gradient: "from-[#FF6B00] via-orange-500 to-amber-500",
    accentColor: "text-[#FF6B00]",
  },
  {
    id: "offer-2",
    badge: "VADODARA HUB SPECIAL",
    title: "FIRST TRIP OFFER",
    discount: "FLAT 20% OFF",
    code: "VADODARA20",
    description: "Flat ₹400 off your first bike or car pickup at Sayajigunj Central Hub.",
    gradient: "from-emerald-600 via-teal-600 to-emerald-500",
    accentColor: "text-emerald-600",
  },
  {
    id: "offer-3",
    badge: "DOORSTEP PASS",
    title: "FREE DELIVERY",
    discount: "100% OFF DELIVERY",
    code: "FREEDELIVERY",
    description: "Free doorstep drop & collection anywhere in Vadodara on 24h+ bookings.",
    gradient: "from-slate-900 via-slate-800 to-black",
    accentColor: "text-slate-900",
  },
];

export function ZoomcarTopOffers() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`, {
      description: "Apply this code during WhatsApp / Counter booking for instant discount.",
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
      {/* Top Search & Wallet / Coin Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white border border-black/10 rounded-2xl p-3 shadow-xs">
        {/* Hub Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-black">
            {VADODARA_CENTRAL_HUB.name}
          </span>
          <span className="text-black/20 hidden sm:inline">•</span>
          <span className="text-xs text-black/50 hidden sm:inline">
            Sayajigunj Platform 1 & Alkapuri
          </span>
        </div>

        {/* Zoomcar-Style Coin / Rewards Badges */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs font-bold text-amber-900 shadow-2xs">
            <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>₹500 Off First Drive</span>
          </div>

          <div className="hidden xs:inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>250 Z-Credits Ready</span>
          </div>
        </div>
      </div>

      {/* Sliding Promotional Offers Banner */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/70">
              Exclusive Vadodara Offers & Codes
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-black/40">
            Swipe to see all ({OFFERS.length})
          </span>
        </div>

        {/* Horizontal Scroll Carousel */}
        <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {OFFERS.map((offer) => {
            const isCopied = copiedCode === offer.code;
            return (
              <div
                key={offer.id}
                className="snap-start shrink-0 w-[290px] sm:w-[340px] rounded-2xl bg-gradient-to-r p-[1px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${
                    offer.id === "offer-1"
                      ? "#FF6B00, #F59E0B"
                      : offer.id === "offer-2"
                      ? "#059669, #10B981"
                      : "#0F172A, #334155"
                  })`,
                }}
              >
                <div className="bg-white rounded-[15px] p-4 h-full flex flex-col justify-between">
                  <div>
                    {/* Header: Badge & Discount */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                        {offer.badge}
                      </span>
                      <span className="text-xs font-black text-black tracking-tight">
                        {offer.discount}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-black tracking-tight">
                      {offer.title}
                    </h4>
                    <p className="text-[11px] text-black/60 font-medium leading-relaxed mt-1">
                      {offer.description}
                    </p>
                  </div>

                  {/* Coupon Code Pill & Copy Button */}
                  <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-dashed border-slate-300 px-2.5 py-1 rounded-lg">
                      <Tag className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
                        {offer.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.code)}
                      className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-black text-white hover:bg-black/80"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
