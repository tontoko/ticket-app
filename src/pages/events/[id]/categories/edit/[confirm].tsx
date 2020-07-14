import { useRouter } from 'next/router'
import React, { useState } from 'react'
import {
  Form, FormGroup, Button, Row, Spinner
} from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import { decodeQuery, encodeQuery } from '@/src/lib/parseQuery'
import { useAlert } from 'react-alert'

const Confirmation= props => {
  const router = useRouter()
  const alert = useAlert()
  const categories:any[] = JSON.parse(props.categories)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    try {
      setLoading(true)
      const {firestore} = await initFirebase()
      const categoriesRef = firestore.collection('events').doc(router.query.id as string).collection('categories')
      let names = []
      categories.filter(e => {
        if (!e.name) throw new Error('チケット名を入力してください。')
        if (e.price < 500) throw new Error('チケットの価格は500円以上に設定してください。')
        if (e.stock < 1 && e.new) throw new Error('チケットの在庫は1枚以上に設定してください。')
        if (names.indexOf(e["name"]) === -1) {
          names.push(e["name"])
          return e
        }
        throw new Error('チケット名が重複しています')
      })
      let addCategories = []
      let updateCategories: {string?: FirebaseFirestore.DocumentData} = {}
      await Promise.all(categories.map(async (category, i) => {
        if (category.new) {
          const addCategory = { ...category, price: Number(category.price), stock: Number(category.stock), sold: 0, createdUser: props.user.uid, index: i }
          delete addCategory.new
          addCategories.push(addCategory)
        } else {
          const updateCategory = { stock: Number(category.stock), public: category.public, index: i }
          updateCategories[category.id] = updateCategory
        }
      }))
      // 既存カテゴリ編集
      await firestore.runTransaction(async transaction => {
        await Promise.all(Object.keys(updateCategories).map(async id => {
          const targetCategory = (await transaction.get(categoriesRef.doc(id))).data()
          if (updateCategories[id].stock - targetCategory.sold < 1) throw new Error('チケットの在庫は売り上げ分を引いて1枚以上に設定してください。')
          transaction.update(categoriesRef.doc(id), updateCategories[id])
          return
        }))
      })
      // 新規カテゴリ登録
      await Promise.all(addCategories.map(async addCategory => categoriesRef.add(addCategory)))
      router.push({pathname: `/events/${router.query.id}`, query: { msg: encodeQuery('更新しました。') }})
    } catch(e) {
      alert.error(e.message)
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
  const { user } = await isLogin(ctx, 'redirect')
  const {confirm} = ctx.query
  return { props: { user, categories: decodeQuery(confirm as string)} }
}