import React, { useEffect, useState, useMemo } from "react";
import {
  FormGroup, Button,
} from "reactstrap";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import moment from "moment";
import Link from "next/link";
import Loading from "@/src/components/loading";
import { useRouter } from "next/router";
import withAuth from "@/src/lib/withAuth";
import { fuego, useDocument } from "@nandorojo/swr-firestore";
import { event, payment, category } from "app";

const Show = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  const { data: payment, loading: paymentLoading } = useDocument<payment>(router && `payments/${router.query.paymentId}`, {
    listen: true
  })
  const { data: event, loading: eventLoading } = useDocument<event>(payment && `events/${payment.event}`, {
    listen: true,
  });
  const { data: category, loading: categoryLoading } = useDocument<category>(
    event && payment && `events/${payment.event}/categories/${payment.category}`,
    {
      listen: true,
      parseDates: ['createTime']
    }
  );
  
  useEffect(() => {
    if (!payment) return;
    if (payment.seller !== user.uid && payment.buyer !== user.uid) {
      (async () => fuego.auth().signOut())();
      return;
    }
    setLoading(false);
  }, [payment]);

  const refundForm = useMemo(() => {
    if (payment && !payment.refund && payment.buyer === user.uid) {
      return (
        <Link href={`/users/${user.uid}/payments/${payment.id}`}>
          <Button color="danger">返金申請する</Button>
        </Link>
      );
    } 
  }, [payment])

  if (loading || paymentLoading || eventLoading || categoryLoading) return <Loading />;
  
  return (
    <>
      <h4 style={{ marginBottom: "1.5em" }}>購入履歴 詳細</h4>
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
      <h5>返金</h5>
      {refundForm}
    </>
  );
};

// export const getStaticPaths: GetStaticPaths = async () => {
//   const { firestore } = await initFirebaseAdmin();
//   let paths = []
//   await Promise.all((await firestore.collection("events").get()).docs.map(
//     async (event) =>
//       (await firestore.collection("payments").get()).docs.map(async (payment) => {
//         return paths.push({
//           params: { id: event.id, paymentId: payment.id },
//         });
//       })
//   ));
//   return { paths, fallback: true };
// };

// export const getServerSideProps: GetServerSideProps = async ({ query }) => {
//   const { firestore } = await initFirebaseAdmin();
//   const { id, paymentId } = query
//   const payment = (await firestore
//     .collection("payments")
//     .doc(paymentId as string)
//     .get()).data()

//   const eventSnapShot = await firestore.collection("events").doc(payment.event).get()
//   const eventData = eventSnapShot.data()
//   const event = {
//     ...eventData,
//     startDate: eventData.startDate.toMillis(),
//     endDate: eventData.endDate.toMillis(),
//     id: eventSnapShot.id,
//   };
//   const category = (
//     await firestore
//       .collection("events")
//       .doc(payment.event)
//       .collection("categories")
//       .doc(payment.category)
//       .get()
//   ).data();

//   return {
//     props: { payment, event, category },
//     // revalidate: 1,
//   };
// };

export default withAuth(Show)