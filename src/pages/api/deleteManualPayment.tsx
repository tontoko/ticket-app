import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { NextApiHandler } from 'next'

const deleteManualPayment: NextApiHandler = async (req, res) => {
  try {
    const { body } = req
    const { eventId, payment } = body
    const { firestore } = await initFirebaseAdmin()

    await firestore.runTransaction(async (transaction) => {
      const categoryRef = firestore
        .collection('events')
        .doc(eventId)
        .collection('categories')
        .doc(payment.category)
      const manualPaymentsRef = firestore
        .collection('events')
        .doc(eventId)
        .collection('manualPayments')
        .doc(payment.id)
      const targetCategory = (await transaction.get(categoryRef)).data()
      transaction.delete(manualPaymentsRef)
      transaction.update(categoryRef, {
        sold: targetCategory.sold - 1,
      })
    })
    res.status(200).end()
  } catch (error) {
    res.status(500).end({ error: error.message })
  }
}

export default deleteManualPayment
