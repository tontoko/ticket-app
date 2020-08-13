import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import { NextApiHandler } from "next";
import { payment } from "app";

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

  if (decodedIdToken.uid !== buyer) return res.status(500).end()

  const data = (await firestore.collection("payments").doc(paymentId).get()).data() as payment;
  if (data.refund && (data.refund.refunded || data.refund.rejected)) return res.status(500).end();

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
        "あなたが主催するイベントに対して返金が申請されました。3日以内に対処しない場合、返金されます。",
      url: `/users/${seller}/payments/${paymentId}`,
      read: false,
    });
  await firestore
    .collection("users")
    .doc(buyer)
    .collection("notifies")
    .add({
      text:
        "返金申請が送信されました。3日以内に対処されない場合、再度申請することで返金されます。",
      url: `/users/${buyer}/payments/${paymentId}`,
      read: false,
    });
  res.status(200).end()
}

export default sendRefundRequest