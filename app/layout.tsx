import type { Metadata } from "next";
import localFont from "next/font/local";
import { Syne, Space_Grotesk, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

import { OSProvider } from "@/lib/os-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const biggerScape = localFont({
  src: "./fonts/BiggerScapeDemo-PKv37.ttf",
  variable: "--font-bigger-scape",
  weight: "400",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Saumya Parekh | Civil Engineering & Infrastructure",
  description:
    "Civil Engineering student specializing in geotechnical systems, infrastructure innovation, portfolio management, and digital storytelling.",
  keywords: [
    "Saumya Parekh",
    "Civil Engineering",
    "Geotechnical Engineering",
    "Portfolio",
    "Infrastructure",
    "PDEU",
  ],
  authors: [{ name: "Saumya Parekh" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-0SK1HVJPZG" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0SK1HVJPZG');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${spaceGrotesk.variable} ${cormorant.variable} ${biggerScape.variable} antialiased bg-[#08090b]`}
      >
        <OSProvider>
          <Header />
          <PageTransition>{children}</PageTransition>
          <Analytics />
        </OSProvider>
      </body>
    </html>
  );
}
