import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { envs } from "@/config/envs";
import { fontBody, fontMono, fontTitle } from "@/config/fonts";

import "./globals.css";

const title = envs().NEXT_PUBLIC_APP_TITLE;
const description = envs().NEXT_PUBLIC_APP_DESCRIPTION;
export const metadata: Metadata = {
  title,
  description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontBody.variable} ${fontTitle.variable} ${fontMono.variable}`}
    >
      <head>
        <link rel="icon" href="./icon.svg" />
      </head>
      <body className="overflow-x-hidden antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
