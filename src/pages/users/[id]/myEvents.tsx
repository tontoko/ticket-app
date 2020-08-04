import React, {useState, useEffect} from 'react';
import {
  Card, CardText, CardBody,
  CardTitle, CardSubtitle, Button, Col, Row
} from 'reactstrap';
import Link from 'next/link'
import getImg from '@/src/lib/getImgSSR'
import moment from 'moment'
import stripe, { Stripe } from '@/src/lib/stripe';
import { event } from 'events';
import { firestore } from '@/src/lib/initFirebase';
import Loading from '@/src/components/loading';
import { GetStaticPaths, GetStaticProps } from 'next';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import withAuth from '@/src/lib/withAuth';

const MyEvents = ({ user, events }) => {
  const [requirements, setRequirements] = useState<Stripe.Person.Requirements | any>(null)

  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await fetch("/api/stripeAccountsRetrieve", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ uid: user.uid }),
      });
      const {individual} = await res.json();
      setRequirements(individual ? individual.requirements : null);
    })();
  }, [user]);

  const renderUserEvents = () =>
    events.map((event, i) => {
      const showDate = () => {
        const startDate = moment(event.startDate);
        const endDate = moment(event.endDate);
        if (startDate.format("YYYYMD") === endDate.format("YYYYMD")) {
          return `${startDate.format("YYYY年 M月D日  H:mm")} - ${endDate.format(
            "H:mm"
          )}`;
        } else {
          return `${startDate.format("YYYY年 M月D日  H:mm")} - ${endDate.format(
            "YYYY年  M月D日 H:mm"
          )}`;
        }
      };

      return (
        <Link key={i} href={`/events/${event.id}`}>
          <div>
            <Card style={{ cursor: "pointer" }}>
              <CardBody>
                <Row>
                  <Col sm="2" xs="3">
                    <img width="100%" src={event.photos} alt="image" />
                  </Col>
                  <Col xs="auto">
                    <CardTitle>{event.name}</CardTitle>
                    <CardSubtitle>{event.placeName}</CardSubtitle>
                    <CardText>{showDate()}</CardText>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
        </Link>
      );
    });

  return (
    <>
      <div style={{ marginTop: "1em", minHeight: "4em" }}>
        <h5>自分のイベント</h5>
        {renderUserEvents()}
      </div>
      {(() => {
        if (
          requirements &&
          !requirements.currently_due.length &&
          !requirements.errors.length &&
          !requirements.past_due.length &&
          !requirements.eventually_due.length
        ) return (
          <Row style={{ margin: 0, marginTop: "0.5em" }}>
            <Link href="/events/new">
              <Button className="ml-auto">新しいイベントを作成</Button>
            </Link>
          </Row>
        );
        return (
          <>
            <p>
              イベントを開催し、チケット販売を開始するには必要なユーザー情報を登録してください。
            </p>
            <Row style={{ margin: 0, marginTop: "2em" }}>
              <Link href={`/users/${user.uid}/edit`}>
                <Button className="ml-auto">ユーザー情報を登録する</Button>
              </Link>
            </Row>
          </>
        );
      })()}
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { firestore } = await initFirebaseAdmin();
  const paths = (await firestore.collection("users").get()).docs.map(
    (doc) => `/users/${doc.id}/myEvents`
  );

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { firestore } = await initFirebaseAdmin();
  const { id } = params;
  const result = await firestore
    .collection("events")
    .where("createdUser", "==", id)
    .get();
  const events = await Promise.all(
    result.docs.map(async (doc) => {
      const data = doc.data() as event;
      const startDate = data.startDate.toMillis();
      const endDate = data.endDate.toMillis();
      const photos =
        data.photos.length > 0
          ? await getImg(data.photos[0], id as string, "360")
          : await getImg(null, id as string, "360");
      return { ...data, startDate, endDate, photos, id: doc.id };
    })
  )

  return { props: { events }, revalidate: 1 };
};

export default withAuth(MyEvents);