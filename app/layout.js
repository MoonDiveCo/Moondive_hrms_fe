import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { RBACProvider } from "@/context/rbacContext";
import { WebVitals } from "@/components/WebVitals";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MoonDive HRMS - Human Resource Management System",
  description: "Comprehensive HR management solution for employee tracking, attendance, leave management, and payroll",
  manifest: '/manifest.json',
  themeColor: '#1487A5',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>

        <WebVitals />

        <AuthProvider>
          <RBACProvider>{children}</RBACProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
