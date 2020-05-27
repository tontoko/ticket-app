import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
  Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, FormFeedback, Spinner
} from 'reactstrap'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import initFirebase from '@/src/lib/initFirebase'
import errorMsg from '@/src/lib/errorMsg'
import { GetServerSideProps } from 'next'
import { event } from 'events'
import isLogin from '@/src/lib/isLogin'
import atob from 'atob'
import { decodeQuery } from '@/src/lib/parseQuery'

const Confirmation= props => {
  const router = useRouter()
  const categories:any[] = JSON.parse(props.categories)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    const {firestore} = await initFirebase()
    const categoriesRef = firestore.collection('events').doc(router.query.id as string).collection('categories')
    let updateCategories: {string?: FirebaseFirestore.DocumentData} = {}
    let names = []
    categories.filter(e => {
      if (!e.name) throw new Error('チケット名を入力してください。')
      if (e.price < 500) throw new Error('チケットの価格は500円以上に設定してください。')
      if (e.stock < 1 && e.new) throw new Error('チケットの在庫は1枚以上に設定してください。')
      if (!e.new && e.stock - e.sold < 1) throw new Error('チケットの在庫は売り上げ分を引いて1枚以上に設定してください。')
      if (names.indexOf(e["name"]) === -1) {
        names.push(e["name"])
        return e
      }
      throw new Error('チケット名が重複しています')
    })
    try {
      await Promise.all(categories.map(async category => {
        if (category.new) {
          const addCategory = { ...category, price: Number(category.price), stock: Number(category.stock), sold: 0, createdUser: props.user.uid }
          delete addCategory.new
          categoriesRef.add(addCategory)
        } else {
          const updateCategory = { ...category, price: Number(category.price), stock: Number(category.stock) }
          const id = { ...updateCategory}.id
          delete updateCategory.id
          updateCategories[id] = updateCategory
        }
      }))
      await firestore.runTransaction(async transaction => {
        Object.keys(updateCategories).map(async id => {
          transaction.set(categoriesRef.doc(id), updateCategories[id])
        })
      })
      router.push(`/events/${router.query.id}?msg=更新しました`)
    } catch(e) {
      errorMsg(e)
      setLoading(false)
    }
  }

  return (
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
        <Button style={{ marginRight: '1em', marginTop: '0.5em' }} disabled={loading}>{loading ? <Spinner/> : '設定'}</Button>
      </Row>
    </Form>
  );
}

export default Confirmation

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { user } = await isLogin(ctx)
  const {confirm} = ctx.query
  return { props: { user, categories: decodeQuery(confirm as string)} }
}