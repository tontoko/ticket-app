import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { NextApiHandler } from 'next'
const env = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? 'prod' : 'dev'
const stripeSecret = env === 'prod' ? process.env.STRIPE_APIKEY_PROD : process.env.STRIPE_APIKEY_DEV
import Stripe from 'stripe'

const endpoint: NextApiHandler = (async (req, res) => {
  try {
    console.log('test')
    const { firebaseToken, stripeToken } = req.body
    if (!firebaseToken || !stripeToken) return res.status(500)

    const { firebase, firestore } = await initFirebaseAdmin()
    const decodedToken = await firebase.auth().verifyIdToken(firebaseToken)

    const usersRef = firestore.collection('users').doc(decodedToken.uid)
    const user = (await usersRef.get()).data()

    const stripe = new Stripe(stripeSecret, { apiVersion: null })
    const result = await stripe.accounts.createExternalAccount(
      user.stripeId,
      stripeToken
      )

    return res.status(200)

  } catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }
})

export default endpoint