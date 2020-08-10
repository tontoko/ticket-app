import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import { NextApiHandler } from "next";

const sendRefundRequest: NextApiHandler = async (req, res) => {
  const { firestore } = await initFirebaseAdmin()
  const { 
    reason,
    reasonText,
    detailText,
    targetUser,
    paymentId
  } = req.body
  const result = await firestore.collection("refunds").add({
    reason,
    reasonText,
    detailText,
    targetUser,
    paymentId,
  });
  const text =
    targetUser === "admin"
      ? "ユーザーから調査依頼がありました。"
      : "あなたが主催するイベントに対して返金が申請されました。3日以内に対処しない場合、自動的に返金されます。";
  const url =
    targetUser === "admin" ? "" : `/refunds/${result.id}`;
  await firestore
    .collection("users")
    .doc(targetUser)
    .collection("notifies")
    .doc(result.id)
    .set({
      text,
      url,
      read: false,
    });
  res.status(200).end()
}

export default sendRefundRequest