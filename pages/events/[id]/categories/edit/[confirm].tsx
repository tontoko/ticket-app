import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
  Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, FormFeedback
} from 'reactstrap'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import initFirebase from '@/initFirebase'
import errorMsg from '@/lib/errorMsg'
import { GetServerSideProps } from 'next'
import { event } from 'events'
import isLogin from '@/lib/isLogin'

const Confirmation= props => {
  const router = useRouter()
  const categories:any[] = JSON.parse(props.categories)

  const submit = async () => {
    const {firestore} = await initFirebase()
    const categoriesRef = firestore.collection('events').doc(router.query.id as string).collection('categories')
    let updateCategories: FirebaseFirestore.DocumentData[]
    await Promise.all(categories.map(async category => {
      if (category.new) {
        const addCategory = { ...category, price: Number(category.price) }
        delete addCategory.new
        categoriesRef.add(addCategory)
      } else {
        const updateCategory = { ...category, price: Number(category.price) }
        const { id } = updateCategory
        delete updateCategory.id
        updateCategories.push({ [id]: updateCategory})
      }
    }))
    try {
      await firestore.runTransaction(async transaction => {
        await Promise.all(Object.keys(updateCategories).map(async id => {
          transaction.set(categoriesRef.doc(id), updateCategories[id])
        }))
      })
    } catch(e) {
      errorMsg(e)
    }
    router.push(`/events/${router.query.id}?msg=更新しました`)
  }

  return (
    <Container>
      <Form style={{ marginTop: '5em' }}>
        <h5 style={{ marginBottom: '1em' }}>チケットカテゴリーを以下に更新します。<br/>よろしいですか？</h5>
        {categories.map((category,i) => {
          if (category.public) return (
            <FormGroup key={i}>
              <p>{`${category.name}: ${category.price} 円 (在庫: ${category.stock})`}</p>
            </FormGroup>
          )
        }
        )}
        <Row className="flex-row-reverse">
          <Button style={{ marginRight: '1em', marginTop: '0.5em' }} onClick={submit} >設定</Button>
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