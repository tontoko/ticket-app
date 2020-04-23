import { Stripe } from 'stripe'
import { NextApiHandler } from 'next';
import stripe from '@/src/lib/stripe';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';

const Webhock: NextApiHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const {body} = req
  let webhockEvent: Stripe.Event

  try {
    const endpointSecret = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? process.env.STRIPE_ENDPOINT_PROD : process.env.STRIPE_ENDPOINT_DEV
    webhockEvent = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    // invalid signature
    res.status(400).end();
    return;
  }

  let intent: Stripe.PaymentIntent
  try {
    switch (webhockEvent['type']) {
      case 'payment_intent.succeeded':
        intent = webhockEvent.data.object as Stripe.PaymentIntent
        const { event, category } = intent.metadata
        const { firestore } = await initFirebaseAdmin()
        firestore.runTransaction(async transaction => {
          const categoryRef = firestore.collection('events').doc(event).collection('categories').doc(category)
          const { stock } = (await transaction.get(categoryRef)).data()
          if (stock === 0) {
            // 在庫なしの返金処理
            const refunds = await stripe.refunds.create({
              payment_intent: intent.id,
              refund_application_fee: true,
              reverse_transfer: true
            })
          }
          // 在庫を一つ減らす
          transaction.set(categoryRef, {
            stock: stock - 1
          }, { merge: true })
        })
        console.log("Succeeded:", intent.id);
        break;
      case 'payment_intent.payment_failed':
        intent = webhockEvent.data.object as Stripe.PaymentIntent
        const message = intent.last_payment_error && intent.last_payment_error.message;
        console.error('Failed:', intent.id, message);
        break;
    }
  } catch(e) {
    console.error(e)
  }

  res.status(200).end()
}

export default Webhock