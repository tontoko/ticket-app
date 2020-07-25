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
  try {
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
  } catch(e) {
    firestore
      .collection("users")
      .doc('admin')
      .collection("notifies")
      .add({
        text: `次のユーザーの登録時にstripeIDの作成に失敗しました: ${user.uid}\nemail: ${user.email}`,
        url: '',
        read: false,
      });
    admin.auth().deleteUser(user.uid)
  }
});

exports.refundNotify = functions.firestore.document('payments/{payment}/refunds/{refund}').onCreate(async (snap, context) => {
    const { targetUser } = snap.data();
    const text =
      targetUser === "admin"
        ? "ユーザーから調査依頼がありました。"
        : "あなたが主催するイベントに対して返金が申請されました。3日以内に対処しない場合、自動的に返金されます。";
    firestore
      .collection("users")
      .doc(targetUser)
      .collection("notifies")
      .doc(context.params.refund)
      .set({
        text,
        url: `/user/payments/${context.params.payment}`,
        read: false,
      });
})