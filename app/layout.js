<<<<<<< HEAD
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { RBACProvider } from "@/context/rbacContext";
import { NotificationProvider } from "../context/notificationcontext"; // ✅ Import NotificationProvider
import { WebVitals } from "@/components/WebVitals";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Toaster } from 'sonner';
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { AttendanceProvider } from "@/context/attendanceContext";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

=======
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/authContext';
import { RBACProvider } from '@/context/rbacContext';
import { WebVitals } from '@/components/WebVitals';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Toaster } from 'sonner';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import { AttendanceProvider } from '@/context/attendanceContext';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
>>>>>>> 6c6ff4696f1c30cc1a7247c63ebe84ffb53420f5
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'MoonDive HRMS - Human Resource Management System',
  description:
    'Comprehensive HR management solution for employee tracking, attendance, leave management, and payroll',
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
    <html lang='en'>
      <head>
        <link
          href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
          rel='stylesheet'
        />
        <GoogleAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<<<<<<< HEAD
        <Toaster richColors position="top-right" />
        
=======
        <Toaster richColors position='top-right' />
>>>>>>> 6c6ff4696f1c30cc1a7247c63ebe84ffb53420f5
        {/* Skip to main content link for accessibility */}
        <a href='#main-content' className='skip-to-main'>
          Skip to main content
        </a>

        <WebVitals />
        <ReactQueryProvider>
          <AuthProvider>
<<<<<<< HEAD
            <NotificationProvider> {/* ✅ Add NotificationProvider here */}
              <RBACProvider>
                <AttendanceProvider>
                  {children}
                </AttendanceProvider>
              </RBACProvider>
            </NotificationProvider>
=======
            <RBACProvider>
              <AttendanceProvider>{children}</AttendanceProvider>
            </RBACProvider>
>>>>>>> 6c6ff4696f1c30cc1a7247c63ebe84ffb53420f5
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
