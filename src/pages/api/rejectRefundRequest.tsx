import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import { NextApiHandler } from "next";

const sendRefundRequest: NextApiHandler = async (req, res) => {
  const { firestore, firebase } = await initFirebaseAdmin()
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

  if (decodedIdToken.uid !== seller) return res.status(500).end()

  await firestore.collection("payments").doc(paymentId).set({
    refund: {
      rejected: true
    },
  }, { merge: true });
  await firestore.collection("contacts").add({
    category: "refund",
    text: detailText,
    info: {
      paymentId,
      reason,
    },
  });
  await firestore
    .collection("users")
    .doc(buyer)
    .collection("notifies")
    .add({
      text:
        "返金申請が却下されました。サービス管理者の審査をお待ちください。",
      url: `/users/${buyer}/payments/${paymentId}`,
      read: false,
    });
  res.status(200).end()
}

export default sendRefundRequest