import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

type stripeEnv = {
  apikey: {
    prod: string
    dev: string
  }
}

admin.initializeApp(functions.config().firebase)
const firestore = admin.firestore()

const stripeEnv = functions.config().stripe as stripeEnv
const stripeSecret =
  process.env.GCLOUD_PROJECT === 'ticket-app-d3f5a' ? stripeEnv.apikey.prod : stripeEnv.apikey.dev
// @ts-ignore
const stripe = new Stripe(stripeSecret, { apiVersion: null, typescript: true })

exports.createUser = functions.auth.user().onCreate(async (user) => {
  try {
    const stripeAccount = await stripe.accounts.create({
      country: 'JP',
      type: 'custom',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      email: user.email,
      settings: {
        payouts: {
          schedule: {
            interval: 'monthly',
          },
        },
      },
    })
    const usersRef = firestore.collection('users')
    await usersRef.doc(user.uid).set({
      admin: false,
      stripeId: stripeAccount.id,
    })
  } catch (e) {
    firestore.collection('contacts').add({
      category: 'new user register faild',
      text: `次のユーザーの登録時にstripeIDの作成に失敗しました: ${user.uid}\nemail: ${user.email}`,
      info: {
        user: user.uid,
      },
    })
    admin.auth().deleteUser(user.uid)
  }
})
