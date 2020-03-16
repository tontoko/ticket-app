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
  const [categories, setCategories] = useState([...JSON.parse(router.query.confirm as string)])

  const submit = async () => {
    const {firebase, firestore} = await initFirebase()
    const eventRef = firestore.collection('events').doc(router.query.id as string)
    try {
      await firestore.runTransaction(async transaction => {
        const event = transaction.get(eventRef)
        const conversionedCategories = [...categories].map(category => ({...category, price: Number(category.price)}))
        transaction.set(eventRef, { ...(await event).data(), categories: conversionedCategories})
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
        {categories.map((category,i) => (
          <FormGroup key={i}>
            <p>{`${category.name}: ${category.price} 円`}</p>
          </FormGroup>
        ))}
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
  return { props: {user} }
}