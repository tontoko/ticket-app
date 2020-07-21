import Stripe from 'stripe'
const env = process.env.ENV === 'prod' ? 'prod' : 'dev'
const stripeSecret = env === 'prod' ? process.env.STRIPE_APIKEY_PROD : process.env.STRIPE_APIKEY_DEV

export default new Stripe(stripeSecret, { 
    apiVersion: null, 
    typescript: true
 });
export { Stripe }