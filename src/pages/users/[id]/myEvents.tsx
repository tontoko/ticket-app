import React, { useEffect, useState } from 'react'
import { Card, CardText, CardBody, CardTitle, CardSubtitle, Button, Col, Row } from 'reactstrap'
import Link from 'next/link'
import getImg from '@/src/lib/getImg'
import moment from 'moment'
import { Event } from 'app'
import Loading from '@/src/components/loading'
import withAuth from '@/src/lib/withAuth'
import useSWR from 'swr'
import { useCollection } from '@nandorojo/swr-firestore'
import { useRouter } from 'next/router'
import { NextPage } from 'next'

const fetcher = async (url, user) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ uid: user.uid }),
  })
  const { individual } = await res.json()
  return individual ? individual.requirements : null
}

const MyEvents: NextPage<{ user: firebase.default.User }> = ({ user }) => {
  const router = useRouter()
  const { data: requirements } = useSWR(user && ['/api/stripeAccountsRetrieve', user], fetcher)
  const { data: eventsData } = useCollection<Event>(router && `events`, {
    listen: true,
    where: ['createdUser', '==', router?.query?.id],
  })
  const [events, setEvents] = useState<({ thumbnail: string } & Event)[]>([])

  useEffect(() => {
    if (!user || !eventsData) return
    Promise.all(
      eventsData.map(async (eventData) => {
        const thumbnail =
          eventData.photos.length > 0
            ? await getImg(eventData.photos[0], user.uid, '360')
            : await getImg(null, user.uid, '360')
        return { ...eventData, thumbnail }
      }),
    ).then((result) => setEvents(result as ({ thumbnail: string } & Event)[]))
  }, [user, eventsData])

  const renderUserEvents = () =>
    events.map((event, i) => {
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
        <Link key={i} href={`/events/${event.id}`}>
          <div>
            <Card style={{ cursor: 'pointer' }}>
              <CardBody>
                <Row>
                  <Col sm="2" xs="3">
                    <img width="100%" src={event.thumbnail} alt="image" />
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
    })

  if (!events || requirements === undefined) return <Loading />

  return (
    <>
      <div style={{ marginTop: '1em', minHeight: '4em' }}>
        <h5>自分のイベント</h5>
        {renderUserEvents()}
      </div>
      {(() => {
        if (
          requirements &&
          !requirements.currently_due.length &&
          !requirements.errors.length &&
          !requirements.past_due.length &&
          !requirements.eventually_due.length
        )
          return (
            <Row style={{ margin: 0, marginTop: '0.5em' }}>
              <Link href="/events/new">
                <Button className="ml-auto">新しいイベントを作成</Button>
              </Link>
            </Row>
          )
        return (
          <>
            <p>
              イベントを開催し、チケット販売を開始するには必要なユーザー情報を登録してください。
            </p>
            <Row style={{ margin: 0, marginTop: '2em' }}>
              <Link href={`/users/${user.uid}/edit/organizer`}>
                <Button className="ml-auto">ユーザー情報を登録する</Button>
              </Link>
            </Row>
          </>
        )
      })()}
    </>
  )
}

export default withAuth(MyEvents)
