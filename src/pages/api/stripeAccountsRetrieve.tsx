import { NextApiHandler } from "next";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import stripe from "@/src/lib/stripe";

const stripeAccountsRetrieve: NextApiHandler = async (req, res) => {
  const { firestore } = await initFirebaseAdmin();
  const {uid} = req.body
  const { stripeId } = (
    await firestore.collection("users").doc(uid).get()
  ).data();
  const { individual } = await stripe.accounts.retrieve(stripeId);
  res.status(200).json({ individual });
};

export default stripeAccountsRetrieve