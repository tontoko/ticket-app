import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin' 
import Stripe from 'stripe'

type stripeEnv = {
  payment: {
    endpoint: {
      prod: string,
      dev: string
    },
  },
  apikey: {
    prod: string,
    dev: string
  }
}

admin.initializeApp(functions.config().firebase)
const firestore = admin.firestore()

const stripeEnv = functions.config().stripe as stripeEnv
const stripeSecret = process.env.GCLOUD_PROJECT === 'ticket-app-d3f5a' ? stripeEnv.apikey.prod : stripeEnv.apikey.dev
const stripePaymentSecret = process.env.GCLOUD_PROJECT === 'ticket-app-d3f5a' ? stripeEnv.payment.endpoint.prod : stripeEnv.payment.endpoint.dev
// @ts-ignore
const stripe = new Stripe(stripeSecret, { apiVersion: null })

exports.createUser = functions
.auth.user().onCreate(async (user) => {  
  const stripeAccount = await stripe.accounts.create({
    country: 'JP',
    type: 'custom',
    requested_capabilities: ['card_payments', 'transfers'],
    email: user.email
  })
  const usersRef = firestore.collection('users')
  await usersRef.doc(user.uid).set({
    admin: false,
    stripeId: stripeAccount.id
  })
});

exports.https = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let webhockEvent: Stripe.Event

  try {
    const endpointSecret = stripePaymentSecret
    // @ts-ignore
    webhockEvent = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    // invalid signature
    console.error(err)
    res.status(400).end();
    return;
  }

  let intent: Stripe.PaymentIntent
  try {
    switch (webhockEvent['type']) {
      case 'payment_intent.succeeded':
        intent = webhockEvent.data.object as Stripe.PaymentIntent
        const { event, category, seller, buyer } = intent.metadata
        const firestore = admin.firestore()
        try {
          await firestore.runTransaction(async transaction => {
            const categoryRef = firestore.collection('events').doc(event).collection('categories').doc(category)
            const categoryResult = (await transaction.get(categoryRef)).data()
            const stock = categoryResult && categoryResult.stock
            const sold = categoryResult && categoryResult.sold
            
            if (stock === 0 || sold === 0 || stock - sold < 1) {
              // 在庫なしの返金処理
              await stripe.refunds.create({
                payment_intent: intent.id,
                refund_application_fee: true,
                reverse_transfer: true
              })
              throw Error('在庫がありませんでした。')
            }
            // 売り上げを一つ増やす
            transaction.set(categoryRef, {
              sold: sold + 1
            }, { merge: true })
          })
          // 決済履歴追加
          firestore.collection('payments').add({
            event,
            category,
            seller,
            buyer,
            accepted: false,
            stripe: intent.id
          })
        } catch (e) {
          console.log(`${e}:`, intent.id);
        }
        console.log("Succeeded:", intent.id);
        break;
      case 'payment_intent.payment_failed':
        intent = webhockEvent.data.object as Stripe.PaymentIntent
        const message = intent.last_payment_error && intent.last_payment_error.message;
        console.error('Failed:', intent.id, message);
        break;
    }
  } catch (e) {
    console.error(e)
  }

  res.status(200).end()
})