import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clothify — Premium Streetwear",
  description:
    "Discover the latest in premium streetwear. Limited drops, exclusive collections, and fast fashion for the culture.",
  keywords: [
    "streetwear",
    "fashion",
    "limited drops",
    "gen-z",
    "premium clothing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-deep-black text-text-primary`}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#121212",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#FAFAFA",
            },
          }}
        />
      </body>
    </html>
  );
}
