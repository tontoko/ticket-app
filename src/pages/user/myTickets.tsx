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

export default ({ events }) => {

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
            // TODO: 返金フロー作成
            return (
                <div key={i}>
                    <Card>
                        <CardBody>
                            <Row style={{ marginBottom: '0.5em' }}>
                                <Col sm="2" xs="3">
                                    <Link key={i} href={`/events/${event.id}`}>
                                        <img width="100%" src={event.photos} alt="Card image cap" style={{ cursor: 'pointer' }} />
                                    </Link>
                                </Col>
                                <Col>
                                    <CardTitle>{event.name}</CardTitle>
                                    <CardSubtitle>{event.placeName}</CardSubtitle>
                                    <CardText>{showDate()}</CardText>
                                    </Col>
                            </Row>
                            <Row>
                                <Col>
                                    
                                    {event.tickets.map((ticket, ticketIndex) => 
                                        <Card style={{ marginBottom: '0.5em' }} key={ticketIndex}>
                                            <CardBody>
                                                <p>{ticket.name}: {ticket.price}円</p>
                                                {ticket.accepted ? (
                                                    <p><FontAwesomeIcon icon={faCheckSquare} style={{ color: "#00DD00" }} /> 受付済み</p>
                                                    ): (
                                                    <p><FontAwesomeIcon icon={faExclamationCircle} style={{ color: "orange" }} /> 未受付</p>
                                                )}
                                                <Row>
                                                {ticket.error ?
                                                    <Col>
                                                        <p>購入失敗 ({ticket.error})</p>
                                                    </Col>
                                                :
                                                <>
                                                    {!ticket.accepted &&
                                                        <Col xs="12" style={{ marginBottom: '0.2em' }}>
                                                            <Link href={{ pathname: `/events/${event.id}/reception/show`, query: { ticket: encodeQuery(JSON.stringify(ticket)) } }}>
                                                                <Button color="success">受付用QRコードを表示</Button>
                                                            </Link>
                                                        </Col>
                                                    }
                                                    <Col xs="12">
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
            {events.length === 0 ?
            <>
                <p>チケットを購入した場合、ここに表示されます。</p>
                <p>購入処理に時間がかかる場合があります。購入したチケットが表示されていない場合は<a href="#" onClick={() => location.reload()}>画面を更新</a>してください。</p>
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
            const data = event.data()
            const createdAt = data.createdAt.seconds
            const updatedAt = data.updatedAt.seconds
            const startDate = data.startDate.seconds
            const endDate = data.endDate.seconds
            const photos = data.photos.length > 0 ? await getImg(data.photos[0], data.createdUser, '360') : await getImg(null, data.createdUser, '360')
            return { ...data, createdAt, updatedAt, startDate, endDate, tickets, photos, id: event.id }
        }))
    }
    return { props: { user, events } }
}