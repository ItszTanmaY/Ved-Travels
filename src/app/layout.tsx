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
  title: "Ved Travels | Vadodara Self-Drive Cars & Bikes Rental",
  description:
    "Ved Travels Vadodara - Self-drive bikes and cars rental with transparent slab pricing. 24x7 service across Ajwa Road, Waghodia Road, Sumandeep Vidyapith, Parul University, Vadodara Railway Station & Airport.",
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
