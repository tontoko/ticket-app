import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Form, Button, Row, Card, CardBody, Col, CardTitle, CardSubtitle, CardText } from 'reactstrap'
import { fuego, useDocument } from '@nandorojo/swr-firestore'
import getImg from '@/src/lib/getImg'
import getImgSSR from '@/src/lib/getImgSSR'
import moment from 'moment'
import { parseCookies } from 'nookies'
import { event } from 'app'
import withAuth from '@/src/lib/withAuth'
import { GetStaticPaths, GetStaticProps, GetServerSideProps } from 'next'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'

export const User: React.FC<any> = ({user, serverEventHistory}) => {
  const [event, setEvent] = useState(serverEventHistory);
  const cookie = parseCookies();
  const { data: lastVisitedEventData } = useDocument<event>(
    cookie.lastVisitedEvent &&
      !serverEventHistory &&
      `events/${cookie.lastVisitedEvent}`
  );

  useEffect(() => {
    (async() => {
      if (!lastVisitedEventData) return
        const photos =
          lastVisitedEventData.photos.length > 0
            ? await getImg(
                lastVisitedEventData.photos[0],
                lastVisitedEventData.createdUser
              )
            : await getImg(null, lastVisitedEventData.createdUser);
      setEvent({
        ...lastVisitedEventData,
        startDate: lastVisitedEventData.startDate.toMillis(),
        endDate: lastVisitedEventData.endDate.toMillis(),
        photos,
        id: lastVisitedEventData.id,
      });
      fuego.db
        .collection("users")
        .doc(user.uid)
        .update({
          eventHistory: [lastVisitedEventData.id],
        });
    })()
  }, [lastVisitedEventData])
  
  const renderUserEvent = () => {
      const showDate = () => {
          const startDate = moment(event.startDate)
          const endDate = moment(event.endDate)
          if (startDate.format("YYYYMD") === endDate.format("YYYYMD")) {
              return `${startDate.format("YYYY年 M月D日  H:mm")} - ${endDate.format("H:mm")}`
          } else {
              return `${startDate.format("YYYY年 M月D日  H:mm")} - ${endDate.format("YYYY年  M月D日 H:mm")}`
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
                                  <img width="100%" src={event.photos} alt="image" />
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
          <Link href={`/users/${user.uid}/edit`}>
            <Button className="ml-auto">登録情報の編集</Button>
          </Link>
        </Row>
      </Form>
    </>
  );
}

export default withAuth(User)

// export const getStaticPaths: GetStaticPaths = async () => {
//   const { firestore } = await initFirebaseAdmin();
//   const paths = (await firestore.collection("users").get()).docs.map(
//     (doc) => `/users/${doc.id}`
//   );

//   return { paths, fallback: true };
// };

export const getServerSideProps: GetServerSideProps = async ({query}) => {
  const {id} = query
  const { firestore } = await initFirebaseAdmin();
  const userData = (await firestore.collection('users').doc(id as string).get()).data()

  let staticEvent = null

  if (userData && userData.eventHistory) {
    const result = await firestore
      .collection("events")
      .doc(userData.eventHistory[userData.eventHistory.length - 1])
      .get();
    const data = result.data() as event;
    const startDate = data.startDate.toMillis();
    const endDate = data.endDate.toMillis();
    const photos =
      data.photos.length > 0
        ? await getImgSSR(data.photos[0], data.createdUser)
        : await getImgSSR(null, data.createdUser);
    staticEvent = { ...data, startDate, endDate, photos, id: result.id };
  }
  return { 
    props: { staticEvent }, 
    // revalidate: 1 
  };
};