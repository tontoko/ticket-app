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
import { useDocumentDataOnce, useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import { encodeQuery } from '@/src/lib/parseQuery';

class NoStockError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NoStockError";
    }
}

type manualPayment = {category: string, name: string, paid: boolean, id: string}

const Reception = ({ categories, id, setModal, setModalInner }) => {
    const router = useRouter()
    const alert = useAlert()

    const [loading, setLoading] = useState(true)
    const [newManualPayment, setNewManualPayment] = useState<manualPayment>({
      name: "",
      category: categories.length > 0 ? categories[0].id : "",
      paid: true,
      id: "",
    });
    const [manualPayments, setManualPayments] = useState<manualPayment[]>([]);

    useEffect(() => {
        (async() => {
        (await firestore())
            .collection("events")
            .doc(id as string)
            .collection("manualPayments")
            .onSnapshot(async snap => {
                const data = await Promise.all(snap.docs.map(async doc => {return { ...doc.data(), id: doc.id } as manualPayment }))
                setManualPayments(data);
                setLoading(false);
            })
        })()
    }, []);

    const createManualPayment = async () => {
        if (loading) return
        if (!newManualPayment.category) return alert.error('先にチケットカテゴリを登録してください。')
        if (!newManualPayment.name) return alert.error('名前が入力されていません。')
        try {
            setLoading(true)
            await (await firestore()).runTransaction(async transaction => {
                const categoryRef = (await firestore()).collection('events').doc(id as string).collection('categories').doc(newManualPayment.category)
                const manualPaymentsRef = (await firestore())
                  .collection("events")
                  .doc(id as string)
                  .collection("manualPayments")
                  .doc(
                    new Date().getTime().toString() +
                      encodeQuery(newManualPayment.name)
                  );
                const targetCategory = (await transaction.get(categoryRef)).data()
                if (targetCategory.stock - targetCategory.sold < 1) throw new NoStockError('チケットの在庫がありません。')
                transaction.set(manualPaymentsRef, { ...newManualPayment });
                transaction.update(categoryRef, {
                  sold: targetCategory.sold + 1,
                  stock: targetCategory.stock - 1,
                });
            })
            setNewManualPayment({...newManualPayment, name: ''});
            alert.success('手動受付リストを更新しました。')
        } catch(e) {
            alert.error(e.message)
            if (!(e instanceof NoStockError)) setTimeout(() => {
                location.reload()
            }, 1000);
        }
        setLoading(false)
    }

    const editManualPayment = async (newValue, beforeValue) => {
        if (loading) return
        console.log(newValue)
        if (!newValue.name) return alert.error("名前が入力されていません。");
        try {
            setLoading(true)
            await(await firestore()).runTransaction(async (transaction) => {
              const newCategoryRef = (await firestore())
                .collection("events")
                .doc(id as string)
                .collection("categories")
                .doc(newValue.category);
              const beforeCategoryRef = (await firestore())
                .collection("events")
                .doc(id as string)
                .collection("categories")
                .doc(beforeValue.category);
              const manualPaymentsRef = (await firestore())
                .collection("events")
                .doc(id as string)
                .collection("manualPayments")
                .doc(beforeValue.id);
              const newCategory = (
                await transaction.get(newCategoryRef)
              ).data();
              const beforeCategory = (
                await transaction.get(beforeCategoryRef)
              ).data();

              transaction.update(manualPaymentsRef, { ...newValue });

              if (newValue.category !== beforeValue.category) {
                if (newCategory.stock - newCategory.sold < 1)
                  throw new NoStockError("チケットの在庫がありません。");
                transaction.update(newCategoryRef, {
                  sold: newCategory.sold + 1,
                  stock: newCategory.stock - 1,
                });
                transaction.update(beforeCategoryRef, {
                  sold: beforeCategory.sold - 1,
                  stock: beforeCategory.stock + 1,
                });
              }
            });
            alert.success('手動受付リストを更新しました。')
        } catch (e) {
            let msg = e.message
            if (!(e instanceof NoStockError)) {
                msg = "エラーが発生しました。リロードします…";
                setTimeout(() => {
                    location.reload()
                }, 1000);
            }
            alert.error(msg);
        }
        setLoading(false)
    }

    const deleteManualPayment = async (payment) => {
        if (loading) return
        const submit = async () => {
            try {
                setLoading(true)
                setModal(false)
                await (await firestore()).runTransaction(async transaction => {
                    const categoryRef = (await firestore()).collection('events').doc(id as string).collection('categories').doc(payment.category)
                    const manualPaymentsRef = (await firestore())
                      .collection("events")
                      .doc(id as string)
                      .collection("manualPayments")
                      .doc(payment.id);
                    const targetCategory = (await transaction.get(categoryRef)).data()
                    transaction.delete(manualPaymentsRef);
                    transaction.update(categoryRef, {
                      sold: targetCategory.sold - 1,
                      stock: targetCategory.stock + 1,
                    });
                })
                alert.success('項目を削除しました。')
            } catch (e) {
                alert.error("エラーが発生しました。リロードします…");
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
                    <Button color="primary" onClick={() => submit()}>はい</Button>{' '}
                    <Button color="secondary" onClick={() => setModal(false)}>キャンセル</Button>
                </ModalFooter>
            </>
        ))
        setModal(true)
    }

    const column = (payment,i) => {

        return (
          <tr key={i}>
            <td>
              <Input
                placeholder="お名前"
                value={payment.name}
                onChange={(e) => {
                    const newValue = [...manualPayments];
                    newValue.splice(i, 1, {
                      ...payment,
                      name: e.target.value,
                    });
                    setManualPayments(newValue);
                }}
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
              >
                <option value="true">○</option>
                <option value="false">×</option>
              </Input>
            </td>
            <td style={{ width: '6em' }}>
                <Button style={{ margin: '0.1em' }} color="danger" disabled={loading} onClick={() => deleteManualPayment(payment)}>削除</Button>
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
                            {manualPayments && manualPayments.map((e,i) => column(e,i))}
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