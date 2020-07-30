import React, { Component, useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Table, Container, Row, Col, Label, Button, Input, FormGroup, Form, ModalBody, ModalFooter } from 'reactstrap';
import { GetServerSideProps, GetStaticProps, GetStaticPaths } from 'next';
import isLogin from '@/src/lib/isLogin';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import { useAlert } from 'react-alert';
import { event } from 'events';
import { firestore, firebase } from '@/src/lib/initFirebase';
import withAuth from '@/src/lib/withAuth';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';

class NoStockError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NoStockError";
    }
}

type manualPayment = {category: string, name: string, paid: boolean}

const Reception = ({ categories, id, setModal, setModalInner }) => {
    const router = useRouter()
    const alert = useAlert()

    const [originalManualPayments, setOriginalManualPayments] = useState<manualPayment[]>([])
    const [manualPayments, setManualPayments] = useState<manualPayment[]>([]);
    const [newManualPayment, setNewManualPayment] = useState<manualPayment>({
      name: "",
      category: categories.length > 0 ? categories[0].id : "",
      paid: true,
    });
    const [loading, setLoading] = useState(true)
    const [firebaseresult, firebaseLoading] = useDocumentDataOnce<{manualPayments: manualPayment[]}>(
      firestore
        .collection("events")
        .doc(id as string)
        .collection("manualPayments")
        .doc("default")
    );

    useEffect(() => {
      if (firebaseLoading) return;
      setLoading(false);
      if (!firebaseresult) return;
      const firebaseManualPayments = firebaseresult.manualPayments;
      setOriginalManualPayments(firebaseManualPayments);
      setManualPayments(firebaseManualPayments);
    }, [firebaseLoading]);

    const createManualPayment = async () => {
        if (loading) return
        if (!newManualPayment.category) return alert.error('先にチケットカテゴリを登録してください。')
        if (!newManualPayment.name) return alert.error('名前が入力されていません。')
        try {
            setLoading(true)
            await firestore.runTransaction(async transaction => {
                const categoryRef = firestore.collection('events').doc(id as string).collection('categories').doc(newManualPayment.category)
                const manualPaymentsRef = firestore
                  .collection("events")
                  .doc(id as string)
                  .collection("manualPayments").doc('default');
                const targetCategory = (await transaction.get(categoryRef)).data()
                if (targetCategory.stock - targetCategory.sold < 1) throw new NoStockError('チケットの在庫がありません。')
                transaction.set(manualPaymentsRef, {
                  manualPayments: firebase.firestore.FieldValue.arrayUnion(
                    newManualPayment
                  ),
                });
                transaction.update(categoryRef, {
                    sold: targetCategory.sold + 1
                })
            })
            setNewManualPayment({
                ...newManualPayment,
                name: ''
            })
            const newState = [...manualPayments, newManualPayment]
            setManualPayments(newState)
            setOriginalManualPayments(newState)
            alert.success('手動受付リストを更新しました。')
        } catch(e) {
            alert.error(e.message)
            if (!(e instanceof NoStockError)) setTimeout(() => {
                location.reload()
            }, 1000);
        }
        setLoading(false)
    }

    const editManualPayment = async (i: number) => {
        if (loading) return
        if (!manualPayments[i].name) return alert.error('名前が入力されていません。')
        try {
            setLoading(true)
            await firestore.runTransaction(async transaction => {
                const categoryRef = firestore.collection('events').doc(id as string).collection('categories').doc(manualPayments[i].category)
                const originalCategoryRef = firestore.collection('events').doc(id as string).collection('categories').doc(originalManualPayments[i].category)
                const eventRef = firestore.collection('events').doc(id as string)
                const targetCategory = (await transaction.get(categoryRef)).data()
                const originalCategory = (await transaction.get(originalCategoryRef)).data()

                if (targetCategory.stock - targetCategory.sold < 1) throw new NoStockError('チケットの在庫がありません。')
                if (originalCategory.sold < 1) throw new Error('他の端末でリストが更新された可能性があります。リロードします。')
                transaction.update(eventRef, {
                    manualPayments
                })
                transaction.update(categoryRef, {
                    sold: targetCategory.sold + 1
                })
                transaction.update(originalCategoryRef, {
                    sold: originalCategory.sold - 1
                })
                setOriginalManualPayments(manualPayments)
            })
            alert.success('手動受付リストを更新しました。')
        } catch (e) {
            alert.error(e.message)
            if (!(e instanceof NoStockError)) setTimeout(() => {
                location.reload()
            }, 1000);
        }
        setLoading(false)
    }

    const deleteManualPayment = async (i: number) => {
        if (loading) return
        const submit = async (i: number) => {
            try {
                setLoading(true)
                setModal(false)
                let copyManualPayments = [...manualPayments]
                copyManualPayments.splice(i,1)
                await firestore.runTransaction(async transaction => {
                    const categoryRef = firestore.collection('events').doc(id as string).collection('categories').doc(manualPayments[i].category)
                    const eventRef = firestore.collection('events').doc(id as string)
                    const targetCategory = (await transaction.get(categoryRef)).data()
                    if (targetCategory.sold < 1) throw new Error('他の端末でリストが更新された可能性があります。リロードします。')
                    transaction.update(eventRef, {
                        manualPayments: copyManualPayments
                    })
                    transaction.update(categoryRef, {
                        sold: targetCategory.sold - 1
                    })
                })
                setManualPayments(copyManualPayments)
                setOriginalManualPayments(copyManualPayments)
                alert.success('項目を削除しました。')
            } catch (e) {
                alert.error(e.message)
                if (!(e instanceof NoStockError)) setTimeout(() => {
                    location.reload()
                }, 2000);
            }
            setLoading(false)
        }
        setModalInner((
            <>
                <ModalBody>
                    本当に削除しますか？
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => submit(i)}>はい</Button>{' '}
                    <Button color="secondary" onClick={() => setModal(false)}>キャンセル</Button>
                </ModalFooter>
            </>
        ))
        setModal(true)
    }

    const setValue = (v,i,key) => {
        const copyManualPayments = [...manualPayments]
        copyManualPayments.splice(i,1,{
            ...manualPayments[i],
            [key]: v
        })
        setManualPayments(copyManualPayments)
    }

    const column = (e,i) => {

        return (
            <tr key={i}>
                <td><Input placeholder="お名前" value={e.name} onChange={e => setValue(e.target.value,i,'name')} /></td>
                <td>
                    <Input type="select" value={manualPayments[i].category} onChange={e => setValue(e.target.value, i, 'category')}>
                        {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </Input>
                </td>
                <td>
                    <Input type="select" value={manualPayments[i].paid.toString()} onChange={e => setValue(e.target.value === 'true', i, 'paid')}>
                        <option value='true'>○</option>
                        <option value='false'>×</option>
                    </Input>
                </td>
                <td style={{ width: '6em' }}>
                    <Button style={{ margin: '0.1em' }} color="success" disabled={loading} onClick={() => editManualPayment(i)}>編集</Button>
                    <Button style={{ margin: '0.1em' }} color="danger" disabled={loading} onClick={() => deleteManualPayment(i)}>削除</Button>
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
                                <td><Input type="select" value={newManualPayment.category} onChange={e => setNewManualPayment({ ...newManualPayment, category: e.target.value })}>
                                    {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                                    </Input>
                                </td>
                                <td>
                                    <Input type="select" value={newManualPayment.paid.toString()} onChange={e => setNewManualPayment({ ...newManualPayment, paid: e.target.value === 'true' })}>
                                        <option value='true'>○</option>
                                        <option value='false'>×</option>
                                    </Input>
                                </td>
                                <td style={{ width: '6em' }}>
                                    <Button disabled={loading} color="primary" onClick={createManualPayment}>登録</Button>
                                </td>
                            </tr>
                            {manualPayments.map((e,i) => column(e,i))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { firestore } = await initFirebaseAdmin()
    const paths = await Promise.all((await firestore.collection('events').get()).docs.map(doc => `/events/${doc.id}/reception`))
    return { paths, fallback: true }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
    const { id } = params;
    const { firestore } = await initFirebaseAdmin()
    const categoriesSnapShot = (await firestore.collection('events').doc(id as string).collection('categories').orderBy('index').get())
    let categories: FirebaseFirestore.DocumentData[] = []
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