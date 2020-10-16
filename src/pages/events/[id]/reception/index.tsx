import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Table, Row, Col, Button, Input, ModalBody, ModalFooter } from 'reactstrap'
import { GetServerSideProps } from 'next'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { useAlert } from 'react-alert'
import { event, manualPayment } from 'app'
import withAuth from '@/src/lib/withAuth'
import { fuego, useCollection } from '@nandorojo/swr-firestore'
import analytics from '@/src/lib/analytics'

const Reception = ({ categories, id, setModal, setModalInner }) => {
  const alert = useAlert()
  const { data: manualPayments, revalidate } = useCollection<manualPayment>(
    `events/${id}/manualPayments`,
    {
      listen: true,
    },
  )

  const [newManualPayment, setNewManualPayment] = useState<manualPayment>({
    name: '',
    category: categories.length > 0 ? categories[0].id : '',
    paid: false,
  })

  const [tmpManualPayments, setTmpManualPayments] = useState<manualPayment[]>(manualPayments)

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTmpManualPayments(manualPayments)
  }, [manualPayments])

  const apiErrorHandle = (e) => {
    let msg = e.message
    if (e.message !== 'チケットの在庫がありません。') {
      msg = 'エラーが発生しました。リロードします…'
      setTimeout(() => {
        location.reload()
      }, 1000)
    }
    alert.error(msg)
  }

  const createManualPayment = async () => {
    if (loading) return
    if (!newManualPayment.category) return alert.error('先にチケットカテゴリを登録してください。')
    if (!newManualPayment.name) return alert.error('名前が入力されていません。')
    try {
      setLoading(true)
      const token = await fuego.auth().currentUser.getIdToken()
      const res = await fetch('/api/createManualPayment', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ eventId: id, newManualPayment, token }),
      })
      if (res.status !== 200) throw new Error((await res.json()).error)
      setNewManualPayment({ ...newManualPayment, name: '' })
      await revalidate()
      alert.success('手動受付リストを更新しました。')
    } catch (e) {
      ;(await analytics()).logEvent('exception', { description: e.message })
      apiErrorHandle(e)
    }
    setLoading(false)
  }

  const editManualPayment = async (newValue: manualPayment, beforeValue: manualPayment) => {
    if (loading) return
    if (!newValue.name) return alert.error('名前が入力されていません。')
    try {
      setLoading(true)
      const token = await fuego.auth().currentUser.getIdToken()
      const res = await fetch('/api/changeManualPayment', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ eventId: id, beforeValue, newValue, token }),
      })
      if (res.status !== 200) throw new Error((await res.json()).error)
      await revalidate()
      alert.success('手動受付リストを更新しました。')
    } catch (e) {
      ;(await analytics()).logEvent('exception', { description: e.message })
      apiErrorHandle(e)
    }
    setLoading(false)
  }

  const deleteManualPayment = async (manualPayment: manualPayment) => {
    if (loading) return
    const submit = async () => {
      try {
        setLoading(true)
        setModal(false)
        const token = await fuego.auth().currentUser.getIdToken()
        const res = await fetch('/api/deleteManualPayment', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ eventId: id, manualPayment, token }),
        })
        if (res.status !== 200) throw new Error((await res.json()).error)
        await revalidate()
        alert.success('項目を削除しました。')
      } catch (e) {
        ;(await analytics()).logEvent('exception', { description: e.message })
        apiErrorHandle(e)
      }
      setLoading(false)
    }
    setModalInner(
      <>
        <ModalBody>本当に削除しますか？</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => submit()}>
            はい
          </Button>{' '}
          <Button color="secondary" onClick={() => setModal(false)}>
            キャンセル
          </Button>
        </ModalFooter>
      </>,
    )
    setModal(true)
  }

  const changeName = (value, i) => {
    const copyTmpManualPayments = [...tmpManualPayments]
    copyTmpManualPayments[i].name = value
    setTmpManualPayments(copyTmpManualPayments)
  }

  const column = (manualPayment: manualPayment, i) => {
    return (
      <tr key={i}>
        <td>
          <Input
            placeholder="お名前"
            value={manualPayment.name}
            onChange={(e) => changeName(e.target.value, i)}
            onBlur={(e) =>
              editManualPayment({ ...manualPayment, name: e.target.value }, manualPayment)
            }
          />
        </td>
        <td>
          <Input
            type="select"
            value={manualPayment.category}
            onChange={(e) =>
              editManualPayment({ ...manualPayment, category: e.target.value }, manualPayment)
            }
            disabled={loading}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Input>
        </td>
        <td>
          <Input
            type="select"
            value={manualPayment.paid.toString()}
            onChange={(e) =>
              editManualPayment(
                { ...manualPayment, paid: e.target.value === 'true' },
                manualPayment,
              )
            }
            disabled={loading}
          >
            <option value="true">○</option>
            <option value="false">×</option>
          </Input>
        </td>
        <td style={{ width: '6em' }}>
          <Button
            style={{ margin: '0.1em' }}
            color="danger"
            disabled={loading}
            onClick={() => deleteManualPayment(manualPayment)}
          >
            削除
          </Button>
        </td>
      </tr>
    )
  }

  return (
    <>
      <Row style={{ marginTop: '1.5em' }}>
        <Col>
          <Link href={`/events/${id}/reception/qrReader`}>
            <Button color="success">QRリーダーを起動する</Button>
          </Link>
        </Col>
      </Row>
      <Row style={{ marginTop: '1.5em' }}>
        <Col>
          <h4>手動受付リスト</h4>
          <Table striped style={{ marginTop: '1em' }}>
            <thead>
              <tr>
                <th>名前</th>
                <th>カテゴリ</th>
                <th>支払</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Input
                    placeholder="お名前"
                    value={newManualPayment.name}
                    onChange={(e) =>
                      setNewManualPayment({ ...newManualPayment, name: e.target.value })
                    }
                  />
                </td>
                <td>
                  <Input
                    type="select"
                    value={newManualPayment.category}
                    onChange={(e) =>
                      setNewManualPayment({ ...newManualPayment, category: e.target.value })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Input>
                </td>
                <td>
                  <Input
                    type="select"
                    value={newManualPayment.paid.toString()}
                    onChange={(e) =>
                      setNewManualPayment({ ...newManualPayment, paid: e.target.value === 'true' })
                    }
                  >
                    <option value="false">×</option>
                    <option value="true">○</option>
                  </Input>
                </td>
                <td style={{ width: '6em' }}>
                  <Button disabled={loading} color="primary" onClick={createManualPayment}>
                    登録
                  </Button>
                </td>
              </tr>
              {tmpManualPayments && tmpManualPayments.map((e, i) => column(e, i))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query
  const { firestore } = await initFirebaseAdmin()
  const categoriesSnapShot = await firestore
    .collection('events')
    .doc(id as string)
    .collection('categories')
    .orderBy('index')
    .get()
  const categories: FirebaseFirestore.DocumentData[] = []
  categoriesSnapShot.forEach((e) => {
    const id = e.id
    const category = e.data()
    categories.push({ ...category, id })
  })
  const eventsSnapShot = await firestore
    .collection('events')
    .doc(id as string)
    .get()
  const data = eventsSnapShot.data() as event
  const startDate = data.startDate.seconds
  const endDate = data.endDate.seconds
  const events = { ...data, startDate, endDate, id: eventsSnapShot.id }

  return { props: { categories, events, id } }
}

export default withAuth(Reception)
