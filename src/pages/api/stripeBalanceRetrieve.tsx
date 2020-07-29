import { NextApiHandler } from "next";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import stripe from "@/src/lib/stripe";
import { stripeBalance } from "@/src/lib/stripeRetrieve";

const stripeAccountsRetrieve: NextApiHandler = async (req, res) => {
  const balance = stripeBalance(req.body.uid)
  res.status(200).json({ balance })
};

export default stripeAccountsRetrieve