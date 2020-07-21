import React, {  } from 'react';
import {
    Card, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Col, Row
} from 'reactstrap';
import Link from 'next/link'
import getImg from '@/src/lib/getImgSSR'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { encodeQuery } from '@/src/lib/parseQuery';
import Tickets from '@/src/components/tickets';
import { event } from 'events';

export default ({ events }) => {

    const renderUserEvents = () => events.map((event, i) => {

            const showDate = () => {
                const startDate = moment(event.startDate * 1000)
                const endDate = moment(event.endDate * 1000)
                if (startDate.format("YYYYMd") === endDate.format("YYYYMd")) {
                    return `${startDate.format("YYYY年 M月d日  H:mm")} - ${endDate.format("H:mm")}`
                } else {
                    return `${startDate.format("YYYY年 M月d日  H:mm")} - ${endDate.format("YYYY年  M月d日 H:mm")}`
                }
            }
            // TODO: 返金フロー作成
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
                          <Tickets
                            ticket={ticket}
                            event={event}
                            key={ticketIndex}
                          />
                        ))}
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </div>
            );
        }
    )

    return (
        <div style={{ marginTop: "1em", minHeight: '4em' }}>
            <h5>購入済みチケット</h5>
            {events.length === 0 ?
            <>
                <p>チケットを購入した場合、ここに表示されます。</p>
                <p>購入処理に時間がかかる場合があります。<br/>購入したチケットが表示されていない場合は<a href="#" onClick={() => location.reload()}>画面を更新</a>してください。</p>
            </>
            :
            renderUserEvents()}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx, 'redirect')
    const { firebase, firestore } = await initFirebaseAdmin()
    const payments = (await firestore.collection('payments').where('buyer', '==', user.user_id).get()).docs
    let events: FirebaseFirestore.DocumentData[] = []
    if (payments.length > 0) {
        let myEventsIds = payments.map(myEvent => myEvent.data().event)
        myEventsIds = Array.from(new Set(myEventsIds)) // 重複除外
        const result = await firestore.collection('events').where(firebase.firestore.FieldPath.documentId(), 'in', myEventsIds).get()
        events = await Promise.all(result.docs.map(async event => {
            const tickets = await Promise.all(payments.filter(ticket => ticket.data().event === event.id).map(async payment => {
                const categorySnapShot = await firestore.collection('events').doc(event.id).collection('categories').doc(payment.data().category).get()
                return {
                    ...categorySnapShot.data(),
                    categoryId: categorySnapShot.id,
                    paymentId: payment.id,
                    accepted: payment.data().accepted,
                    error: payment.data().error,
                    buyer: payment.data().buyer,
                    seller: payment.data().seller
                }
            }))
            const data = event.data() as event
            const startDate = data.startDate.seconds
            const endDate = data.endDate.seconds
            const photos = data.photos.length > 0 ? await getImg(data.photos[0], data.createdUser, '360') : await getImg(null, data.createdUser, '360')
            return { ...data,  startDate, endDate, tickets, photos, id: event.id }
        }))
    }
    return { props: { user, events } }
}