import React, { useEffect, useState } from "react";
import {
  FormGroup,
} from "reactstrap";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import isLogin from "@/src/lib/isLogin";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import moment from "moment";
import Link from "next/link";
import Loading from "@/src/components/loading";
import { useRouter } from "next/router";
import { auth } from "@/src/lib/initFirebase";
import withAuth from "@/src/lib/withAuth";

const Show = ({ user, payment, event, category, refunded }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  
  useEffect(() => {
    if (!payment) return
    if (!router) return;
    if (payment.seller !== user.uid && payment.buyer !== user.uid) {
      (async() => (await auth()).signOut())()
      return 
    }
    setLoading(false)
  }, [router]);
  
  if (loading) return <Loading />;

  return (
    <>
      <h4 style={{ marginBottom: "1.5em" }}>購入履歴 詳細</h4>
      <FormGroup>
        <p>
          {`イベント名: `}
          <Link href={`/events/${event.id}`}>
            <a>{event.name}</a>
          </Link>
        </p>
        <p>{`チケット名: ${category.name}`}</p>
        <p>{`価格: ${category.price} 円`}</p>
        <p>{`購入日時: ${moment(payment.createdAt).format(
          "YYYY年 M月D日 H:mm"
        )}`}</p>
        <p>{`受付済み: ${payment.accepted ? "はい" : "いいえ"}`}</p>
        <p>{`返金: ${refunded ? "はい" : "いいえ"}`}</p>
      </FormGroup>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { firestore } = await initFirebaseAdmin();
  let paths = []
  await Promise.all((await firestore.collection("events").get()).docs.map(
    async (event) =>
      (await firestore.collection("payments").get()).docs.map(async (payment) => {
        return paths.push({
          params: { id: event.id, paymentId: payment.id },
        });
      })
  ));
  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { firestore } = await initFirebaseAdmin();
  const { id, paymentId } = params
  const payment = (await firestore
    .collection("payments")
    .doc(paymentId as string)
    .get()).data()

  const eventSnapShot = await firestore.collection("events").doc(payment.event).get()
  const eventData = eventSnapShot.data()
  const event = {
    ...eventData,
    startDate: eventData.startDate.toMillis(),
    endDate: eventData.endDate.toMillis(),
    id: eventSnapShot.id,
  };
  const category = (
    await firestore
      .collection("events")
      .doc(payment.event)
      .collection("categories")
      .doc(payment.category)
      .get()
  ).data();
  const refunded = (await firestore
    .collection("refunds")
    .where("refunded", '==', true)
    .get()
    ).size > 0;

  return {
    props: { payment, event, category, refunded },
    revalidate: 1,
  };
};

export default withAuth(Show)