import { Stripe } from 'stripe'
import { NextApiHandler } from 'next';
import stripe from '@/src/lib/stripe';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import * as functions from "firebase-functions";

class NoStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoStockError";
  }
}

const Webhock: NextApiHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let webhockEvent: Stripe.Event;
  
  try {
    const endpointSecret = process.env.ENV === 'prod' ? process.env.STRIPE_PAYMENT_ENDPOINT_PROD : process.env.STRIPE_PAYMENT_ENDPOINT_DEV
    // TODO: rawBodyが取れているか動作確認
    webhockEvent = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    // invalid signature
    console.error(err);
    res.status(400).end();
    return;
  }

  let intent: Stripe.PaymentIntent;
  try {
    const { firestore } = await initFirebaseAdmin()
    switch (webhockEvent["type"]) {
      case "payment_intent.succeeded":
        let error: string | null = null;
        intent = webhockEvent.data.object as Stripe.PaymentIntent;
        const { event, category, seller, buyer } = intent.metadata;
        try {
          await firestore.runTransaction(async (transaction) => {
            const categoryRef = firestore
              .collection("events")
              .doc(event)
              .collection("categories")
              .doc(category);
            const categoryResult = (await transaction.get(categoryRef)).data();
            const stock = categoryResult && categoryResult.stock;
            const sold = categoryResult && categoryResult.sold;

            if (stock === 0 || stock - sold < 1) {
              // 在庫なしの返金処理
              await stripe.refunds.create({
                payment_intent: intent.id,
                refund_application_fee: true,
                reverse_transfer: true,
              });
              throw new NoStockError(
                "在庫がありませんでした。返金手続きが行われました。"
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
          if (e instanceof NoStockError) {
            error = e.message;
          } else {
            error = "不明なエラーが発生しました。";
          }
          console.log(`${e}:`, intent.id);
        }
        // 決済履歴追加
        firestore.collection("payments").add({
          event,
          category,
          seller,
          buyer,
          accepted: false,
          stripe: intent.id,
          error,
        });
        break;
      case "payment_intent.payment_failed":
        intent = webhockEvent.data.object as Stripe.PaymentIntent;
        const message =
          intent.last_payment_error && intent.last_payment_error.message;
        console.error("Failed:", intent.id, message);
        firestore.collection("payments").add({
          event,
          category,
          seller,
          buyer,
          accepted: false,
          stripe: intent.id,
          error: "支払いが拒否されました。他の支払い方法をお試しください。",
        });
        break;
    }
  } catch (e) {
    console.error(e);
  }

  res.status(200).end();
}

export default Webhock