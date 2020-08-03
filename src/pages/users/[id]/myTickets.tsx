import React, { useEffect, useState } from 'react';
import {
    Card, CardText, CardBody,
    CardTitle, CardSubtitle, Col, Row
} from 'reactstrap';
import Link from 'next/link'
import getImg from '@/src/lib/getImg'
import moment from 'moment'
import Tickets from '@/src/components/tickets';
import { event } from 'events';
import { useCollectionData } from "react-firebase-hooks/firestore";
import { firebase, firestore } from '@/src/lib/initFirebase';
import withAuth from '@/src/lib/withAuth';
import Loading from '@/src/components/loading';

const MyTickets = ({ user }) => {
  const [payments, loading] = useCollectionData<
    FirebaseFirestore.DocumentData
  >(firestore.collection("payments").where("buyer", "==", user.uid), {
    idField: "id",
  });
  const [myTickets, setMyTickets] = useState<FirebaseFirestore.DocumentData[]>([]);

  useEffect(() => {
    if (loading) return;
    (async () => {
      if (payments.length > 0) {
        const myEventsIds = Array.from(
          new Set(payments.map((payment) => payment.event))
        ); // 重複除外
        const events = (await firestore
          .collection("events")
          .where(firebase.firestore.FieldPath.documentId(), "in", myEventsIds).get()).docs;
        setMyTickets(
          await Promise.all(
            events.map(async (event) => {
              const tickets = await Promise.all(
                payments
                  .filter((payment) => payment.event === event.id)
                  .map(async (payment) => {
                    const categorySnapShot = await firestore
                      .collection("events")
                      .doc(event.id)
                      .collection("categories")
                      .doc(payment.category)
                      .get();
                    return {
                      ...categorySnapShot.data(),
                      categoryId: categorySnapShot.id,
                      paymentId: payment.id,
                      accepted: payment.accepted,
                      error: payment.error,
                      buyer: payment.buyer,
                      seller: payment.seller,
                    };
                  })
              );
              const data = event.data() as event;
              const startDate = data.startDate.toMillis();
              const endDate = data.endDate.toMillis();
              const photos =
                data.photos.length > 0
                  ? await getImg(data.photos[0], data.createdUser, "360")
                  : await getImg(null, data.createdUser, "360");
              return {
                ...data,
                startDate,
                endDate,
                tickets,
                photos,
                id: event.id,
              };
            })
          )
        );
      }
    })();
  }, [payments]);
          
  const renderUserTickets = () =>
    myTickets.map((event, i) => {
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
        <div key={i}>
          <Card>
            <CardBody>
              <Link href={`/events/${event.id}`}>
                <div>
                  <Row style={{ marginBottom: "1em", cursor: "pointer" }}>
                    <Col sm="2" xs="3">
                      <img
                        width="100%"
                        src={event.photos}
                        alt="Card image cap"
                        style={{ cursor: "pointer" }}
                      />
                    </Col>
                    <Col>
                      <CardTitle>{event.name}</CardTitle>
                      <CardSubtitle>{event.placeName}</CardSubtitle>
                      <CardText>{showDate()}</CardText>
                    </Col>
                  </Row>
                </div>
              </Link>
              <Row>
                <Col style={{ padding: "0 0.5em" }}>
                  {event.tickets.map((ticket, ticketIndex) => (
                    <Tickets ticket={ticket} event={event} key={ticketIndex} />
                  ))}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </div>
      );
    });

  return (
    <div style={{ marginTop: "1em", minHeight: "4em" }}>
      <h5>購入済みチケット</h5>
      <p>
        購入処理に時間がかかる場合があります。
        <br />
        購入したチケットが表示されていない場合は
        <a href="#" onClick={() => location.reload()}>
          画面の更新
        </a>
        をお試しください。
      </p>
      {myTickets.length === 0 && (
        <>
          <p>チケットを購入した場合、ここに表示されます。</p>
        </>
      )}
      {loading && <Loading style={{ position: 'relative' }} />}
      {renderUserTickets()}
    </div>
  );
};

export default withAuth(MyTickets)