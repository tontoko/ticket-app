import { Stripe } from 'stripe'

export default (req, res) => {
  const sig = req.headers['stripe-signature'];
  const body = req.body;

  let event = null;

  try {
    const stripeSecret = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? process.env.STRIPE_PROD_SECRET : process.env.STRIPE_DEV_SECRET
    const stripe = require('stripe')(stripeSecret) as Stripe
    const endpointSecret = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? process.env.STRIPE_PROD_ENDPOINT_SECRET : process.env.STRIPE_DEV_ENDPOINT_SECRET
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
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
      console.log('Failed:', intent.id, message);
      break;
  }

  res.sendStatus(200);
}