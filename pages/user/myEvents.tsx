import React, {useState, useEffect} from 'react';
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Container, Col, Row
} from 'reactstrap';
import Link from 'next/link'
import getImg from '../../lib/getImg'
import initFirebase from '../../initFirebase'
import Loading from '../../components/loading'

export default (props) => {

    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        (async() => {
            const firebase = await initFirebase()
            const firestore = firebase.firestore()
            const {user} = props
            const result = await firestore.collection('events').where('createdUser', '==', user.uid).get()
            const newEvents = []
            result && result.forEach(doc => newEvents.push(doc))
            const renderEvents = await renderUserEvents(newEvents)
            setEvents(renderEvents)
            setLoading(false)
        })()
    },[])

    const renderUserEvents = async events => await Promise.all(
        events.map(async (event, i) => {
            const data = event.data()
            const date = new Date(data.startDate.seconds * 1000)
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()
            let img
            await getImg(data.photos[0]).then(result => img = result)

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
