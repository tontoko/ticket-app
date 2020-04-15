import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Card, CardTitle, CardText } from 'reactstrap'
import 'firebase/storage'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import Link from 'next/link'
import { Stripe } from '@/src/lib/stripe'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'

export const BankAccounts: React.FC<any> = ({ bankAccounts }) => {
  const router = useRouter()
  const alert = useAlert()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')

  return (
    <Form style={{ marginTop: "1.5em" }}>
      <h3>口座情報</h3>
      {bankAccounts.map((e: Stripe.BankAccount) => (
          <Card body>
          <CardTitle>{e.bank_name}</CardTitle>
          <CardText>最後の4桁: {e.last4}</CardText>
          <Button>更新する</Button>
        </Card>
        ))
      }

      <FormGroup>
        <Link href="/user/bankAccounts/new">
          <Button>新しい口座を登録</Button>
        </Link>
      </FormGroup>
    </Form>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx)
  const { firestore } = await initFirebaseAdmin()
  const bankAccounts = (await firestore.collection('users').doc(user.uid).collection('bankAccounts').get()).docs
  return { props: { user, bankAccounts } }
}

export default BankAccounts