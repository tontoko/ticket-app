import {
  payment_intent_payment_failed,
  payment_intent_succeeded,
} from '@/src/pages/api/stripeEndpoint'
import 'jest'
import { Stripe } from '@/src/lib/stripe'
import * as firebase from '@firebase/testing'
import { dev } from '@/ticket-app'
import stripe from '@/src/lib/stripe'
import initFirebaseAdmin from '../lib/initFirebaseAdmin'
import { setupBase } from './lib/setupDB'

describe('stripeEndpoint', () => {
  let refunded = false
  beforeEach(async () => {
    await firebase.clearFirestoreData({ projectId: dev.projectId })
    await setupBase()
    refunded = false
  })
  describe('payment_intent_succeeded', () => {
    const refundFn = async () => ((refunded = true) as unknown) as Stripe.Response<Stripe.Refund>
    jest.spyOn(stripe.refunds, 'create').mockImplementation(refundFn)

    test('payment should success when data correct', async () => {
      const { firestore } = await initFirebaseAdmin()
      const mockWebhockEvent: Stripe.Event = {
        id: 'string',
        object: 'event',
        account: 'string',
        api_version: null,
        created: 1,
        data: {
          object: {
            id: 'stripeId',
            metadata: {
              event: 'event1',
              category: 'category1',
              seller: 'user1',
              buyer: 'user3',
            },
          },
        },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      }

      await payment_intent_succeeded(mockWebhockEvent)
      const payments = await firestore.collection('payments').get()
      const category = (
        await firestore
          .collection('events')
          .doc('event1')
          .collection('categories')
          .doc('category1')
          .get()
      ).data()
      expect(category.sold).toBe(50)
      expect(refunded).toBeFalsy()
      expect(payments.docs[0].data().error).toBeFalsy()
    })

    test('payment should fail when not public', async () => {
      const { firestore } = await initFirebaseAdmin()
      const mockWebhockEvent: Stripe.Event = {
        id: 'string',
        object: 'event',
        account: 'string',
        api_version: null,
        created: 1,
        data: {
          object: {
            id: 'stripeId',
            metadata: {
              event: 'event1',
              category: 'category2',
              seller: 'user1',
              buyer: 'user3',
            },
          },
        },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      }

      await payment_intent_succeeded(mockWebhockEvent)
      const payments = await firestore.collection('payments').get()
      expect(refunded).toBeTruthy()
      expect(payments.docs[0].data().error).toBe(
        '購入したチケットは非公開になりました。返金手続きが行われました。',
      )
    })

    test('payment should fail when no more stock', async () => {
      const { firestore } = await initFirebaseAdmin()
      const mockWebhockEvent: Stripe.Event = {
        id: 'string',
        object: 'event',
        account: 'string',
        api_version: null,
        created: 1,
        data: {
          object: {
            id: 'stripeId',
            metadata: {
              event: 'event1',
              category: 'category3',
              seller: 'user1',
              buyer: 'user3',
            },
          },
        },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      }

      await payment_intent_succeeded(mockWebhockEvent)
      const payments = await firestore.collection('payments').get()
      expect(refunded).toBeTruthy()
      expect(payments.docs[0].data().error).toBe(
        '在庫がありませんでした。返金手続きが行われました。',
      )
    })
  })

  describe('payment_intent_payment_faild', () => {
    test('should register new payment with errorInfo', async () => {
      const { firestore } = await initFirebaseAdmin()
      const mockWebhockEvent: Stripe.Event = {
        id: 'string',
        object: 'event',
        account: 'string',
        api_version: null,
        created: 1,
        data: {
          object: {
            id: 'stripeId',
            metadata: {
              event: 'event1',
              category: 'category1',
              seller: 'user1',
              buyer: 'user3',
            },
            last_payment_error: {
              message: 'test_error_message',
            },
          },
        },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.failed',
      }
      await payment_intent_payment_failed(mockWebhockEvent)
      const payments = await firestore.collection('payments').get()
      expect(payments.docs[0].data().error).toBe(
        '支払いが拒否されました。他の支払い方法をお試しください。',
      )
      expect(payments.docs[0].data().errorInfo).toBe('test_error_message')
    })
  })
})
