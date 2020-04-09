import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { NextApiHandler } from 'next'
const env = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? 'prod' : 'dev'
const stripeSecret = env === 'prod' ? process.env.STRIPE_APIKEY_PROD : process.env.STRIPE_APIKEY_DEV
import Stripe from 'stripe'

const endpoint: NextApiHandler = (async (req, res) => {
  try {


    // ToDo: 作る


    const stripe = new Stripe(stripeSecret, { apiVersion: null })
    const { token, zip } = req.body
    const result = await stripe.accounts.createExternalAccount(
      'acct_1GQU5TDromrZs6rB',
      {
        external_account: 'bank_account',
        
      }
    );


    res.status(200).json({  })

  } catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }
})

export default endpoint