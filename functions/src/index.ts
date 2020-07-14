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
