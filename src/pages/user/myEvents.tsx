import React, {useState, useEffect} from 'react';
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
import stripe from '@/src/lib/stripe';

export default ({ user, events, requirements }) => {
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
                    <CardText>{showDate()}</CardText>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
        </Link>
      )
    }
  )

  return (
    <>
      <div style={{ marginTop: "1em", minHeight: '4em' }}>
        <h5>自分のイベント</h5>
        {renderUserEvents()}
      </div>
      {(() => {
        if (requirements && !requirements.currently_due.length && !requirements.errors.length && !requirements.past_due.length && !requirements.eventually_due.length) {
          return (
            <Row style={{ margin: 0, marginTop: "0.5em" }}>
              <Link href="/events/new">
                <Button className="ml-auto">新しいイベントを作成</Button>
              </Link>
            </Row>
          )
        } else {
          return (
            <>
              <p>開催するイベントを作成し、チケット販売を開始するには必要なユーザー情報を登録してください。</p>
              <Row style={{ margin: 0, marginTop: "2em" }}>
                <Link href="/user/edit">
                  <Button className="ml-auto">ユーザー情報を登録する</Button>
                </Link>
              </Row>
            </>
          )
        }
      })()}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const {user} = await isLogin(ctx, 'redirect')
  const {firestore} = await initFirebaseAdmin()
  const result = await firestore.collection('events').where('createdUser', '==', user.user_id).get()
  const events = await Promise.all(result.docs.map(async doc => {
    const data = doc.data()
    const createdAt = data.createdAt.seconds
    const updatedAt = data.updatedAt.seconds
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const photos = data.photos.length > 0 ? await getImg(data.photos[0], user.user_id, '360') : await getImg(null, user.user_id, '360')
    return { ...data, createdAt, updatedAt, startDate, endDate, photos, id: doc.id }
  }))

  const { stripeId } = (await firestore.collection('users').doc(user.uid).get()).data()
  const { individual } = await stripe.accounts.retrieve(
    stripeId
  )
  const requirements = individual ? individual.requirements : null

  return { props: { user, events, requirements }}
}