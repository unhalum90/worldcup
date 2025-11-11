'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log web vitals to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }

    // Send to analytics in production only if configured
    if (process.env.NODE_ENV === 'production') {
      const endpoint = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT;
      if (endpoint) {
        const body = JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          rating: metric.rating,
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, body);
        } else {
          fetch(endpoint, { body, method: 'POST', keepalive: true }).catch(
            console.error
          );
        }
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
