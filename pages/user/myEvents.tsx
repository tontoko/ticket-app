import React, {useState, useEffect} from 'react';
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Container, Col, Row
} from 'reactstrap';
import Link from 'next/link'
import getImg from '@/lib/getImg'
import initFirebase from '@/initFirebase'
import Loading from '@/components/loading'
import { GetServerSideProps } from 'next'
import isLogin from '@/lib/isLogin'

export default (props) => {

    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsubscribe = () => void
        (async() => {
            const { firebase, firestore } = await initFirebase()
            const user = props.user ? props.user : props.params.uid
            if (!user) return
            unsubscribe = firestore.collection('events').where('createdUser', '==', user.uid).onSnapshot(async result => {
                const newEvents = result.docs.map(doc => doc)
                const renderEvents = await renderUserEvents(newEvents)
                setEvents(renderEvents)
                setLoading(false)
            })
        })()
        return unsubscribe()
    },[props.params.uid])

    const renderUserEvents = async events => await Promise.all(
        events.map(async (event, i) => {
            const data = event.data()
            const date:Date = data.startDate.toDate()
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()
            let img
            await getImg(data.photos[0], '360').then(result => img = result)

            return (
                <Link key={i} href={`/events/${event.id}`}>
                    <div>
                        <Card style={{ cursor: 'pointer' }}>
                            <CardBody>
                                <Row>
                                    <Col sm="2" xs="3">
                                        <img width="100%" src={img} alt="Card image cap" />
                                    </Col>
                                    <Col xs="auto">
                                        <CardTitle>{data.name}</CardTitle>
                                        <CardSubtitle>{data.placeName}</CardSubtitle>
                                        <CardText>{`${year}/${month}/${day}`}</CardText>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </div>
                </Link>
            )
        }
    ))

    if (loading) return (
        <Loading />
    )

    return (
        <Container>
            <div style={{ marginTop: "1em", minHeight: '4em' }}>
                {events}
            </div>
            <Row style={{ margin: 0, marginTop: "0.5em" }}>
                <Link href="/events/new">
                    <Button className="ml-auto">新しいイベントを作成</Button>
                </Link>
            </Row>
        </Container>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const {user, msg} = await isLogin(ctx)
    const { firestore } = await initFirebase()
    const result = await firestore.collection('events').where('createdUser', '==', user.uid).get()
    const events = result.docs.map(doc => doc)
    return {props: {events}}
}