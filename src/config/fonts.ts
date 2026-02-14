import { DM_Sans, Geist_Mono, Space_Grotesk } from "next/font/google";

// Sora

export const fontTitle = Space_Grotesk({
  variable: "--font-title",
  weight: "variable",
});

export const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const fontBody = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});
