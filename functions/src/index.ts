import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

type stripeEnv = {
  payment: {
    endpoint: {
      prod: string;
      dev: string;
    };
  };
  apikey: {
    prod: string;
    dev: string;
  };
};

admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();

const stripeEnv = functions.config().stripe as stripeEnv;
const stripeSecret =
  process.env.GCLOUD_PROJECT === "ticket-app-d3f5a"
    ? stripeEnv.apikey.prod
    : stripeEnv.apikey.dev;
// @ts-ignore
const stripe = new Stripe(stripeSecret, { apiVersion: null });

exports.createUser = functions.auth.user().onCreate(async (user) => {
  const stripeAccount = await stripe.accounts.create({
    country: "JP",
    type: "custom",
    requested_capabilities: ["card_payments", "transfers"],
    email: user.email,
  });
  const usersRef = firestore.collection("users");
  await usersRef.doc(user.uid).set({
    admin: false,
    stripeId: stripeAccount.id,
  });
});

type payment = {
    seller: string
    buyer: string
}
// TODO: paymentsページ作成
exports.refundNotify = functions.firestore.document('payments/{payment}/refunds/{refund}').onCreate(async (_snap, context) => {
    const { seller } = (await firestore.collection('payments').doc(context.params.payment).get()).data() as payment
    firestore
      .collection("users")
      .doc(seller)
      .collection("notifies")
      .doc(context.params.refund)
      .set({
        text: `あなたが主催するイベントに対して返金が申請されました。3日以内に対処しない場合、自動的に返金されます。`,
        url: `/payments/${context.params.payment}`,
        read: false,
      });
})