import Stripe from 'stripe'
const env = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? 'prod' : 'dev'
const stripeSecret = env === 'prod' ? process.env.STRIPE_APIKEY_PROD : process.env.STRIPE_APIKEY_DEV

export default new Stripe(stripeSecret, { apiVersion: null })
export { Stripe }