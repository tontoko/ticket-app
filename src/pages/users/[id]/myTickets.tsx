import React, { useEffect, useState } from 'react';
import {
    Card, CardText, CardBody,
    CardTitle, CardSubtitle, Col, Row
} from 'reactstrap';
import Link from 'next/link'
import getImg from '@/src/lib/getImg'
import moment from 'moment'
import Tickets from '@/src/components/tickets';
import { fuego, useCollection } from '@nandorojo/swr-firestore';
import withAuth from '@/src/lib/withAuth';
import Loading from '@/src/components/loading';
import createTicketsData from '@/src/lib/createTicketsData';
import { event, tickets, payment } from "app";
import firebase from 'firebase/app';

const MyTickets = ({ user }) => {
  const [myTicketsPerEvents, setMyTicketsPerEvents] = useState<
    { tickets: tickets, event: any, photos: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { data: payments, loading: paymentsLoading } = useCollection<payment>(
    user && `payments`,
    {
      listen: true,
      where: ["buyer", "==", user.uid],
    }
  );
  const { data: events, loading: eventsLoading } = useCollection<event>(
    payments && `events`,
    {
      listen: true,
      where: [
        firebase.firestore.FieldPath.documentId(),
        "in",
        Array.from(new Set(payments?.map((payment) => payment.event))),
      ], // 重複除外
    }
  );

  useEffect(() => {
    (async () => {
      if (paymentsLoading || !payments || eventsLoading || !events) return;
      if (payments.length === 0) return setLoading(false);
      setMyTicketsPerEvents(await createTicketsData(events, payments));
      setLoading(false);
    })();
  }, [payments, paymentsLoading, events, eventsLoading]);
  //TODO: 時期順にソート
  const renderUserTickets = () =>
    myTicketsPerEvents.map((ticketsPerEvent, i) => {
      const showDate = () => {
        const startDate = moment(ticketsPerEvent.event.startDate.toDate());
        const endDate = moment(ticketsPerEvent.event.endDate.toDate());
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
              <Link href={`/events/${ticketsPerEvent.event.id}`}>
                <div>
                  <Row style={{ marginBottom: "1em", cursor: "pointer" }}>
                    <Col sm="2" xs="3">
                      <img
                        width="100%"
                        src={ticketsPerEvent.photos}
                        alt="image"
                        style={{ cursor: "pointer" }}
                      />
                    </Col>
                    <Col>
                      <CardTitle>{ticketsPerEvent.event.name}</CardTitle>
                      <CardSubtitle>
                        {ticketsPerEvent.event.placeName}
                      </CardSubtitle>
                      <CardText>{showDate()}</CardText>
                    </Col>
                  </Row>
                </div>
              </Link>
              <Row>
                <Col style={{ padding: "0 0.5em" }}>
                  {ticketsPerEvent.tickets.map((ticket, ticketIndex) => (
                    <Tickets
                      user={user}
                      ticket={ticket}
                      event={ticketsPerEvent.event}
                      key={ticketIndex}
                    />
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
      <p>購入処理に時間がかかる場合があります。</p>
      {myTicketsPerEvents.length === 0 && (
        <>
          <p>チケットを購入した場合、ここに表示されます。</p>
        </>
      )}
      {loading && <Loading />}
      {renderUserTickets()}
    </div>
  );
};

export default withAuth(MyTickets)