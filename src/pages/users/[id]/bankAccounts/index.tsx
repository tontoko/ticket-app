import React, { Dispatch, SetStateAction, ReactElement, useEffect } from 'react'
import { useState } from 'react'
import { FormGroup, Button, Row, Card, CardTitle, CardText, Col, CardBody, ModalBody, ModalFooter } from 'reactstrap'
import { useAlert } from "react-alert"
import { NextPage } from 'next'
import Link from 'next/link'
import { Stripe } from '@/src/lib/stripe'
import Loading from '@/src/components/loading'
import withAuth from '@/src/lib/withAuth'

type props = {
  user: firebase.User,
  bankAccounts: Stripe.BankAccount[], 
  setModal: Dispatch<SetStateAction<boolean>>, 
  setModalInner: Dispatch<SetStateAction<ReactElement>> 
}

export const BankAccounts: NextPage<props> = ({ user, setModal, setModalInner }) => {
  const alert = useAlert()
  const [bankAccounts, setBankAccounts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    (async () => {
      const res = await fetch("/api/getBankAccounts", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ uid: user.uid }),
      });
      setBankAccounts((await res.json()).bankAccounts.data);
    })()
  }, [user])

  const changeDefaultBankAccount = async (id, i) => {
    setLoading(true);
    const firebaseToken = await user.getIdToken()
    const res = await fetch("/api/changeDefaultBankAccount", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        firebaseToken,
        id,
      }),
    });
    if (res.status === 200) {
      const res = await fetch("/api/getBankAccounts", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ uid: user.uid }),
      });
      setBankAccounts((await res.json()).bankAccounts.data);
      alert.success('既定の口座を変更しました。')
    } else {
      alert.error('エラーが発生しました。しばらくしてお試しください。')
    }
    setLoading(false)
  }

  const deleteBankAccount = (id, i) => {
    const submit = async() => {
      setLoading(true)
      setModal(false)
      const firebaseToken = await user.getIdToken()
      const res = await fetch("/api/deleteBankAccount", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          firebaseToken,
          id,
        }),
      });
      if (res.status === 200) {
        const newBankAccounts = [...bankAccounts]
        newBankAccounts.splice(i, 1)
        setBankAccounts(newBankAccounts)
        alert.success('口座を削除しました。')
      } else {
        alert.error('エラーが発生しました。しばらくしてお試しください。')
      }
      setLoading(false)
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
        {!user && <Loading />}
        {bankAccounts.map((bankAccount: Stripe.BankAccount, i) => (
          <Col md="4" key={i} style={{ marginBottom: "1em" }}>
            <Card key={i}>
              <CardBody>
                <CardTitle>{bankAccount.bank_name}</CardTitle>
                <CardText>最後の4桁: {bankAccount.last4}</CardText>
                {bankAccount.default_for_currency ? (
                  <Button disabled>既定の口座</Button>
                ) : (
                  <Row>
                    <Col xl="6" lg="7" md="12">
                      <Button
                        color="success"
                        disabled={loading}
                        onClick={() =>
                          changeDefaultBankAccount(bankAccount.id, i)
                        }
                        style={{ marginBottom: "0.2em" }}
                      >
                        既定に変更
                      </Button>
                    </Col>
                    <Col xl="6" lg="5" md="12">
                      <Button
                        color="danger"
                        disabled={loading}
                        onClick={() => deleteBankAccount(bankAccount.id, i)}
                        style={{ marginBottom: "0.2em" }}
                      >
                        削除
                      </Button>
                    </Col>
                  </Row>
                )}
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <FormGroup>
        <Link href={`/users/${user.uid}/bankAccounts/new`}>
          <Button>新しい口座を登録</Button>
        </Link>
      </FormGroup>
    </div>
  );
}

export default withAuth(BankAccounts)