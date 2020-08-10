import { GetStaticPaths, GetStaticProps, GetServerSideProps } from "next";
import { Row, Col, Card, CardBody } from "reactstrap";
import { useRouter } from "next/router";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import moment from "moment";
import Link from "next/link";
import withAuth from "@/src/lib/withAuth";
import { useEffect, useState } from "react";
import { auth } from "firebase";
import Loading from "@/src/components/loading";

const Refunds = ({ user, refunds }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      if (!user || !router) return;
      if (router && router.query.userId !== user.uid) {
        (async () => await auth().signOut())()
        return
      }
      console.log(refunds)
      setLoading(false)
  }, [user, router])
  
  const renderPayments = () => {
    if (!refunds.length) return <p>返金申請はありません。</p>;

    return refunds.map((refund, i) => {
      return (
        <Link href={`/refunds/${router}`} key={i}>
          <div>
            <Row>
              <Col xs="12" style={{ padding: "0", cursor: "pointer" }}>
                <Card style={{ height: "100%", width: "100%" }}>
                  <CardBody>
                    <p>{refund.event.name}</p>
                    <p>{`${refund.category.name}: ${refund.category.price} 円`}</p>
                    <p>
                      {moment(refund.createdAt).format("YYYY年 M月D日 H:mm")}
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

  if (loading) <Loading/>

  return (
    <>
      <h4 style={{ marginBottom: "1em" }}>返金申請履歴</h4>
      {renderPayments()}
    </>
  );
};

export default withAuth(Refunds);

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { firestore } = await initFirebaseAdmin();
  const { userId } = query;
  const refunds = await Promise.all((await firestore.collection("refunds").where("targetUser", "==", userId).get()).docs.map(async doc => {
      const data = doc.data();
      const payment = (await firestore.collection("payments").doc(data.paymentId).get()).data()
      const eventData = (await firestore.collection("events").doc(payment.event).get()).data()
      const event = {
        ...eventData,
        startDate: eventData.startDate.toMillis(),
        endDate: eventData.endDate.toMillis(),
      };
      const category = (
        await firestore
          .collection("events")
          .doc(payment.event)
          .collection("categories")
          .doc(payment.category)
          .get()
      ).data();
      const createdAt = doc.createTime.toMillis()
      return { ...data, createdAt, payment, category, event, id: doc.id };
    }))

  return { 
      props: { refunds }, 
    //   revalidate: 1 
  };
};