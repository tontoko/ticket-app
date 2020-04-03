import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
  Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, FormFeedback, Spinner
} from 'reactstrap'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import initFirebase from '@/src/lib/initFirebase'
import errorMsg from '@/src/lib/errorMsg'
import { GetServerSideProps } from 'next'
import { event } from 'events'
import isLogin from '@/src/lib/isLogin'

const Confirmation= props => {
  const router = useRouter()
  const categories:any[] = JSON.parse(props.categories)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (loading) return
    setLoading(true)
    const {firestore} = await initFirebase()
    const categoriesRef = firestore.collection('events').doc(router.query.id as string).collection('categories')
    let updateCategories: {string?: FirebaseFirestore.DocumentData} = {}
    await Promise.all(categories.map(async category => {
      if (category.new) {
        const addCategory = { ...category, price: Number(category.price), stock: Number(category.stock) }
        delete addCategory.new
        categoriesRef.add(addCategory)
      } else {
        const updateCategory = { ...category, price: Number(category.price), stock: Number(category.stock) }
        const id = { ...updateCategory}.id
        delete updateCategory.id
        updateCategories[id] = updateCategory
      }
    }))
    try {
      await firestore.runTransaction(async transaction => {
        await Promise.all(Object.keys(updateCategories).map(async id => {
          transaction.set(categoriesRef.doc(id), updateCategories[id])
        }))
      })
      router.push(`/events/${router.query.id}?msg=更新しました`)
    } catch(e) {
      errorMsg(e)
      setLoading(false)
    }
  }

  return (
    <Container>
      <Form style={{ marginTop: '5em' }} onSubmit={submit}>
        <h4 style={{ marginBottom: '1em' }}>
          チケットカテゴリーを更新します。
        </h4>
        <h5>
          一度登録したチケット情報は変更することができません。 (非公開にすることはできます)
        </h5>
        <h5 style={{marginBottom: '2em'}}>よろしいですか？</h5>
        {categories.map((category,i) => (
            <FormGroup key={i}>
              <p>{`${category.name}: ${category.price} 円 (在庫: ${category.stock})${!category.public ? ' (非公開)' : ''}`}</p>
            </FormGroup>
          )
        )}
        <Row className="flex-row-reverse">
          <Button style={{ marginRight: '1em', marginTop: '0.5em' }} onClick={submit}>{loading ? <Spinner/> : '設定'}</Button>
        </Row>
      </Form>
    </Container>
  );
}

export default Confirmation

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { user } = await isLogin(ctx)
  const {confirm} = ctx.query
  return { props: { user, categories: confirm} }
}