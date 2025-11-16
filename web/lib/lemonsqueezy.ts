import { createCheckout, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

let isConfigured = false

export function ensureLemonSqueezyConfigured() {
  if (isConfigured) return

  const apiKey = process.env.LEMONSQUEEZY_API_KEY

  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY is not set')
  }

  lemonSqueezySetup({ apiKey })
  isConfigured = true
}

export { createCheckout }
