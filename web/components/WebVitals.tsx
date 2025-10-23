'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log web vitals to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
      });

      const url = 'https://example.com/analytics'; // Replace with your analytics endpoint

      // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, {
          body,
          method: 'POST',
          keepalive: true,
        }).catch(console.error);
      }
    }

    // Log important metrics regardless of environment
    switch (metric.name) {
      case 'LCP':
        console.log('🎯 Largest Contentful Paint:', metric.value, 'ms');
        break;
      case 'FID':
        console.log('⚡ First Input Delay:', metric.value, 'ms');
        break;
      case 'CLS':
        console.log('📐 Cumulative Layout Shift:', metric.value);
        break;
      case 'FCP':
        console.log('🎨 First Contentful Paint:', metric.value, 'ms');
        break;
      case 'TTFB':
        console.log('⏱️ Time to First Byte:', metric.value, 'ms');
        break;
      case 'INP':
        console.log('🖱️ Interaction to Next Paint:', metric.value, 'ms');
        break;
    }
  });

  return null;
}
