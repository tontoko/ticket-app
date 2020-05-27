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

class NoStockError extends Error {
  constructor(message:string) {
    super(message);
    this.name = "NoStockError";
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

exports.payment = functions.https.onRequest(async (req, res) => {
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
    const firestore = admin.firestore()
    switch (webhockEvent['type']) {
      case 'payment_intent.succeeded':
        let error
        intent = webhockEvent.data.object as Stripe.PaymentIntent
        const { event, category, seller, buyer } = intent.metadata
        try {
          await firestore.runTransaction(async transaction => {
            const categoryRef = firestore.collection('events').doc(event).collection('categories').doc(category)
            const categoryResult = (await transaction.get(categoryRef)).data()
            const stock = categoryResult && categoryResult.stock
            const sold = categoryResult && categoryResult.sold
            
            if (stock === 0 || stock - sold < 1) {
              // 在庫なしの返金処理
              await stripe.refunds.create({
                payment_intent: intent.id,
                refund_application_fee: true,
                reverse_transfer: true
              })
              throw new NoStockError('在庫がありませんでした。返金手続きが行われました。')
            }
            // 売り上げを一つ増やす
            transaction.set(categoryRef, {
              sold: sold + 1
            }, { merge: true })
          })
          console.log("Succeeded:", intent.id);
        } catch (e) {
          if (e instanceof NoStockError) {
            error = e.message
          } else {
            error = '不明なエラーが発生しました。'
          }
          console.log(`${e}:`, intent.id);
        }
        // 決済履歴追加
        firestore.collection('payments').add({
          event,
          category,
          seller,
          buyer,
          accepted: false,
          stripe: intent.id,
          error
        })
        break;
      case 'payment_intent.payment_failed':
        intent = webhockEvent.data.object as Stripe.PaymentIntent
        const message = intent.last_payment_error && intent.last_payment_error.message;
        console.error('Failed:', intent.id, message);
        firestore.collection('payments').add({
          event,
          category,
          seller,
          buyer,
          accepted: false,
          stripe: intent.id,
          error: '支払いが拒否されました。他の支払い方法をお試しください。'
        })
        break;
    }
  } catch (e) {
    console.error(e)
  }

  res.status(200).end()
})

exports.ticketReception = functions.https.onCall(async(data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('failed-precondition', 'ログインしていません。')
  console.log(data)
  // ユーザーuid突き合わせ
  try {
    if (context.auth.uid !== data.seller) throw new Error
  } catch(e) {
    throw new functions.https.HttpsError('unauthenticated', '認証に失敗しました。')
  }

  try {
    await firestore.collection('payments').doc(data.paymentId).update({
      accepted: true
    })
    return {
      msg: '読み取りに成功しました。'
    }
  } catch(e) {
    console.error(e)
    throw new functions.https.HttpsError('internal', 'データの更新に失敗しました。しばらくしてお試しください。')
  }
})