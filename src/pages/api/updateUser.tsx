import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { NextApiHandler } from 'next'
import stripe, { Stripe } from '@/src/lib/stripe'

const endpoint: NextApiHandler = (async (req, res) => {
  if (!req.body) return res.status(400).send({body: 'body was empty'})
  try {
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

    return res.json({ status: true })
  } catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }
})

export default endpoint