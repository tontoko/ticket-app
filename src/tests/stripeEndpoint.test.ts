import { payment_intent_succeeded } from "@/src/pages/api/stripeEndpoint";
import 'jest'
import { Stripe } from "@/src/lib/stripe";
import * as firebase from "@firebase/testing";
import { dev } from '@/ticket-app'
import stripe from "@/src/lib/stripe";
import initFirebaseAdmin from "../lib/initFirebaseAdmin";
import { setupBase } from "./lib/setupDB";


describe("payment_intent_succeeded", () => {
  firebase.initializeTestApp({ projectId: dev.projectId })
  let refunded = false
  const refundFn = async (props) =>
    (refunded = true) as unknown as Stripe.Response<Stripe.Refund>;
  jest.spyOn(stripe.refunds, "create").mockImplementation(refundFn)

  beforeEach(async () => {
    refunded = false
    await setupBase()
  });

  afterEach(
    async () => await firebase.clearFirestoreData({ projectId: dev.projectId })
  );

  test("payment should success when data correct", async () => {
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
    const category = (await firestore.collection('events').doc('event1').collection('categories').doc('category1').get()).data()
    expect(category.sold).toBe(50);
    expect(refunded).toBeFalsy();
    expect(payments.docs[0].data().error).toBeFalsy();
  });

  test("payment should fail when not public", async () => {
    const { firestore } = await initFirebaseAdmin();
    const mockWebhockEvent: Stripe.Event = {
      id: "string",
      object: "event",
      account: "string",
      api_version: null,
      created: 1,
      data: {
        object: {
          id: "stripeId",
          metadata: {
            event: "event1",
            category: "category2",
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
    expect(refunded).toBeTruthy();
    expect(payments.docs[0].data().error).toBe(
      "購入したチケットは非公開になりました。返金手続きが行われました。"
    );
  });

  test("payment should fail when no more stock", async () => {
    const { firestore } = await initFirebaseAdmin();
    const mockWebhockEvent: Stripe.Event = {
      id: "string",
      object: "event",
      account: "string",
      api_version: null,
      created: 1,
      data: {
        object: {
          id: "stripeId",
          metadata: {
            event: "event1",
            category: "category3",
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
    expect(refunded).toBeTruthy();
    expect(payments.docs[0].data().error).toBe(
      "在庫がありませんでした。返金手続きが行われました。"
    );
  });
});

