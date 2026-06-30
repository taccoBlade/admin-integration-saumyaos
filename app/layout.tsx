import type { Metadata } from "next";
import localFont from "next/font/local";
import { Syne, Space_Grotesk, Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";
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
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const biggerScape = localFont({
  src: "./fonts/BiggerScapeDemo-PKv37.ttf",
  variable: "--font-bigger-scape",
  weight: "400",
  display: "swap",
});

const batmanForever = localFont({
  src: "./fonts/batmfa__.ttf",
  variable: "--font-batman-forever",
  weight: "400",
  display: "swap",
});

const batmanForeverOutline = localFont({
  src: "./fonts/batmfo__.ttf",
  variable: "--font-batman-forever-outline",
  weight: "400",
  display: "swap",
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://saumya.space"),
  title: {
    default: "Saumya Parekh | Civil Engineering & Infrastructure",
    template: "%s | Saumya Parekh",
  },
  description:
    "Civil Engineering student specializing in geotechnical systems, infrastructure innovation, portfolio management, and digital storytelling.",
  keywords: [
    "Saumya Parekh",
    "Civil Engineering",
    "Geotechnical Engineering",
    "Portfolio",
    "Infrastructure",
    "PDEU",
    "Infrastructure Automation",
    "Smart Construction",
  ],
  authors: [{ name: "Saumya Parekh", url: "https://saumya.space" }],
  creator: "Saumya Parekh",
  publisher: "Saumya Parekh",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Saumya Parekh | Civil Engineering & Infrastructure",
    description:
      "Civil Engineering student specializing in geotechnical systems, infrastructure innovation, portfolio management, and digital storytelling.",
    url: "https://saumya.space",
    siteName: "Saumya Parekh",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saumya Parekh | Civil Engineering & Infrastructure",
    description:
      "Civil Engineering student specializing in geotechnical systems, infrastructure innovation, portfolio management, and digital storytelling.",
    creator: "@saumyaparekh",
  },
  verification: {
    google: "ZPx2ij9gQ2S42Ni4bDZSQ2AX--M4o0wAq2D5crT9CLI",
  },
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
        <Script strategy="lazyOnload" src="https://www.googletagmanager.com/gtag/js?id=G-X4Z73QT8MB" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X4Z73QT8MB');
          `}
        </Script>
        {/* WebSite Structured Data for Google Search Site Name */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Saumya Parekh",
              "alternateName": ["Saumya Parekh Portfolio"],
              "url": "https://saumya.space",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} ${syne.variable} ${spaceGrotesk.variable} ${cormorant.variable} ${biggerScape.variable} ${batmanForever.variable} ${batmanForeverOutline.variable} antialiased bg-[#08090b]`}
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
