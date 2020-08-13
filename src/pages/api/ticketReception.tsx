import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import admin from "firebase-admin";
import { NextApiHandler } from "next";

const ticketReception: NextApiHandler = async (req, res) => {
    const { firebase, firestore } = await initFirebaseAdmin();
    let decodedToken: null | admin.auth.DecodedIdToken;

    const { token, paymentId, seller } = req.body

    try {
        decodedToken = await firebase.auth().verifyIdToken(token);
    } catch(error) {
        return res.status(400).json({ error: 'ログインしていません。' });
    }

    // ユーザーuid突き合わせ
    if (decodedToken.uid !== seller) return res.status(400).json({ error: '認証に失敗しました。' });

    try {
        await firestore.collection("payments").doc(paymentId).update({
          accepted: true,
        });
        return res.status(200).json({ msg: "読み取りに成功しました。" });
    } catch (error) {
        return res.status(400).json({ error: "データの更新に失敗しました。しばらくしてお試しください。" });
    }
}

export default ticketReception