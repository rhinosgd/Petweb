import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { BackToTop } from "@/components/BackToTop";
import { CartProvider } from "@/components/CartDrawer";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
  display: "swap"
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Paw & Craft — Modern Handmade Pet Essentials",
  description:
    "Handcrafted pet essentials, designed with intention. Modern carriers, beds, apparel and personalized accessories for the dogs and cats you love."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        <ToastProvider>
          <CartProvider>
            {children}
            <BackToTop />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
