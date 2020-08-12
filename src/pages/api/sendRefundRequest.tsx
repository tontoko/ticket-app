import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import { NextApiHandler } from "next";

const sendRefundRequest: NextApiHandler = async (req, res) => {
  const { firestore } = await initFirebaseAdmin()
  const { 
    reason,
    reasonText,
    detailText,
    seller,
    buyer,
    paymentId,
  } = req.body
  await firestore.collection("payments").doc(paymentId).update({
    refund: {
      reason,
      reasonText,
      detailText,
    },
  });
  await firestore
    .collection("users")
    .doc(seller)
    .collection("notifies")
    .add({
      text:
        "あなたが主催するイベントに対して返金が申請されました。3日以内に対処しない場合、自動的に返金されます。",
      url: `/users/${seller}/payments/${paymentId}`,
      read: false,
    });
  await firestore
    .collection("users")
    .doc(buyer)
    .collection("notifies")
    .add({
      text:
        "返金申請が送信されました。3日以内に対処しない場合、自動的に返金されます。",
      url: `/users/${buyer}/payments/${paymentId}`,
      read: false,
    });
  res.status(200).end()
}

export default sendRefundRequest