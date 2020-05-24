import React, { useState, useEffect } from 'react';
import {
    Card, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Container, Col, Row
} from 'reactstrap';
import Link from 'next/link'
import getImg from '@/src/lib/getImgSSR'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import moment from 'moment'
import btoa from 'btoa'

export default ({ user, events }) => {

    const renderUserEvents = () => events.map((event, i) => {

            const showDate = () => {
                const startDate = moment(event.startDate * 1000)
                const endDate = moment(event.endDate * 1000)
                if (startDate.format("YYYYMd") === endDate.format("YYYYMd")) {
                    return `${startDate.format("YYYY年 M月d日  H:mm")} 〜 ${endDate.format("H:mm")}`
                } else {
                    return `${startDate.format("YYYY年 M月d日  H:mm")} 〜 ${endDate.format("YYYY年  M月d日 H:mm")}`
                }
            }

            return (
                <div key={i}>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col sm="2" xs="3">
                                    <Link key={i} href={`/events/${event.id}`}>
                                        <img width="100%" src={event.photos} alt="Card image cap" style={{ cursor: 'pointer' }} />
                                    </Link>
                                </Col>
                                <Col>
                                    <CardTitle>{event.name}</CardTitle>
                                    <CardSubtitle>{event.placeName}</CardSubtitle>
                                    <CardText>{showDate()}</CardText>
                                    {event.tickets.map((ticket, ticketIndex) => 
                                        <Card style={{ marginBottom: '0.5em' }} key={ticketIndex}>
                                            <CardBody>
                                                <p>{ticket.name}: {ticket.price}円</p>
                                                <p>{ticket.accepted ? '受付済み' : '未受付'}</p>
                                                <Row>
                                                {ticket.error ?
                                                    <Col>
                                                        <p>購入失敗 ({ticket.error})</p>
                                                    </Col>
                                                :
                                                <>
                                                    {!ticket.accepted &&
                                                    <Col>
                                                        <Link href={{ pathname: `/events/${event.id}/reception/show`, query: { ticket: btoa(encodeURIComponent(JSON.stringify(ticket))) } }}>
                                                            <Button color="success">受付用のQRコードを表示</Button>
                                                        </Link>
                                                    </Col>
                                                    }
                                                    <Col>
                                                        <Button color="danger">返金申請</Button>
                                                    </Col>
                                                </>
                                                }
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    )}
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </div>
            )
        }
    )

    return (
        <div style={{ marginTop: "1em", minHeight: '4em' }}>
            <h5>購入済みチケット</h5>
            {renderUserEvents()}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx)
    const { firebase, firestore } = await initFirebaseAdmin()
    const myTickets = (await firestore.collection('payments').where('buyer', '==', user.user_id).get()).docs
    let events: FirebaseFirestore.DocumentData[] = []
    if (myTickets.length > 0) {
        let myEventsIds = myTickets.map(myEvent => myEvent.data().event)
        myEventsIds = Array.from(new Set(myEventsIds)) // 重複除外
        const result = await firestore.collection('events').where(firebase.firestore.FieldPath.documentId(), 'in', myEventsIds).get()
        events = await Promise.all(result.docs.map(async doc => {
            const tickets = await Promise.all(myTickets.filter(ticket => ticket.data().event === doc.id).map(async ticket => {
                return { 
                    ...(await firestore.collection('events').doc(doc.id).collection('categories').doc(ticket.data().category).get()).data(), 
                    accepted: ticket.data().accepted,
                    error: ticket.data().error
                }
            }))
            const data = doc.data()
            const createdAt = data.createdAt.seconds
            const updatedAt = data.updatedAt.seconds
            const startDate = data.startDate.seconds
            const endDate = data.endDate.seconds
            const photos = data.photos.length > 0 ? await getImg(data.photos[0], data.createdUser, '360') : await getImg(null, data.createdUser, '360')
            return { ...data, createdAt, updatedAt, startDate, endDate, tickets, photos, id: doc.id }
        }))
    }
    return { props: { user, events } }
}