import { Stripe } from 'stripe'
import { NextApiHandler } from 'next';

const paymentSucceeded: NextApiHandler = (req, res) => {
  const sig = req.headers['stripe-signature'];
  const {body} = req

  let event = null;

  try {
    const stripeSecret = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? process.env.STRIPE_PROD_SECRET : process.env.STRIPE_DEV_SECRET
    const stripe = require('stripe')(stripeSecret) as Stripe
    const endpointSecret = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? process.env.STRIPE_PROD_ENDPOINT_SECRET : process.env.STRIPE_DEV_ENDPOINT_SECRET
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    // invalid signature
    res.status(400).end();
    return;
  }

  let intent = null;
  switch (event['type']) {
    case 'payment_intent.succeeded':
      intent = event.data.object;
      console.log("Succeeded:", intent.id);
      break;
    case 'payment_intent.payment_failed':
      intent = event.data.object;
      const message = intent.last_payment_error && intent.last_payment_error.message;
      console.error('Failed:', intent.id, message);
      break;
  }

  res.status(200).end()
}

export default paymentSucceeded