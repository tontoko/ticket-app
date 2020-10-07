import 'jest'
import * as firebase from '@firebase/testing'
import { dev } from '@/ticket-app'
import initFirebaseAdmin from '../lib/initFirebaseAdmin'
import { setupBase } from './lib/setupDB'
import createManualPayment from '../pages/api/createManualPayment'

describe('manualPayment', () => {
  const req = (eventId, categoryId) => {
    return {
      body: {
        eventId,
        newManualPayment: {
          category: categoryId,
        },
      },
    }
  }
  class Res {
    statusCode: number = null
    error: string = null
    status(code: number) {
      this.statusCode = code
      return this
    }
    end(responce?: { error: string }) {
      this.error = responce?.error
      return this
    }
  }
  let res = new Res()

  beforeEach(async () => {
    await setupBase()
    res = new Res()
  })

  afterEach(async () => await firebase.clearFirestoreData({ projectId: dev.projectId }))

  describe('create', () => {
    test('should success create', async () => {
      const { firestore } = await initFirebaseAdmin()
      // @ts-ignore
      await createManualPayment(req('event1', 'category1'), res)
      const category = (
        await firestore
          .collection('events')
          .doc('event1')
          .collection('categories')
          .doc('category1')
          .get()
      ).data()
      expect(category.sold).toBe(50)
      expect(res.statusCode).toBe(200)
      expect(res.error).toBeUndefined()
    })

    test('should not create when no more stock', async () => {
      const { firestore } = await initFirebaseAdmin()
      // @ts-ignore
      await createManualPayment(req('event1', 'category3'), res)
      const category = (
        await firestore
          .collection('events')
          .doc('event1')
          .collection('categories')
          .doc('category3')
          .get()
      ).data()
      expect(category.sold).toBe(50)
      expect(res.statusCode).toBe(500)
      expect(res.error).toBe('チケットの在庫がありません。')
    })
  })
})
