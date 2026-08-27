import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

/* =========================================================
   OSMIUM TYPOGRAPHY
   ========================================================= */

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

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/* =========================================================
   SITE METADATA
   ========================================================= */

export const metadata: Metadata = {
  title: {
    default: "Osmium BPO | Call. Delegate. Outsource. Automate.",
    template: "%s | Osmium BPO",
  },

  description:
    "Osmium BPO helps businesses operate smarter through professional call centre services, virtual assistance, outsourcing, remote workforce solutions and business process support.",

  keywords: [
    "Osmium BPO",
    "BPO Kenya",
    "Business Process Outsourcing",
    "Call Centre",
    "Call Center Services",
    "Virtual Assistance",
    "Back Office Outsourcing",
    "Remote Workforce",
    "Outsourcing Services",
    "Business Support",
    "Customer Support",
    "Business Process Management",
  ],

  authors: [
    {
      name: "Osmium BPO",
    },
  ],

  creator: "Osmium BPO",
  publisher: "Osmium BPO",

  applicationName: "Osmium BPO",

  category: "Business Services",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  /* =======================================================
     BRAND / FAVICON
  ======================================================= */

  icons: {
    icon: [
      {
        url: "/icons/favicon.ico",
        type: "image/x-icon",
      },
    ],

    shortcut: "/icons/favicon.ico",

    apple: [
      {
        url: "/icons/icon-192.jpg",
      },
    ],
  },

  /* =======================================================
     PWA / MOBILE
  ======================================================= */

  manifest: "/manifest.webmanifest",

  robots: {
    index: true,
    follow: true,
  },
};

/* =========================================================
   VIEWPORT
   ========================================================= */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",

  themeColor: "#071a2f",

  colorScheme: "light",
};

/* =========================================================
   ROOT LAYOUT
   ========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          playfair.variable,
        ].join(" ")}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}