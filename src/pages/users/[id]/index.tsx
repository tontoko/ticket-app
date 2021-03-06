import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Form,
  Button,
  Row,
  Card,
  CardBody,
  Col,
  CardTitle,
  CardSubtitle,
  CardText,
} from 'reactstrap'
import { fuego } from '@nandorojo/swr-firestore'
import getImg from '@/src/lib/getImg'
import moment from 'moment'
import { parseCookies } from 'nookies'
import { Event } from 'app'
import withAuth from '@/src/lib/withAuth'
import { NextPage } from 'next'

export const User: NextPage<{ user: firebase.default.User }> = ({ user }) => {
  const [event, setEvent] = useState<Event & { photo: string }>()

  useEffect(() => {
    ;(async () => {
      const uid = user?.uid
      const userData = (
        await fuego.db
          .collection('users')
          .doc(uid as string)
          .get()
      ).data()

      let targetEventId: string = null
      const cookie = parseCookies()
      if (!userData && cookie.lastVisitedEvent) {
        targetEventId = cookie.lastVisitedEvent
      }
      if (userData?.eventHistory) {
        const index =
          userData.eventHistory.length === 1
            ? 0
            : userData.eventHistory.length - Math.floor(Math.random() * 2 + 1)
        targetEventId = userData.eventHistory[index]
      }
      if (targetEventId) {
        const result = await fuego.db.collection('events').doc(targetEventId).get()
        const data = result.data() as Event
        const photo =
          data.photos.length > 0
            ? await getImg(data.photos[0], data.createdUser)
            : await getImg(null, data.createdUser)
        setEvent({ ...data, photo, id: result.id })
      }
    })()
  }, [user])

  const renderUserEvent = useMemo(() => {
    if (!event) return

    const showDate = () => {
      const startDate = moment(event.startDate.toDate())
      const endDate = moment(event.endDate.toDate())
      if (startDate.format('YYYYMD') === endDate.format('YYYYMD')) {
        return `${startDate.format('YYYY年 M月D日  H:mm')} - ${endDate.format('H:mm')}`
      } else {
        return `${startDate.format('YYYY年 M月D日  H:mm')} - ${endDate.format(
          'YYYY年  M月D日 H:mm',
        )}`
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
                  <img width="100%" src={event.photo} alt="image" />
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
  }, [event])

  return (
    <>
      <h2>ようこそ{user && user.displayName && ` ${user.displayName} さん`}</h2>
      <Form style={{ marginTop: '1.5em' }}>
        {event && (
          <Row form style={{ marginBottom: '2em' }}>
            {renderUserEvent}
          </Row>
        )}
        <Row form style={{ marginBottom: '1em' }}>
          <Link href={`/users/${user.uid}/edit`}>
            <Button className="ml-auto">登録情報の編集</Button>
          </Link>
        </Row>
      </Form>
    </>
  )
}

export default withAuth(User)
