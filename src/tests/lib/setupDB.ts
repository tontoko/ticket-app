import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { category, event, manualPayment } from 'app'
import moment from 'moment'

type UserType = {
  [key: string]: {
    admin: boolean
    stripeId: string
  }
}
const users: UserType = {
  user1: {
    admin: false,
    stripeId: 'stripe1',
  },
  user2: {
    admin: false,
    stripeId: 'stripe2',
  },
  user3: {
    admin: false,
    stripeId: 'stripe3',
  },
}

const events: { [key: string]: event } = {
  event1: {
    startDate: (moment('2020-01-01T09').toDate() as unknown) as FirebaseFirestore.Timestamp,
    endDate: (moment('2020-01-01T10').toDate() as unknown) as FirebaseFirestore.Timestamp,
    photos: [],
    placeName: 'place1',
    name: 'event1',
    eventDetail: 'eventDetail1',
    createdUser: 'user1',
  },
  event2: {
    startDate: (moment('2020-01-02T09').toDate() as unknown) as FirebaseFirestore.Timestamp,
    endDate: (moment('2020-01-02T10').toDate() as unknown) as FirebaseFirestore.Timestamp,
    photos: [],
    placeName: 'place2',
    name: 'event2',
    eventDetail: 'eventDetail2',
    createdUser: 'user2',
  },
}

const categories: {
  [key: string]: {
    [key: string]: category
  }
} = {
  event1: {
    category1: {
      name: 'category1',
      price: 100,
      createdUser: 'user1',
      stock: 50,
      sold: 49,
      public: true,
      index: 0,
    },
    // 非公開
    category2: {
      name: 'category2',
      price: 100,
      createdUser: 'user1',
      stock: 50,
      sold: 49,
      public: false,
      index: 1,
    },
    // 売り切れ
    category3: {
      name: 'category3',
      price: 100,
      createdUser: 'user1',
      stock: 50,
      sold: 50,
      public: false,
      index: 1,
    },
  },
  event2: {
    category4: {
      name: 'category4',
      price: 100,
      createdUser: 'user2',
      stock: 50,
      sold: 50,
      public: true,
      index: 0,
    },
    category5: {
      name: 'category5',
      price: 100,
      createdUser: 'user2',
      stock: 50,
      sold: 50,
      public: true,
      index: 1,
    },
  },
}

const manualPayments: { [key: string]: { [key: string]: manualPayment } } = {
  event1: {
    manualPayment1: {
      id: 'manualPayment1',
      name: 'test1',
      paid: false,
      category: 'category1',
    },
    manualPayment2: {
      id: 'manualPayment2',
      name: 'test1',
      paid: true,
      category: 'category2',
    },
    manualPayment3: {
      id: 'manualPayment3',
      name: 'test1',
      paid: true,
      category: 'category3',
    },
  },
  event2: {},
  event3: {},
}

export const setupBase = async (firestore: firebase.firestore.Firestore) => {
  await Promise.all(
    Object.keys(users).map(
      async (userId) =>
        await firestore
          .collection('users')
          .doc(userId)
          .set({ ...users[userId] }),
    ),
  )
  await Promise.all(
    Object.keys(events).map(async (eventId) => {
      await firestore
        .collection('events')
        .doc(eventId)
        .set({ ...events[eventId] })
      await Promise.all(
        Object.keys(manualPayments[eventId]).map(
          async (manualPaymentId) =>
            await firestore
              .collection('events')
              .doc(eventId)
              .collection('manualPayments')
              .doc(manualPaymentId)
              .set({
                ...manualPayments[eventId][manualPaymentId],
              }),
        ),
      )
      await Promise.all(
        Object.keys(categories[eventId]).map(
          async (categoryId) =>
            await firestore
              .collection('events')
              .doc(eventId)
              .collection('categories')
              .doc(categoryId)
              .set({ ...categories[eventId][categoryId] }),
        ),
      )
    }),
  )
}
