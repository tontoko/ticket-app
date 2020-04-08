import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { NextApiHandler } from 'next'
const env = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? 'prod' : 'dev'
const stripeSecret = env === 'prod' ? process.env.STRIPE_APIKEY_PROD : process.env.STRIPE_APIKEY_DEV
import Stripe from 'stripe'

const endpoint: NextApiHandler = (async (req, res) => {
  if (!req.body) return res.status(400).send({body: 'body was empty'})
  try {
    const stripe = new Stripe(stripeSecret, { apiVersion: null})
    const {
      token,
      first_name_kana,
      last_name_kana,
      first_name_kanji,
      last_name_kanji,
      dob,
      address_kana,
      address_kanji,
      gender
    } = req.body

    const { firebase, firestore } = await initFirebaseAdmin()
    const decodedToken = await firebase.auth().verifyIdToken(token)

    const usersRef = firestore.collection('users').doc(decodedToken.uid)
    const user = (await usersRef.get()).data()

    let userData: Stripe.AccountUpdateParams = {
      business_type: 'individual',
      individual: {
        first_name_kana,
        last_name_kana,
        first_name_kanji,
        last_name_kanji,
        dob,
        address_kana,
        address_kanji,
        gender
      },
    }

    if (!user.userData) userData.tos_acceptance = {
      date: Math.floor(Date.now() / 1000),
      ip: req.connection.remoteAddress
    }

    await stripe.accounts.update(
      user.stripeId,
      userData
    )

    await usersRef.update({userData})

    return res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }
})

export default endpoint