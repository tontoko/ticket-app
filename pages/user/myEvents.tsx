import React, {useState, useEffect} from 'react';
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Container, Col, Row, Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import Link from 'next/link'
import getImg from '../../lib/getImg'
import initFirebase from '../../initFirebase'

export default (props) => {

    const [events, setEvents] = useState([])

    useEffect(() => {
        (async() => {
            const firebase = await initFirebase()
            const firestore = firebase.firestore()
            const {user} = props
            const result = await firestore.collection('events').where('created_user', '==', user.uid).get()
            const newEvents = []
            result && result.forEach(doc => newEvents.push(doc.data()))
            const renderEvents = await renderUserEvents(newEvents)
            setEvents(renderEvents)
        })()
    },[])

    const renderUserEvents = async events => await Promise.all(
        events.map(async (event, i) => {
            const date = new Date(event.start_date.seconds * 1000)
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()
            let img
            await getImg(event.created_user, event.photos[0]).then(result => img = result)

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
                                        <CardTitle>{event.name}</CardTitle>
                                        <CardSubtitle>{event.placeName}</CardSubtitle>
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

    return (
        <Container>
            <div style={{ marginTop: "1em" }}>
                {events}
            </div>
            <Pagination aria-label="Page navigation" xs="" style={{ marginTop: "1em", justifyContent: "center" }}>
                <PaginationItem>
                    <PaginationLink first href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink previous href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        1
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        2
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        3
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        4
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        5
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink next href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink last href="#" />
                </PaginationItem>
            </Pagination>
            <Row style={{ margin: 0, marginTop: "0.5em" }}>
                <Link href="/events/new">
                    <Button className="ml-auto">新しいイベントを作成</Button>
                </Link>
            </Row>
        </Container>
    );
};
