import React, {  } from "react";
import {
  FormGroup,
} from "reactstrap";
import { GetServerSideProps } from "next";
import isLogin from "@/src/lib/isLogin";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import moment from "moment";
import Link from "next/link";

export default ({ payment, event, category, refunded }) => {

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
          "YYYY年 M月d日 H:mm"
        )}`}</p>
        <p>{`受付済み: ${payment.accepted ? "はい" : "いいえ"}`}</p>
        <p>{`返金: ${refunded ? "はい" : "いいえ"}`}</p>
      </FormGroup>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { user, query, res } = await isLogin(ctx, "redirect");
  const { firestore } = await initFirebaseAdmin();
  const paymentSnapShot = await firestore.collection('payments').doc(query.paymentId as string).get()
  const payment = { ...paymentSnapShot.data(), createdAt: paymentSnapShot.createTime.seconds*1000 } as any
  if (user && payment.seller !== user.uid && payment.buyer !== user.uid) {
    res.writeHead(302, {
      Location: `/login`,
    });
    res.end();
    return { props: {} }
  }

  const eventSnapShot = (
    await firestore.collection("events").doc(payment.event).get()
  )
  const eventData = eventSnapShot.data()
  const event = {
    ...eventData,
    startDate: eventData.startDate.seconds * 1000,
    endDate: eventData.endDate.seconds * 1000,
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
    .collection("payments")
    .doc(query.paymentId as string)
    .collection("refunds")
    .where("refunded", '==', true)
    .get()
    ).size > 0;
  return {
    props: { user, query, payment, event, category, refunded },
  };
};
