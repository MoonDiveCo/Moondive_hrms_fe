'use client'

import Script from 'next/script'

/**
 * Google Analytics Component
 * Adds GA4 tracking to your HRMS application
 *
 * Setup:
 * 1. Get your Measurement ID from Google Analytics (GA_MEASUREMENT_ID)
 * 2. Add it to .env.local: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * 3. This component will automatically track pageviews and Web Vitals
 */
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  // Don't load GA in development to avoid skewing data
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_GA_DEBUG) {
    return null
  }

  // Don't load if no measurement ID is provided
  if (!measurementId) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Google Analytics Measurement ID is missing. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to your environment variables.')
    }
    return null
  }

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  )
}
