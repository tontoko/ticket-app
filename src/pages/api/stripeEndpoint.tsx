import { Stripe } from 'stripe'
import { NextApiHandler } from 'next';
import stripe from '@/src/lib/stripe';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import { buffer } from "micro";
import Cors from "micro-cors";
import { category } from 'app';

const endpointSecret = process.env.ENV === 'prod' ? process.env.STRIPE_PAYMENT_ENDPOINT_PROD : process.env.STRIPE_PAYMENT_ENDPOINT_DEV

class NoBuyableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoBuyableError";
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const Webhock: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
  const sig = req.headers['stripe-signature'];
  let webhockEvent: Stripe.Event;
  
  try {
    const buf = await buffer(req);
    webhockEvent = stripe.webhooks.constructEvent(
      buf.toString(),
      sig,
      endpointSecret
    );
  } catch (err) {
    // invalid signature
    console.error(`Error message: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  try {
    switch (webhockEvent["type"]) {
      case "payment_intent.succeeded":
        await payment_intent_succeeded(webhockEvent);
        break;
      case "payment_intent.payment_failed":
        await payment_intent_payment_failed(webhockEvent);
        break;
    }
  } catch (e) {
    console.error(e);
  }

  res.json({ received: true });
}

export const payment_intent_succeeded = async (webhockEvent: Stripe.Event) => {
  let error: string | null = null;
  const intent = webhockEvent.data.object as Stripe.PaymentIntent;
  const { event, category, seller, buyer } = intent.metadata;
  const { firestore } = await initFirebaseAdmin();
  try {
    await firestore.runTransaction(async (transaction) => {
      const categoryRef = firestore
        .collection("events")
        .doc(event)
        .collection("categories")
        .doc(category);
      const categoryResult = (
        await transaction.get(categoryRef)
      ).data() as category;
      const { stock, sold } = categoryResult;

      if (stock === 0 || stock - sold < 1) {
        throw new NoBuyableError(
          "在庫がありませんでした。返金手続きが行われました。"
        );
      }
      if (!categoryResult.public) {
        throw new NoBuyableError(
          "購入したチケットは非公開になりました。返金手続きが行われました。"
        );
      }
      // 売り上げを一つ増やす
      transaction.set(
        categoryRef,
        {
          sold: sold + 1,
        },
        { merge: true }
      );
    });
    console.log("Succeeded:", intent.id);
  } catch (e) {
    // instanceofが動作しないので暫定
    if (e.name == 'NoBuyableError') {
      error = e.message;
    } else {
      error = "不明なエラーが発生しました。返金手続きが行われました。";
    }
    // 返金処理
    await stripe.refunds.create({
      payment_intent: intent.id,
      refund_application_fee: true,
      reverse_transfer: true,
    });
    console.log(`${e}:`, intent.id);
  }
  // 決済履歴追加
  await firestore.collection("payments").add({
    event,
    category,
    seller,
    buyer,
    accepted: false,
    stripe: intent.id,
    error,
    createdAt: new Date(),
  });
};

export const payment_intent_payment_failed = async (webhockEvent: Stripe.Event) => {
  const intent = webhockEvent.data.object as Stripe.PaymentIntent;
  const { event, category, seller, buyer } = intent.metadata;
  const { firestore } = await initFirebaseAdmin();
  const message = intent.last_payment_error && intent.last_payment_error.message;
  console.error("Failed:", intent.id, message);
  await firestore.collection("payments").add({
    event,
    category,
    seller,
    buyer,
    accepted: false,
    stripe: intent.id,
    error: "支払いが拒否されました。他の支払い方法をお試しください。",
  });
};

export default cors(Webhock)