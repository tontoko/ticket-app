import React, { useEffect, useState } from 'react';
import {
    Card, CardText, CardBody,
    CardTitle, CardSubtitle, Col, Row
} from 'reactstrap';
import Link from 'next/link'
import getImg from '@/src/lib/getImg'
import moment from 'moment'
import Tickets from '@/src/components/tickets';
import { event, payment } from 'app';
import { fuego, useCollection } from '@nandorojo/swr-firestore';
import withAuth from '@/src/lib/withAuth';
import Loading from '@/src/components/loading';
import { firestore } from 'firebase';

const MyTickets = ({ user }) => {
  const [myTickets, setMyTickets] = useState<FirebaseFirestore.DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: payments, loading: paymentsLoading } = useCollection<payment>(user && `payments`, {
    listen: true,
    where: ["buyer", "==", user.uid],
  });
  const { data: events, loading: eventsLoading } = useCollection<event>(
    payments && `events`,
    {
      listen: true,
      where: [
        firestore.FieldPath.documentId(),
        "in",
        Array.from(new Set(payments?.map((payment) => payment.event))),
      ], // 重複除外
    }
  );

  useEffect(() => {
    (async () => {
      if (paymentsLoading || !payments || eventsLoading || !events) return;
      if (payments.length === 0) return setLoading(false);
      setMyTickets(
        await Promise.all(
          events.map(async (event) => {
            const tickets = await Promise.all(
              payments
                .filter((payment) => payment.event === event.id)
                .map(async (payment) => {
                  const categorySnapShot = await fuego.db
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
            const startDate = event.startDate.toMillis();
            const endDate = event.endDate.toMillis();
            const photos =
              event.photos.length > 0
                ? await getImg(event.photos[0], event.createdUser, "360")
                : await getImg(null, event.createdUser, "360");
            return {
              ...event,
              startDate,
              endDate,
              tickets,
              photos,
              id: event.id,
            };
          })
        )
      );
      setLoading(false);
    })();
  }, [payments, paymentsLoading, events, eventsLoading]);
          
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
                        alt="image"
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
                    <Tickets user={user} ticket={ticket} event={event} key={ticketIndex} />
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
      </p>
      {myTickets.length === 0 && (
        <>
          <p>チケットを購入した場合、ここに表示されます。</p>
        </>
      )}
      {loading && <Loading/>}
      {renderUserTickets()}
    </div>
  );
};

export default withAuth(MyTickets)