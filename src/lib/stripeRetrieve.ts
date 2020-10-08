import initFirebaseAdmin from "./initFirebaseAdmin";
import stripe from "./stripe";

export const stripeAccounts = async (uid) => {
    const { firestore } = await initFirebaseAdmin();
    const { stripeId } = (
      await firestore.collection("users").doc(uid).get()
    ).data();
    const { individual, tos_acceptance } = await stripe.accounts.retrieve(
      stripeId
    );
    return { individual, tos_acceptance };
}

export const stripeBalance = async (uid) => {
  const { firestore } = await initFirebaseAdmin();
  const { stripeId } = (
    await firestore.collection("users").doc(uid).get()
  ).data();
  const balance = await stripe.balance.retrieve({ stripeAccount: stripeId });
  return balance
};