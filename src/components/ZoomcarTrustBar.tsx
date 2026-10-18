"use client";

import React from "react";
import { ShieldCheck, Truck, Star, Award, HeartHandshake } from "lucide-react";

export function ZoomcarTrustBar() {
  return (
    <section className="w-full bg-[#111113] border-y border-white/10 text-white py-12 px-4 sm:px-6 lg:px-8 my-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Badge 1: 100% Secured Trip */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>RTO Certified Safety</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                100% Secured trip
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Comprehensive commercial insurance coverage & 24/7 emergency roadside assistance across Gujarat. Zero liability for standard wear and tear.
              </p>
            </div>
          </div>

          {/* Badge 2: Delivery Anywhere Anytime */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Vadodara Wide Reach</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Delivery Anywhere Anytime
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Free pickup at Sayajigunj Central Hub or choose doorstep delivery (+₹199) to your home, office, or Vadodara Junction railway platform.
              </p>
            </div>
          </div>

          {/* Badge 3: 25k+ Top Rated Cars across India */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <span>Verified 4.9 / 5.0 Rating</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                25k+ Top Rated Cars across India
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                100% sanitized machines with active FASTag, GPS tracking, and complete papers. Over 68,000+ seamless trips fulfilled in Gujarat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
