import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import admin from "firebase-admin";
import { NextApiHandler } from "next";

const ticketReception: NextApiHandler = async (req, res) => {
    const { body } = req
    const { firebase, firestore } = await initFirebaseAdmin();
    let decodedToken: null | admin.auth.DecodedIdToken;
    try {
        decodedToken = await firebase.auth().verifyIdToken(body.token);
    } catch(error) {
        return res.status(400).json({ error: 'ログインしていません。' });
    }

    // ユーザーuid突き合わせ
    if (decodedToken.uid !== body.seller) return res.status(400).json({ error: '認証に失敗しました。' });

    try {
        await firestore.collection("payments").doc(body.paymentId).update({
          accepted: true,
        });
        return res.status(200).json({ error: "読み取りに成功しました。" });
    } catch (error) {
        return res.status(400).json({ error: "データの更新に失敗しました。しばらくしてお試しください。" });
    }
}

export default ticketReception