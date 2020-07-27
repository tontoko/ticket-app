import { GetServerSideProps } from "next";
import isLogin from "@/src/lib/isLogin";
import initFirebase from "@/src/lib/initFirebase";
import {
  Row,
  Col,
  Button,
  Card,
  CardBody,
} from "reactstrap";
import { useEffect, useState } from "react";
import Loading from "@/src/components/loading";
import { useRouter } from "next/router";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import moment from "moment";
import Link from "next/link";

const Notifies = ({ user, payments, events, categories }) => {
  const router = useRouter();
  const renderPayments = () => {
    if (!payments.length) return <p>購入履歴はありません。</p>;

    return payments.map((payment, i) => {
      return (
        <Link href={`/user/payments/show/${payment.id}`} key={i}>
          <div>
            <Row>
              <Col xs="12" style={{ padding: "0", cursor: "pointer" }}>
                <Card style={{ height: "100%", width: "100%" }}>
                  <CardBody>
                    <p>{events[payment.event].name}</p>
                    <p>{`${categories[payment.category].name}: ${
                      categories[payment.category].price
                    } 円`}</p>
                    <p>
                      {moment(payment.createdAt).format("YYYY年 M月d日 H:mm")}
                    </p>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </Link>
      );
    });
  };

  return (
    <>
      <h4 style={{ marginBottom: "1em" }}>購入履歴</h4>
      {renderPayments()}
    </>
  );
};

export default Notifies;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { user } = await isLogin(ctx);
    const { firestore } = await initFirebaseAdmin()
    const events = {};
    const categories = {};
    const payments = await Promise.all((
        await firestore
        .collection("payments")
        .where("buyer", "==", user.uid)
        .get()
    ).docs.map(async (doc) => {
        const data = doc.data();
        const eventId = data.event;
        const catId = data.category;
        if (!Object.keys(events).includes(eventId)) {
          const data = (
            await firestore.collection("events").doc(eventId).get()
          ).data();
          const startDate = data.startDate.seconds;
          const endDate = data.endDate.seconds;
          events[eventId] = {
            ...data,
            startDate,
            endDate,
          };
        }
        if (!Object.keys(categories).includes(catId)) {
          categories[catId] = (
            await firestore
              .collection("events")
              .doc(eventId)
              .collection("categories")
              .doc(catId)
              .get()
          ).data();
        }
        return {
          ...data,
          id: doc.id,
          createdAt: doc.createTime.seconds * 1000,
        };
    }));
    return { props: { user, payments, events, categories } };
};
