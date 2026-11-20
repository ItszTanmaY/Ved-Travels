"use client";

import { Calendar, FileCheck, KeyRound, RotateCcw } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Pick Your Machine & Duration",
    description:
      "Choose from verified bikes (Activa, R15, Classic 350) or self-drive cars (Swift, Ciaz, City, Ertiga, Thar) starting from 1 hr or 6 hrs.",
    icon: Calendar,
    pill: "By Hour or Day",
  },
  {
    step: "02",
    title: "Instant Digital KYC",
    description:
      "Upload your valid Indian Driving License & Aadhaar in under 2 minutes. 100% paperless verification with zero counter wait.",
    icon: FileCheck,
    pill: "Paperless Verification",
  },
  {
    step: "03",
    title: "Hub Pickup or Doorstep (+₹199)",
    description:
      "Free pickup at your preferred Vadodara Hub or opt for Doorstep Delivery to your home or hotel. Show your 4-digit OTP to get the keys.",
    icon: KeyRound,
    pill: "4-Digit Handover OTP",
  },
  {
    step: "04",
    title: "Ride & Hassle-Free Return",
    description:
      "Enjoy unlimited freedom across Gujarat with active FASTag. Simple drop-off at your selected Vadodara hub with zero paperwork delays.",
    icon: RotateCcw,
    pill: "Zero Counter Delay",
  },
];

export default function HowItWorksConsumer() {
  return (
    <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>HOW IT WORKS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Seamless Self-Drive In 4 Simple Steps
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-body">
            No endless paperwork queues. Book your machine in 60 seconds and start driving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-emerald-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-heading font-extrabold text-slate-300 group-hover:text-emerald-600 transition-colors">
                      {step.step}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      {step.pill}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-heading font-extrabold text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-body">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
