import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { RentalProvider } from "@/context/RentalContext";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ved Travels | Vadodara's Premier Self-Drive Fleet & Host Marketplace",
  description:
    "Vadodara's premier self-drive bikes & cars rental platform and host marketplace. Hourly & daily bookings, Sayajigunj central hub pickup & doorstep delivery across Vadodara (GJ-06).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} font-sans`}>
      <body className="min-h-screen bg-[#FAFAF9] text-[#1A1A1A] flex flex-col selection:bg-[#FF6B00]/20 selection:text-[#FF6B00] antialiased">
        <RentalProvider>
          {children}
          <Toaster
            position="top-center"
            theme="light"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                color: "#1A1A1A",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
                borderRadius: "1.25rem",
                fontFamily: "var(--font-sora)",
              },
            }}
          />
        </RentalProvider>
      </body>
    </html>
  );
}
