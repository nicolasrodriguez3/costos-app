import { DM_Sans, Geist, Geist_Mono } from "next/font/google";

export const fontTitle = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const fontBody = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});
