import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { NextApiHandler } from 'next'

const changeManualPayment: NextApiHandler = async (req, res) => {
  try {
    const { body } = req
    const { eventId, beforeValue, newValue } = body
    const { firestore } = await initFirebaseAdmin()

    await firestore.runTransaction(async (transaction) => {
      const newCategoryRef = firestore
        .collection('events')
        .doc(eventId)
        .collection('categories')
        .doc(newValue.category)
      const beforeCategoryRef = firestore
        .collection('events')
        .doc(eventId)
        .collection('categories')
        .doc(beforeValue.category)
      const manualPaymentsRef = firestore
        .collection('events')
        .doc(eventId)
        .collection('manualPayments')
        .doc(beforeValue.id)
      const newCategory = (await transaction.get(newCategoryRef)).data()
      const beforeCategory = (await transaction.get(beforeCategoryRef)).data()

      transaction.update(manualPaymentsRef, { ...newValue })

      if (newValue.category !== beforeValue.category) {
        if (newCategory.stock - newCategory.sold < 1)
          throw new Error('チケットの在庫がありません。')
        transaction.update(newCategoryRef, {
          sold: newCategory.sold + 1,
        })
        transaction.update(beforeCategoryRef, {
          sold: beforeCategory.sold - 1,
        })
      }
    })
    res.status(200).end()
  } catch (error) {
    res.status(500).end({ error: error.message })
  }
}

export default changeManualPayment
