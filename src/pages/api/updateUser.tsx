import initFirebaseAdmin from '@/initFirebaseAdmin'
import getSession from '@/src/lib/session'
const env = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? 'prod' : 'dev'
const stripeSecret = env === 'prod' ? process.env.STRIPE_PROD_SECRET : process.env.STRIPE_DEV_SECRET
// const stripe = require('stripe')(stripeSecret)
import Stripe from 'stripe'
import { NextApiHandler } from 'next'
const stripe = new Stripe(stripeSecret, { apiVersion: null})

const endpoint: NextApiHandler = (async (req, res) => {
  if (!req.body) return res.status(400).send({body: 'body was empty'})
  try {
    const {
      token,
      external_account,
      first_name_kana,
      last_name_kana,
      first_name_kanji,
      last_name_kanji,
      day,
      month,
      year,
      address_kana,
      address_kanji,
      gender
    } = req.body
    
    const { firebase, firestore } = await initFirebaseAdmin()
    const decodedToken = await firebase.auth().verifyIdToken(token)

    const usersRef = firestore.collection('users');
    const user = (await usersRef.doc(decodedToken.uid).get()).data()

    const stripeAccount = await stripe.accounts.update(
      user.stripeId,
      {
        business_type: 'individual',
        external_account,
        individual: {
          first_name_kana,
          last_name_kana,
          first_name_kanji,
          last_name_kanji,
          dob: {
            day,
            month,
            year
          },
          address_kana,
          address_kanji,
          gender
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: req.connection.remoteAddress, // Assumes you're not using a proxy
        },
      }
    )
    return res.json({ status: true, response: 'test' })
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})

export default endpoint