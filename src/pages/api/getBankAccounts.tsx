import { NextApiHandler } from 'next'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import stripe, { Stripe } from '@/src/lib/stripe'

const getBankAccounts: NextApiHandler = async (req, res) => {
  const { uid } = req.body
  const { firestore } = await initFirebaseAdmin()
  const { stripeId } = (await firestore.collection('users').doc(uid).get()).data()
  const bankAccounts = (await stripe.accounts.listExternalAccounts(
    stripeId,
    // @ts-ignore
    { object: 'bank_account', limit: 100 },
  )) as Stripe.ApiList<Stripe.BankAccount>

  res.status(200).json({ bankAccounts })
}

export default getBankAccounts
