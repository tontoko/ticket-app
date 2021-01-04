import { Row, Col, Card, CardBody } from 'reactstrap'
import { useRouter } from 'next/router'

import moment from 'moment'
import Link from 'next/link'
import withAuth from '@/src/lib/withAuth'
import { fuego, useCollection } from '@nandorojo/swr-firestore'
import { useEffect, useRef, useState } from 'react'
import { Category, Event, Payment } from 'app'

const Payments = ({ user }) => {
  const router = useRouter()
  const { id } = router?.query
  const [events, setEvents] = useState<{ [x: string]: Event }>({})
  const [categories, setCategories] = useState<{ [x: string]: Category }>({})
  const { data: payments } = useCollection<Payment>(router && '/payments', {
    where: ['buyer', '==', id],
    listen: true,
  })
  const tmpEvents = useRef({})
  const tmpCategories = useRef({})

  useEffect(() => {
    if (!payments) return
    ;(async () => {
      await Promise.all(
        payments.map(async (payment) => {
          tmpEvents.current = { ...tmpEvents.current, [payment.event]: {} }
          tmpCategories.current = { ...tmpCategories.current, [payment.category]: {} }
        }),
      )
      await Promise.all(
        Object.keys(tmpEvents.current).map(async (key) => {
          const event = (await fuego.db.collection('events').doc(key).get()).data() as Event
          tmpEvents.current = { ...tmpEvents.current, [key]: event }
          setEvents(tmpEvents.current)
        }),
      )
      await Promise.all(
        Object.keys(tmpCategories.current).map(async (key) => {
          const category = (
            await fuego.db.collection('events').doc(key).collection('categories').doc(key).get()
          ).data() as Category
          tmpCategories.current = { ...tmpCategories.current, [key]: category }
          setCategories(tmpCategories.current)
        }),
      )
    })()
  }, [payments])

  const renderPayments = () => {
    if (!payments?.length) return <p>購入履歴はありません。</p>
    const sortedPayment = [...payments]
    sortedPayment.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)

    return sortedPayment.map((payment, i) => {
      return (
        <Link href={`/users/${user.uid}/payments/${payment.id}`} key={i}>
          <div>
            <Row>
              <Col xs="12" style={{ padding: '0', cursor: 'pointer' }}>
                <Card style={{ height: '100%', width: '100%' }}>
                  <CardBody>
                    <p>{events[payment.event] && events[payment.event].name}</p>
                    <p>
                      {categories[payment.category] &&
                        `${categories[payment.category].name}: ${
                          categories[payment.category].price
                        } 円`}
                    </p>
                    <p>{moment(payment.createdAt.toDate()).format('YYYY年 M月D日 H:mm')}</p>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </Link>
      )
    })
  }

  return (
    <>
      <h4 style={{ marginBottom: '1em' }}>購入履歴</h4>
      {renderPayments()}
    </>
  )
}

export default withAuth(Payments)
