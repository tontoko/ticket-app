import React, { Component, useState } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Table, Container, Row, Col, Label, Button, Input, FormGroup, Form, ModalBody, ModalFooter } from 'reactstrap';
import { GetServerSideProps } from 'next';
import isLogin from '@/src/lib/isLogin';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import initFirebase from '@/src/lib/initFirebase';
import { useAlert } from 'react-alert';

class NoStockError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NoStockError";
    }
}

export default ({ events, categories, query, setModal, setModalInner }) => {

    const router = useRouter()
    const alert = useAlert()

    const [originalManualPayments, setOriginalManualPayments] = useState(events.manualPayments ? events.manualPayments : [])
    const [manualPayments, setManualPayments] = useState(events.manualPayments ? events.manualPayments : [])
    const [newManualPayment, setNewManualPayment] = useState({
        name: '',
        category: categories.length > 0 ? categories[0].id : '',
        paid: true
    })
    const [loading, setLoading] = useState(false)

    const createManualPayment = async () => {
        if (loading) return
        if (!newManualPayment.category) return alert.error('先にチケットカテゴリを登録してください。')
        if (!newManualPayment.name) return alert.error('名前が入力されていません。')
        try {
            setLoading(true)
            const { firebase, firestore } = await initFirebase()
            await firestore.runTransaction(async transaction => {
                const categoryRef = firestore.collection('events').doc(query.id as string).collection('categories').doc(newManualPayment.category)
                const eventRef = firestore.collection('events').doc(query.id as string)
                const targetCategory = (await transaction.get(categoryRef)).data()
                if (targetCategory.stock - targetCategory.sold < 1) throw new NoStockError('チケットの在庫がありません。')
                transaction.update(eventRef, {
                    manualPayments: firebase.firestore.FieldValue.arrayUnion(newManualPayment)
                })
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
            const { firestore } = await initFirebase()
            await firestore.runTransaction(async transaction => {
                const categoryRef = firestore.collection('events').doc(query.id as string).collection('categories').doc(manualPayments[i].category)
                const originalCategoryRef = firestore.collection('events').doc(query.id as string).collection('categories').doc(originalManualPayments[i].category)
                const eventRef = firestore.collection('events').doc(query.id as string)
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
                const { firestore } = await initFirebase()
                let copyManualPayments = [...manualPayments]
                copyManualPayments.splice(i,1)
                await firestore.runTransaction(async transaction => {
                    const categoryRef = firestore.collection('events').doc(query.id as string).collection('categories').doc(manualPayments[i].category)
                    const eventRef = firestore.collection('events').doc(query.id as string)
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
                    <Button style={{ margin: '0.1em' }} color="success" onClick={() => editManualPayment(i)}>編集</Button>
                    <Button style={{ margin: '0.1em' }} color="danger" onClick={() => deleteManualPayment(i)}>削除</Button>
                </td>
            </tr>
        );
    }

    return (
        <>
            <Row style={{marginTop: "1.5em"}}>
                <Col>
                    <Link href={`/events/${router.query.id}/reception/qrReader`}>
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
                                    <Button color="primary" onClick={createManualPayment}>登録</Button>
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { user } = await isLogin(ctx, 'redirect')

    const { query } = ctx
    const { firestore } = await initFirebaseAdmin()
    const categoriesSnapShot = (await firestore.collection('events').doc(query.id as string).collection('categories').get())
    let categories: FirebaseFirestore.DocumentData[] = []
    categoriesSnapShot.forEach(e => {
        const id = e.id
        const category = e.data()
        categories.push({ ...category, id })
    })
    const eventsSnapShot = (await firestore.collection('events').doc(query.id as string).get())
    const data = eventsSnapShot.data()
    const createdAt = data.createdAt.seconds
    const updatedAt = data.updatedAt.seconds
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const events = { ...data, createdAt, updatedAt, startDate, endDate, id: eventsSnapShot.id }

    return { props: { user, query: ctx.query, categories, events } }
}