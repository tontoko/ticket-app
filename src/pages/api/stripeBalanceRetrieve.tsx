import { NextApiHandler } from "next";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import stripe from "@/src/lib/stripe";

const stripeAccountsRetrieve: NextApiHandler = async (req, res) => {
  const { firestore } = await initFirebaseAdmin();
  const { stripeId } = (
    await firestore.collection("users").doc(req.body.uid).get()
  ).data();
  const balance = await stripe.balance.retrieve({ stripeAccount: stripeId });
  res.status(200).json({ balance });
};

export default stripeAccountsRetrieve