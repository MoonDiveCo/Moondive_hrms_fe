'use client'

import { useReportWebVitals } from 'next/web-vitals'

/**
 * Web Vitals Monitoring Component for HRMS
 * Tracks Core Web Vitals for performance monitoring
 *
 * Metrics tracked:
 * - CLS: Cumulative Layout Shift
 * - FID: First Input Delay
 * - FCP: First Contentful Paint
 * - LCP: Largest Contentful Paint
 * - TTFB: Time to First Byte
 * - INP: Interaction to Next Paint
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      })
    }
  })

  return null
}
