import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Form, Button, Row, Card, CardBody, Col, CardTitle, CardSubtitle, CardText } from 'reactstrap'
import { firestore } from '@/src/lib/initFirebase'
import getImg from '@/src/lib/getImg'
import moment from 'moment'
import { parseCookies } from 'nookies'
import { event } from 'events'

export const UserShow: React.FC<any> = ({user, userData}) => {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    (async() => {
      if (!userData) return
      const history = userData.eventHistory;
      const cookie = parseCookies();
      if (history || cookie.lastVisitedEvent) {
        let doc: string;
        if (history) {
          doc = history[history.length - 1];
        } else {
          doc = cookie.lastVisitedEvent;
        }
        const result = await firestore.collection("events").doc(doc).get();
        const data = result.data() as event;
        const startDate = data.startDate.seconds;
        const endDate = data.endDate.seconds;
        const photos =
          data.photos.length > 0
            ? await getImg(data.photos[0], data.createdUser)
            : await getImg(null, data.createdUser);
        setEvent({ ...data, startDate, endDate, photos, id: result.id })
      }
    })()
  }, [userData])
  
  const renderUserEvent = () => {
      const showDate = () => {
          const startDate = moment(event.startDate * 1000)
          const endDate = moment(event.endDate * 1000)
          if (startDate.format("YYYYMd") === endDate.format("YYYYMd")) {
              return `${startDate.format("YYYY年 M月d日  H:mm")} - ${endDate.format("H:mm")}`
          } else {
              return `${startDate.format("YYYY年 M月d日  H:mm")} - ${endDate.format("YYYY年  M月d日 H:mm")}`
          }
      }

      return (
          <Link href={`/events/${event.id}`}>
              <div>
                  <h5>このイベントに興味がありますか？</h5>
                  <Card style={{ cursor: 'pointer' }}>
                      <CardBody>
                          <Row>
                              <Col sm="2" xs="3">
                                  <img width="100%" src={event.photos} alt="Card image cap" />
                              </Col>
                              <Col xs="auto">
                                  <CardTitle>{event.name}</CardTitle>
                                  <CardSubtitle>{event.placeName}</CardSubtitle>
                                  <CardText>{showDate()}</CardText>
                              </Col>
                          </Row>
                      </CardBody>
                  </Card>
              </div>
          </Link>
      )
  }

  return (
    <>
      <h2>ようこそ{user && user.displayName && ` ${user.displayName} さん`}</h2>
      <Form style={{ marginTop: "1.5em" }}>
        {event && (
          <Row form style={{ marginBottom: "2em" }}>
            {renderUserEvent()}
          </Row>
        )}
        <Row form style={{ marginBottom: "1em" }}>
          <Link href={`/user/edit`}>
            <Button className="ml-auto">登録情報の編集</Button>
          </Link>
        </Row>
      </Form>
    </>
  );
}

export default UserShow