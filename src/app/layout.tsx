import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google"; // Added Unbounded
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unbounded = Unbounded({ // Added Unbounded config
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["900"], // Extra bold for that heavy look
});

export const metadata: Metadata = {
  title: "moneyball for ipl",
  description: "made by ajeebtech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
