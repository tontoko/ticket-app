import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { Table, Row } from 'reactstrap'
import { Category, Event, ManualPayment, Payment } from 'app'
import withAuth from '@/src/lib/withAuth'
import { useCollection, useDocument } from '@nandorojo/swr-firestore'
import { useRouter } from 'next/router'

const Report = ({ user }) => {
  const router = useRouter()
  const { id: eventId } = useMemo(() => {
    if (!router) return
    return router.query
  }, [router])

  const { data: event } = useDocument<Event>(eventId && `events/${eventId}`)
  const { data: categories } = useCollection<Category>(eventId && `events/${eventId}/categories`, {
    orderBy: 'index',
  })
  const { data: manualPayments } = useCollection<ManualPayment>(
    eventId && `events/${eventId}/manualPayments`,
  )
  const { data: payments } = useCollection<Payment>(eventId && 'payments', {
    where: [
      ['event', '==', eventId],
      ['seller', '==', user.uid],
    ],
  })

  const [state, setState] = useState({
    totalSalesProspect: 0,
    totalSales: 0,
    totalFee: 0,
    totalIncome: 0,
    categoryReport: [],
  })

  useEffect(() => {
    if (!event || !categories || !manualPayments || !payments) return

    let totalSalesProspect = 0
    let totalSales = 0
    let totalFee = 0
    let totalIncome = 0
    const categoryReport: ReactElement[] = []

    categories.map((category, i) => {
      const targetPayments = payments.filter(
        (targetPayment) => targetPayment.category === category.id,
      )
      const manualPaid = manualPayments
        ? manualPayments.filter((manualPayment) => manualPayment.paid).length
        : 0
      const manualUnpaid = (manualPayments ? manualPayments.length : 0) - manualPaid
      const visited =
        targetPayments.filter((targetPayment) => targetPayment.accepted).length + manualPaid
      const sold = category.sold - manualUnpaid
      totalSalesProspect += category.stock * category.price
      totalSales += sold * category.price
      totalFee += sold * Math.floor(category.price * 0.1)
      totalIncome += sold * category.price - sold * Math.floor(category.price * 0.1)
      categoryReport.push(
        <tr key={i}>
          <td>{category.name}</td>
          <td>{sold}</td>
          <td>{category.stock - sold}</td>
          <td>{Math.floor((sold / category.stock) * 100)} %</td>
          <td>{visited}</td>
          <td>{sold ? Math.floor((visited / sold) * 100) : 0} %</td>
        </tr>,
      )
    })
    setState({ totalSalesProspect, totalSales, totalFee, totalIncome, categoryReport })
  }, [event, categories, manualPayments, payments])

  return (
    <>
      <Row style={{ margin: '0', marginTop: '1em' }}>
        <h3>{event?.name} レポート</h3>
      </Row>
      <Table striped style={{ marginTop: '1em' }}>
        <thead>
          <tr>
            <th>チケットカテゴリ</th>
            <th>販売数</th>
            <th>残在庫数</th>
            <th>販売 / 在庫</th>
            <th>来場数</th>
            <th>来場 / 販売</th>
          </tr>
        </thead>
        <tbody>{state.categoryReport}</tbody>
      </Table>
      <Table striped style={{ marginTop: '1em' }}>
        <thead>
          <tr>
            <th>売上見込み</th>
            <th>売上合計</th>
            <th>手数料合計</th>
            <th>実利益</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{state.totalSalesProspect} 円</td>
            <td>{state.totalSales} 円</td>
            <td>{state.totalFee} 円</td>
            <td>{state.totalIncome} 円</td>
          </tr>
        </tbody>
      </Table>
    </>
  )
}

export default withAuth(Report)
