import { payment_intent_succeeded } from "@/src/pages/api/stripeEndpoint";
import 'jest'
import { Stripe } from "@/src/lib/stripe";
import { category, event } from "app";
import moment from "moment";
import * as firebase from "@firebase/testing";
import { dev } from '@/ticket-app'
import stripe from "@/src/lib/stripe";
import initFirebaseAdmin from "../lib/initFirebaseAdmin";

type UserType = {
  [key:string]: {
    admin: boolean;
    stripeId: string;
  };
};
const users: UserType = {
  user1: {
    admin: false,
    stripeId: "stripe1",
  },
  user2: {
    admin: false,
    stripeId: "stripe2",
  },
  user3: {
    admin: false,
    stripeId: "stripe3",
  },
};

const events: { [key: string]: event } = {
  event1: {
    startDate: (moment(
      "2020-01-01T09"
    ).toDate() as unknown) as FirebaseFirestore.Timestamp,
    endDate: (moment(
      "2020-01-01T10"
    ).toDate() as unknown) as FirebaseFirestore.Timestamp,
    photos: [],
    placeName: "place1",
    name: "event1",
    eventDetails: "eventDetails1",
    createdUser: "user1",
  },
  event2: {
    startDate: (moment(
      "2020-01-02T09"
    ).toDate() as unknown) as FirebaseFirestore.Timestamp,
    endDate: (moment(
      "2020-01-02T10"
    ).toDate() as unknown) as FirebaseFirestore.Timestamp,
    photos: [],
    placeName: "place2",
    name: "event2",
    eventDetails: "eventDetails2",
    createdUser: "user2",
  },
};

const categories: {
  [key: string]: {
    [key: string]: category;
  };
} = {
  event1: {
    category1: {
      name: "category1",
      price: 100,
      createdUser: "user1",
      stock: 50,
      sold: 49,
      public: true,
      index: 0,
    },
    // 非公開
    category2: {
      name: "category2",
      price: 100,
      createdUser: "user1",
      stock: 50,
      sold: 49,
      public: false,
      index: 1,
    },
    // 売り切れ
    category3: {
      name: "category3",
      price: 100,
      createdUser: "user1",
      stock: 50,
      sold: 50,
      public: false,
      index: 1,
    },
  },
  event2: {
    category4: {
      name: "category4",
      price: 100,
      createdUser: "user2",
      stock: 50,
      sold: 50,
      public: true,
      index: 0,
    },
    category5: {
      name: "category5",
      price: 100,
      createdUser: "user2",
      stock: 50,
      sold: 50,
      public: true,
      index: 1,
    },
  },
};

describe("payment_intent_succeeded", () => {
  firebase.initializeTestApp({ projectId: dev.projectId })
  
  jest.spyOn(stripe.refunds, 'create').mockReturnValue(null)

  beforeEach(async () => {
    const { firestore } = await initFirebaseAdmin();
    await Promise.all(
      Object.keys(users).map(
        async (userId) =>
          await firestore
            .collection("users")
            .doc(userId)
            .set({ ...users[userId] })
      )
    );
    await Promise.all(
      Object.keys(events).map(async (eventId) => {
        await firestore
          .collection("events")
          .doc(eventId)
          .set({ ...events[eventId] });
        await Promise.all(
          Object.keys(categories[eventId]).map(
            async (categoryId) =>
              await firestore
                .collection("events")
                .doc(eventId)
                .collection("categories")
                .doc(categoryId)
                .set({ ...categories[eventId][categoryId] })
          )
        );
      })
    );
  });

  afterEach(
    async () => await firebase.clearFirestoreData({ projectId: dev.projectId })
  );

  test("should success when data correct", async () => {
    const { firestore } = await initFirebaseAdmin();
    const mockWebhockEvent: Stripe.Event = {
      id: "string",
      object: "event",
      account: "string",
      api_version: null,
      created: 1,
      data: {
        object: {
          id: 'stripeId',
          metadata: {
            event: "event1",
            category: "category1",
            seller: "user1",
            buyer: "user3",
          },
        },
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      type: "payment_intent.succeeded",
    };

    await payment_intent_succeeded(mockWebhockEvent);
    const payments = await firestore.collection("payments").get();
    payments.forEach(doc => console.log(doc.data()))
    return expect(!payments.docs[0].data().error);
  });
});

