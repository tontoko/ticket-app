import React, { useEffect, useState, useMemo } from 'react'
import { FormGroup, Button, Row, Col } from 'reactstrap'
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import moment from 'moment'
import Link from 'next/link'
import Loading from '@/src/components/loading'
import { useRouter } from 'next/router'
import withAuth from '@/src/lib/withAuth'
import { fuego, useDocument } from '@nandorojo/swr-firestore'
import { event, payment, category } from 'app'
import { useAlert } from 'react-alert'
import { encodeQuery } from '@/src/lib/parseQuery'

const Show = ({ user }) => {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const alert = useAlert()
  const { data: payment, loading: paymentLoading } = useDocument<payment>(
    router && `payments/${router.query.paymentId}`,
    {
      listen: true,
    },
  )
  const { data: event, loading: eventLoading } = useDocument<event>(
    payment && `events/${payment.event}`,
    {
      listen: true,
    },
  )
  const { data: category, loading: categoryLoading } = useDocument<category>(
    event && payment && `events/${payment.event}/categories/${payment.category}`,
    {
      listen: true,
      parseDates: ['createTime'],
    },
  )

  useEffect(() => {
    if (!payment) return
    if (payment.seller !== user.uid && payment.buyer !== user.uid) {
      ;(async () => fuego.auth().signOut())()
      return
    }
    setLoading(false)
  }, [payment])

  const acceptRefund = async () => {
    try {
      setLoading(true)
      const token = await fuego.auth().currentUser.getIdToken()
      const res = await fetch('/api/acceptRefundRequest', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          reason: payment.refund.reason,
          seller: payment.seller,
          buyer: payment.buyer,
          paymentId: router.query.paymentId,
          token,
        }),
      })
      if (res.status !== 200) throw new Error()
      alert.info('返金申請を承諾しました。')
    } catch (e) {
      console.error(e.message)
      alert.error('エラーが発生しました。しばらくしてお試しください。')
      setLoading(false)
    }
  }

  const rejectRefund = async () => {
    try {
      setLoading(true)
      const token = await fuego.auth().currentUser.getIdToken()
      const res = await fetch('/api/rejectRefundRequest', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          reason: payment.refund.reason,
          seller: payment.seller,
          buyer: payment.buyer,
          paymentId: router.query.paymentId,
          token,
        }),
      })
      if (res.status !== 200) throw new Error()
      alert.info('返金申請を却下しました。')
    } catch (e) {
      console.error(e.message)
      alert.error('エラーが発生しました。しばらくしてお試しください。')
      setLoading(false)
    }
  }

  const refundForm = useMemo(() => {
    if (!payment) return
    if (payment.refund && payment.refund.refunded) return <p>返金済みです</p>
    if (payment.refund && payment.refund.rejected)
      return <p>返金申請が拒否されました。管理者により審査が行われます。</p>
    if (
      payment.refund &&
      payment.buyer === user.uid &&
      moment(payment.createdAt.toDate()).isBefore(moment().subtract(3, 'days'))
    )
      return (
        <>
          <p>申請から3日間が経過しました。以下のボタンから返金を確定できます。</p>
          <Button type="button" color="success" onClick={acceptRefund}>
            返金を確定させる
          </Button>
        </>
      )
    if (!payment.refund && payment.buyer === user.uid)
      return (
        <Link href={`/users/${user.uid}/payments/${payment.id}/refund`}>
          <Button color="danger">返金申請する</Button>
        </Link>
      )
    if (payment.refund && payment.buyer === user.uid)
      return (
        <Button type="button" color="secondary">
          返金申請の手続き中です
        </Button>
      )
    if (payment.refund && payment.seller === user.uid)
      return (
        <>
          <p>
            返金が申請されました。確認の上、受理の可否を選択してください。
            <br />
            拒否した場合には、管理者による審査が行われます。
          </p>
          <p>{`理由: ${payment.refund.reasonText}`}</p>
          <p>{`詳細: ${payment.refund.detailText}`}</p>
          <Row form>
            <Col>
              <Button
                type="button"
                color="success"
                onClick={acceptRefund}
                style={{ marginRight: '1em' }}
              >
                受理
              </Button>
              <Button type="button" color="danger" onClick={rejectRefund}>
                拒否
              </Button>
            </Col>
          </Row>
        </>
      )
    return <p>返金申請はありません</p>
  }, [payment])

  if (loading || paymentLoading || eventLoading || categoryLoading) return <Loading />

  return (
    <>
      <h4 style={{ marginBottom: '1.5em' }}>購入履歴 詳細</h4>
      <p>
        {`イベント名: `}
        <Link href={`/events/${event.id}`}>
          <a>{event.name}</a>
        </Link>
      </p>
      <p>{`チケット名: ${category.name}`}</p>
      <p>{`価格: ${category.price} 円`}</p>
      <p>{`購入日時: ${moment(payment.createdAt.toDate()).format('YYYY年 M月D日 H:mm')}`}</p>
      <p>{`受付済み: ${payment.accepted ? 'はい' : 'いいえ'}`}</p>
      <h4>返金</h4>
      {refundForm}
    </>
  )
}

// export const getStaticPaths: GetStaticPaths = async () => {
//   const { firestore } = await initFirebaseAdmin();
//   let paths = []
//   await Promise.all((await firestore.collection("events").get()).docs.map(
//     async (event) =>
//       (await firestore.collection("payments").get()).docs.map(async (payment) => {
//         return paths.push({
//           params: { id: event.id, paymentId: payment.id },
//         });
//       })
//   ));
//   return { paths, fallback: true };
// };

// export const getServerSideProps: GetServerSideProps = async ({ query }) => {
//   const { firestore } = await initFirebaseAdmin();
//   const { id, paymentId } = query
//   const payment = (await firestore
//     .collection("payments")
//     .doc(paymentId as string)
//     .get()).data()

//   const eventSnapShot = await firestore.collection("events").doc(payment.event).get()
//   const eventData = eventSnapShot.data()
//   const event = {
//     ...eventData,
//     startDate: eventData.startDate.toMillis(),
//     endDate: eventData.endDate.toMillis(),
//     id: eventSnapShot.id,
//   };
//   const category = (
//     await firestore
//       .collection("events")
//       .doc(payment.event)
//       .collection("categories")
//       .doc(payment.category)
//       .get()
//   ).data();

//   return {
//     props: { payment, event, category },
//     // revalidate: 1,
//   };
// };

export default withAuth(Show)
