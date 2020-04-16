import { useRouter } from 'next/router'
import React, { Dispatch, SetStateAction, ReactElement } from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Card, CardTitle, CardText, Col, CardBody, ModalBody, ModalFooter } from 'reactstrap'
import 'firebase/storage'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { GetServerSideProps, NextPage } from 'next'
import isLogin from '@/src/lib/isLogin'
import Link from 'next/link'
import stripe, { Stripe } from '@/src/lib/stripe'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import initFirebase from '@/src/lib/initFirebase'

type props = { 
  bankAccounts: Stripe.BankAccount[], 
  setModal: Dispatch<SetStateAction<boolean>>, 
  setModalInner: Dispatch<SetStateAction<ReactElement>> 
}

export const BankAccounts: NextPage<props> = ({ bankAccounts, setModal, setModalInner }) => {
  const router = useRouter()
  const alert = useAlert()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [bankAccountsState, setBankAccountsState] = useState(bankAccounts)

  const changeDefaultBankAccount = async (id, i) => {
    const { firebase } = await initFirebase()
    const firebaseToken = await firebase.auth().currentUser.getIdToken()
    const res = await fetch('/api/changeDefaultBankAccount', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      credentials: 'same-origin',
      body: JSON.stringify({
        firebaseToken,
        id
      })
    })
    if (res.status === 200) {
      const newBankAccountsState = [...bankAccountsState].map((account, index) => {
        if (account.default_for_currency) return { ...account, default_for_currency: false } 
        if (i === index) return { ...account, default_for_currency: true } 
        return account
      })
      setBankAccountsState(newBankAccountsState)
      alert.success('既定の口座を変更しました。')
    } else {
      alert.error('エラーが発生しました。しばらくしてお試しください。')
    }
  }

  const deleteBankAccount = (id, i) => {
    const submit = async() => {
      setModal(false)
      const { firebase } = await initFirebase()
      const firebaseToken = await firebase.auth().currentUser.getIdToken()
      const res = await fetch('/api/deleteBankAccount', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        credentials: 'same-origin',
        body: JSON.stringify({
          firebaseToken,
          id
        })
      })
      if (res.status === 200) {
        let newBankAccountsState = [...bankAccountsState]
        newBankAccountsState.splice(i, 1)
        setBankAccountsState(newBankAccountsState)
        alert.success('口座を削除しました。')
      } else {
        alert.error('エラーが発生しました。しばらくしてお試しください。')
      }
    }
    
    setModalInner((
      <>
      <ModalBody>
        本当に削除しますか？
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={submit}>はい</Button>{' '}
        <Button color="secondary" onClick={() => setModal(false)}>キャンセル</Button>
      </ModalFooter>
      </>
    ))
    setModal(true)
  }

  return (
    <div style={{ marginTop: "1.5em" }}>
      <h3>口座情報</h3>
      <Row style={{ margin: "2em 0" }}>
      {bankAccountsState.map((bankAccount: Stripe.BankAccount, i) => (
        <Col md="4" key={i} style={{ marginBottom: '1em' }}>
          <Card key={i}>
          <CardBody>
            <CardTitle>{bankAccount.bank_name}</CardTitle>
            <CardText>最後の4桁: {bankAccount.last4}</CardText>
              {bankAccount.default_for_currency ?
              <Button disabled>既定の口座</Button>
              :
              <>
              <Button color="info" onClick={e => changeDefaultBankAccount(bankAccount.id, i)}>既定の口座に変更</Button>
              <Button color="danger" onClick={e => deleteBankAccount(bankAccount.id, i)} style={{ marginLeft: '0.5em' }}>削除</Button>
              </>
              }
            </CardBody>
          </Card>
          </Col>
        ))
      }
      </Row>

      <FormGroup>
        <Link href="/user/bankAccounts/new">
          <Button>新しい口座を登録</Button>
        </Link>
      </FormGroup>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx)
  const { firestore } = await initFirebaseAdmin()
  const { stripeId } = (await firestore.collection('users').doc(user.uid).get()).data()
  const result: Stripe.ApiList<Stripe.BankAccount> = await stripe.accounts.listExternalAccounts(
    stripeId,
    // @ts-ignore
    { object: 'bank_account', limit: 100 }
  )
  return { props: { user, bankAccounts: result.data } }
}

export default BankAccounts