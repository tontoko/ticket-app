import 'jest'
import * as testFirebase from '@firebase/rules-unit-testing'
import { dev } from '@/ticket-app'
import { setupBase } from './lib/setupDB'
import createManualPayment from '../pages/api/createManualPayment'
import changeManualPayment from '../pages/api/changeManualPayment'
import { NextApiRequest, NextApiResponse } from 'next'
import deleteManualPayment from '../pages/api/deleteManualPayment'
import firebase from 'firebase-admin'

describe('manualPayment', () => {
  const app = testFirebase.initializeAdminApp({ projectId: dev.projectId })
  const firestore = app.firestore()
  jest.spyOn(firebase.auth(), 'verifyIdToken').mockImplementation(async () => {
    return null
  })

  const createReq = (eventId, categoryId) => {
    return {
      body: {
        eventId,
        newManualPayment: {
          category: categoryId,
        },
      },
    }
  }

  const changeReq = (eventId, beforeCategoryId, newCategoryId, manualPaymentId) => {
    return {
      body: {
        eventId,
        beforeValue: {
          category: beforeCategoryId,
          id: manualPaymentId,
        },
        newValue: {
          category: newCategoryId,
          id: manualPaymentId,
        },
      },
    }
  }

  const deleteReq = (eventId, categoryId, manualPaymentId) => {
    return {
      body: {
        eventId,
        manualPayment: {
          category: categoryId,
          id: manualPaymentId,
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
    end() {
      return this
    }
    json(responce?: { error: string }) {
      this.error = responce?.error
      return this
    }
  }
  let res = new Res()

  beforeEach(async () => {
    res = new Res()
    return await setupBase(firestore)
  })
  afterEach(async () => await testFirebase.clearFirestoreData({ projectId: dev.projectId }))

  describe('create', () => {
    test('should success create', async () => {
      await createManualPayment(
        createReq('event1', 'category1') as NextApiRequest,
        (res as unknown) as NextApiResponse,
      )
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
      expect(res.error).toBeFalsy()
    })

    test('should not create when no more stock', async () => {
      await createManualPayment(
        createReq('event1', 'category3') as NextApiRequest,
        (res as unknown) as NextApiResponse,
      )
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

  describe('change', () => {
    test('should success change', async () => {
      await changeManualPayment(
        changeReq('event1', 'category3', 'category1', 'manualPayment3') as NextApiRequest,
        (res as unknown) as NextApiResponse,
      )
      const category1 = (
        await firestore
          .collection('events')
          .doc('event1')
          .collection('categories')
          .doc('category1')
          .get()
      ).data()
      expect(category1.sold).toBe(50)
      const category3 = (
        await firestore
          .collection('events')
          .doc('event1')
          .collection('categories')
          .doc('category3')
          .get()
      ).data()
      expect(category3.sold).toBe(49)
      expect(res.statusCode).toBe(200)
      expect(res.error).toBeFalsy()
    })

    test('should not create when no more stock', async () => {
      await changeManualPayment(
        changeReq('event1', 'category1', 'category3', 'manualPayment1') as NextApiRequest,
        (res as unknown) as NextApiResponse,
      )
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

  describe('delete', () => {
    test('should success delete', async () => {
      await deleteManualPayment(
        deleteReq('event1', 'category1', 'manualPayment1') as NextApiRequest,
        (res as unknown) as NextApiResponse,
      )
      const category1 = (
        await firestore
          .collection('events')
          .doc('event1')
          .collection('categories')
          .doc('category1')
          .get()
      ).data()
      expect(category1.sold).toBe(48)
      expect(res.statusCode).toBe(200)
      expect(res.error).toBeFalsy()
    })
  })
})
