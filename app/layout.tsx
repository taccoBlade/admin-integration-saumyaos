import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/header";
import { PageTransition } from "@/components/page-transition";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#08090b]`}
      >
        <Header />
        <PageTransition>{children}</PageTransition>
        <Analytics />
      </body>
    </html>
  );
}
