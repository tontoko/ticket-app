import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import admin from 'firebase-admin'
import { NextApiHandler } from 'next'
import { payment } from 'app'

const ticketReception: NextApiHandler = async (req, res) => {
  const { firebase, firestore } = await initFirebaseAdmin()
  let decodedToken: null | admin.auth.DecodedIdToken

  const { token, paymentId, seller } = req.body

  try {
    decodedToken = await firebase.auth().verifyIdToken(token)
  } catch (error) {
    return res.status(400).json({ error: 'ログインしていません。' })
  }

  // ユーザーuid突き合わせ
  if (decodedToken.uid !== seller) return res.status(400).json({ error: '認証に失敗しました。' })

  const payment = (await firestore.collection('payments').doc(paymentId).get()).data() as payment
  if (payment.accepted) return res.status(400).json({ error: '受付済みです。' })
  if (payment.refund?.refunded) return res.status(400).json({ error: '返金済みです。' })

  try {
    await firestore.collection('payments').doc(paymentId).update({
      accepted: true,
    })
    return res.status(200).json({ msg: '読み取りに成功しました。' })
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'データの更新に失敗しました。しばらくしてお試しください。' })
  }
}

export default ticketReception
