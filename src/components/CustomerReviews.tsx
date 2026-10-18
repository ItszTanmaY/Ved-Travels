"use client";

import { Star, Quote, CheckCircle2 } from "lucide-react";

const REVIEWS = [
  {
    name: "Rohan Bhatt",
    location: "Gotri, Vadodara",
    role: "Rented Royal Enfield Hunter 350",
    rating: 5,
    text: "Booked the Hunter 350 for a weekend ride to Pavagadh. The 4-digit OTP handover at Sayajigunj Hub took literally 3 minutes! Vehicle was in mint condition and the security deposit was refunded back to my UPI within 40 minutes of return.",
  },
  {
    name: "Pooja Shah",
    location: "Alkapuri, Vadodara",
    role: "Rented Hyundai Creta SX",
    rating: 5,
    text: "Had family visiting from Mumbai. The doorstep delivery to Alkapuri was super punctual. The Creta was sparkling clean with active FASTag. Much better and cleaner than traditional car rental operators in Gujarat.",
  },
  {
    name: "Karan Desai",
    location: "Sayajigunj, Vadodara",
    role: "Host Partner (Maruti Swift)",
    rating: 5,
    text: "I attached my 2022 Swift to Ved Travels while I work from home. I earn ₹32,000 every single month on auto-pilot. Free doorstep GPS tracker was installed by their team, and every renter's DL is pre-verified.",
  },
];

export default function CustomerReviews() {
  return (
    <section id="reviews-section" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>4.9 / 5.0 STAR RATED IN VADODARA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Loved by 12,000+ Renters & Hosts
          </h2>

          <p className="text-sm text-slate-600 font-body">
            Real feedback from riders, travelers, and host partners across Vadodara.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-body leading-relaxed">
                  &quot;{rev.text}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900">
                    {rev.name}
                  </h4>
                  <span className="text-[11px] text-slate-400">{rev.location}</span>
                </div>

                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {rev.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
