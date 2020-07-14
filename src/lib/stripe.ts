import Stripe from 'stripe'
const env = process.env.VERCEL_GITHUB_COMMIT_REF === 'master' ? 'prod' : 'dev'
const stripeSecret = env === 'prod' ? process.env.STRIPE_APIKEY_PROD : process.env.STRIPE_APIKEY_DEV

export default new Stripe(stripeSecret, { apiVersion: null })
export { Stripe }