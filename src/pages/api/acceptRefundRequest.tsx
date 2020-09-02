import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import { NextApiHandler } from "next";
import moment from "moment";
import stripe from "@/src/lib/stripe";
import { payment } from "app";

const sendRefundRequest: NextApiHandler = async (req, res) => {
  const { firestore, firebase, messaging } = await initFirebaseAdmin()
  const {
    reason,
    reasonText,
    detailText,
    seller,
    buyer,
    paymentId,
    token,
  } = req.body;

  const decodedIdToken =  await firebase.auth().verifyIdToken(token)

  if (decodedIdToken.uid !== buyer && decodedIdToken.uid !== seller) return res.status(500).end()

  const payment = (await firestore.collection("payments").doc(paymentId).get()).data() as payment;
  
  if (
    decodedIdToken.uid === buyer &&
    !moment(payment.createdAt.toDate()).isBefore(moment().subtract(3, "days"))
  ) {
    return res.status(500).end();
  }
  
  await stripe.refunds.create({
    payment_intent: payment.stripe,
    refund_application_fee: true,
    reverse_transfer: true,
  });

  await firestore.collection("payments").doc(paymentId).set({
    refund: {
      refunded: true
    },
  }, { merge: true });
  await firestore
    .collection("users")
    .doc(buyer)
    .collection("notifies")
    .add({
      text: "返金申請が承諾されました。入金をお待ちください。",
      url: `/users/${buyer}/payments/${paymentId}`,
      read: false,
      createdAt: new Date(),
    });
    
  res.status(200).end()
}

export default sendRefundRequest