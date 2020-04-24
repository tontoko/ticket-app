import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { NextApiHandler } from 'next'
import stripe, { Stripe } from '@/src/lib/stripe'

const endpoint: NextApiHandler = (async (req, res) => {
  try {
    const { firebaseToken, id } = req.body
    if (!firebaseToken || !id) return res.status(500)

    const { firebase, firestore } = await initFirebaseAdmin()
    const decodedToken = await firebase.auth().verifyIdToken(firebaseToken)

    const usersRef = firestore.collection('users').doc(decodedToken.uid)
    const user = (await usersRef.get()).data()

    const result = await stripe.accounts.updateExternalAccount(
      user.stripeId,
      id,
      { default_for_currency: true },
    ) as Stripe.BankAccount

    return res.json({ status: true })

  } catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }
})

export default endpoint