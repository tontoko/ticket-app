import React, {useState, useEffect} from 'react';
import {
  Card, CardText, CardBody,
  CardTitle, CardSubtitle, Button, Container, Col, Row
} from 'reactstrap';
import Link from 'next/link'
import getImg from '@/lib/getImgSSR'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import { GetServerSideProps } from 'next'
import isLogin from '@/lib/isLogin'

export default ({user, events}) => {

  const [renderEvents, setRenderEvents] = useState([])

  useEffect(() => {
    let unsubscribe = () => void
    (async() => {
      setRenderEvents(await renderUserEvents(events))
    })()
    return unsubscribe()
  }, [])

  const renderUserEvents = async events => await Promise.all(
    events.map(async (event, i) => {
      const date:Date = new Date(event.startDate * 1000)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()

      return (
        <Link key={i} href={`/events/${event.id}`}>
          <div>
            <Card style={{ cursor: 'pointer' }}>
              <CardBody>
                <Row>
                  <Col sm="2" xs="3">
                    <img width="100%" src={event.photos} alt="Card image cap" />
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
      <div style={{ marginTop: "1em", minHeight: '4em' }}>
        {renderEvents}
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
  const {user} = await isLogin(ctx)
  const {firestore} = await initFirebaseAdmin()
  const result = await firestore.collection('events').where('createdUser', '==', user.user_id).get()
  const events = await Promise.all(result.docs.map(async doc => {
    const data = doc.data()
    const createdAt = data.createdAt.seconds
    const updatedAt = data.updatedAt.seconds
    const startDate = data.startDate.seconds
    const photos = data.photos.length > 0 ? await getImg(data.photos[0], user.user_id) : await getImg(null, user.user_id)
    return { ...data, createdAt, updatedAt, startDate, photos, id: doc.id }
  }))
  return {props: {user, events}}
}