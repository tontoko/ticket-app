import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import { Table, Row, Col, Button, Input, ModalBody, ModalFooter } from 'reactstrap';
import { GetServerSideProps } from 'next';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import { useAlert } from 'react-alert';
import { event } from 'app';
import withAuth from '@/src/lib/withAuth';
import { useCollection } from '@nandorojo/swr-firestore';

type manualPayment = {category: string, name: string, paid: boolean, id?: string}

const Reception = ({ categories, id, setModal, setModalInner }) => {
    const alert = useAlert()
    const { data: manualPayments, revalidate } = useCollection<manualPayment>(`events/${id}/manualPayments`, {
        listen: true
    })

    const [newManualPayment, setNewManualPayment] = useState<manualPayment>({
      name: "",
      category: categories.length > 0 ? categories[0].id : "",
      paid: true,
    });

    const [tmpManualPayments, setTmpManualPayments] = useState<manualPayment[]>(
      manualPayments
    );

    const [loading, setLoading] = useState(false)

    useEffect(() => {
      setTmpManualPayments(manualPayments);
    }, [manualPayments]);

    const createManualPayment = async () => {
        if (loading) return
        if (!newManualPayment.category) return alert.error('先にチケットカテゴリを登録してください。')
        if (!newManualPayment.name) return alert.error('名前が入力されていません。')
        try {
            setLoading(true)
            const res = await fetch("/api/createManualPayment", {
              method: "POST",
              headers: new Headers({
                "Content-Type": "application/json",
              }),
              body: JSON.stringify({ eventId: id, newManualPayment }),
            });
            if (res.status !== 200) throw new Error((await res.json()).error)
            setNewManualPayment({...newManualPayment, name: ''});
            await revalidate();
            alert.success('手動受付リストを更新しました。')
        } catch(e) {
            alert.error(e.message)
          if (e.message !== "チケットの在庫がありません。") setTimeout(() => location.reload(), 1000);
        }
        setLoading(false)
    }

    const editManualPayment = async (newValue, beforeValue) => {
        if (loading) return
        if (!newValue.name) return alert.error("名前が入力されていません。");
        try {
            setLoading(true);
          const res = await fetch("/api/changeManualPayment", {
            method: "POST",
            headers: new Headers({
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({ eventId: id, beforeValue, newValue }),
          });
          if (res.status !== 200) throw new Error((await res.json()).error)
            await revalidate();
            alert.success('手動受付リストを更新しました。')
        } catch (e) {
            let msg = e.message
          if (e.message !== "チケットの在庫がありません。") {
                msg = "エラーが発生しました。リロードします…";
                setTimeout(() => {
                    location.reload()
                }, 1000);
            }
            alert.error(msg);
        }
        setLoading(false);
    }

    const deleteManualPayment = async (payment) => {
        if (loading) return
        const submit = async () => {
            try {
                setLoading(true);
                setModal(false)
              const res = await fetch("/api/deleteManualPayment", {
                method: "POST",
                headers: new Headers({
                  "Content-Type": "application/json",
                }),
                body: JSON.stringify({ eventId: id, payment }),
              });
              if (res.status !== 200) throw new Error((await res.json()).error)
                await revalidate();
                alert.success('項目を削除しました。')
            } catch (e) {
                alert.error("エラーが発生しました。リロードします…");
              if (e.message !== "チケットの在庫がありません。") setTimeout(() => {
                    location.reload()
                }, 2000);
            }
            setLoading(false);
        }
        setModalInner((
            <>
                <ModalBody>
                    本当に削除しますか？
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => submit()}>はい</Button>{' '}
                    <Button color="secondary" onClick={() => setModal(false)}>キャンセル</Button>
                </ModalFooter>
            </>
        ))
        setModal(true)
    }

    const changeName = (value,i) => {
        const copyTmpManualPayments = [...tmpManualPayments];
        copyTmpManualPayments[i].name = value
        setTmpManualPayments(copyTmpManualPayments);
    }

    const column = (payment,i) => {

        return (
          <tr key={i}>
            <td>
              <Input
                placeholder="お名前"
                value={payment.name}
                onChange={(e) => changeName(e.target.value, i)}
                onBlur={(e) =>
                  editManualPayment(
                    { ...payment, name: e.target.value },
                    payment
                  )
                }
              />
            </td>
            <td>
              <Input
                type="select"
                value={payment.category}
                onChange={(e) =>
                  editManualPayment(
                    { ...payment, category: e.target.value },
                    payment
                  )
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
                value={payment.paid.toString()}
                onChange={(e) =>
                  editManualPayment(
                    { ...payment, paid: e.target.value === "true" },
                    payment
                  )
                }
                disabled={loading}
              >
                <option value="true">○</option>
                <option value="false">×</option>
              </Input>
            </td>
            <td style={{ width: "6em" }}>
              <Button
                style={{ margin: "0.1em" }}
                color="danger"
                disabled={loading}
                onClick={() => deleteManualPayment(payment)}
              >
                削除
              </Button>
            </td>
          </tr>
        );
    }

    return (
        <>
            <Row style={{marginTop: "1.5em"}}>
                <Col>
                    <Link href={`/events/${id}/reception/qrReader`}>
                        <Button color="success">QRリーダーを起動する</Button>
                    </Link>
                </Col>
            </Row>
            <Row style={{ marginTop: "1.5em" }}>
                <Col>
                    <h4>手動受付リスト</h4>
                    <Table striped style={{ marginTop: "1em" }}>
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
                                <td><Input placeholder="お名前" value={newManualPayment.name} onChange={e => setNewManualPayment({...newManualPayment, name: e.target.value})} /></td>
                                <td>
                                    <Input type="select" value={newManualPayment.category} onChange={e => setNewManualPayment({...newManualPayment, category: e.target.value})}>
                                    {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                                    </Input>
                                </td>
                                <td>
                                    <Input type="select" value={newManualPayment.paid.toString()} onChange={e => setNewManualPayment({...newManualPayment, paid: e.target.value === 'true'})}>
                                        <option value='true'>○</option>
                                        <option value='false'>×</option>
                                    </Input>
                                </td>
                                <td style={{ width: '6em' }}>
                                    <Button disabled={loading} color="primary" onClick={createManualPayment}>登録</Button>
                                </td>
                            </tr>
                            {tmpManualPayments && tmpManualPayments.map((e,i) => column(e,i))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    );
}

// export const getStaticPaths: GetStaticPaths = async () => {
//     const { firestore } = await initFirebaseAdmin()
//     const paths = await Promise.all((await firestore.collection('events').get()).docs.map(doc => `/events/${doc.id}/reception`))
//     return { paths, fallback: true }
// }

export const getServerSideProps: GetServerSideProps = async ({query}) => {
    const { id } = query;
    const { firestore } = await initFirebaseAdmin()
    const categoriesSnapShot = (await firestore.collection('events').doc(id as string).collection('categories').orderBy('index').get())
    const categories: FirebaseFirestore.DocumentData[] = []
    categoriesSnapShot.forEach(e => {
        const id = e.id
        const category = e.data()
        categories.push({ ...category, id })
    })
    const eventsSnapShot = (await firestore.collection('events').doc(id as string).get())
    const data = eventsSnapShot.data() as event
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const events = { ...data, startDate, endDate, id: eventsSnapShot.id }

    return { props: { categories, events, id } }
}

export default withAuth(Reception)