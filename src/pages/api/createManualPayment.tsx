import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { NextApiHandler } from 'next'

const createManualPayment: NextApiHandler = async (req, res) => {
  try {
    const { body } = req
    const { eventId, newManualPayment } = body
    const { firestore } = await initFirebaseAdmin()

    await firestore.runTransaction(async (transaction) => {
      const categoryRef = firestore
        .collection('events')
        .doc(eventId)
        .collection('categories')
        .doc(newManualPayment.category)
      const manualPaymentsRef = firestore
        .collection('events')
        .doc(eventId)
        .collection('manualPayments')
        .doc(new Date().valueOf().toString())
      const targetCategory = (await transaction.get(categoryRef)).data()
      if (targetCategory.stock - targetCategory.sold < 1)
        throw new Error('チケットの在庫がありません。')
      transaction.set(manualPaymentsRef, { ...newManualPayment })
      transaction.update(categoryRef, {
        sold: targetCategory.sold + 1,
      })
    })
    res.status(200).end()
  } catch (error) {
    res.status(500).end({ error: error.message })
  }
}

export default createManualPayment
