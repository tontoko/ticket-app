import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Row, Col, ModalBody, ListGroup, ListGroupItem, Spinner } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import 'firebase/storage'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import Link from 'next/link'
import { useStripe } from '@stripe/react-stripe-js'
import zenginCode from 'zengin-code'
import { setServers } from 'dns'
import { encodeQuery } from '@/src/lib/parseQuery'

export const CreateBankAccount: React.FC<any> = ({ setModal, setModalInner }) => {
  const stripe = useStripe()
  const router = useRouter()
  const alert = useAlert()
  const [routing_number1, setRouting_number1] = useState('')
  const [routing_number2, setRouting_number2] = useState('')
  const [account_number, setAccount_number] = useState('')
  const [account_holder_name, setAccount_holder_name] = useState('')
  const [searchBank, setSearchBank] = useState('')
  const [searchBranch, setSearchBranch] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async(e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const stripeResult = await stripe.createToken('bank_account', {
        country: 'JP',
        currency: 'jpy',
        routing_number: `${routing_number1}${routing_number2}`, // 銀行コード+支店コード
        account_number,
        account_holder_name,
        account_holder_type: 'individual',
      })
      // テスト用
      // const stripeResult = await stripe.createToken('bank_account', {
      //   country: 'JP',
      //   currency: 'jpy',
      //   routing_number: '1100000',
      //   account_number: '0001234',
      //   account_holder_name,
      //   account_holder_type: 'individual',
      // })
      if (stripeResult.error) throw stripeResult.error
      const stripeToken = stripeResult.token.id
      const { firebase } = await initFirebase()
      const firebaseToken = await firebase.auth().currentUser.getIdToken()
      const res = await fetch('/api/createBankAccount', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        credentials: 'same-origin',
        body: JSON.stringify({
          firebaseToken,
          stripeToken
        })
      })
      if (res.status === 200) {
        router.push({ pathname: '/user/bankAccounts', query: { msg: encodeQuery('新しい銀行口座を登録しました。') } }, '/user/bankAccounts')
      }
    } catch(e) {
      alert.error('エラーが発生しました。しばらくしてお試しください。')
    }
    setLoading(false)
  }

  const searchBankCode = async() => {
    if (!searchBank) return
    const result = Object.keys(zenginCode).map(key => {
        if (zenginCode[key].name.match(searchBank)) return zenginCode[key]
      }
    ).filter(Boolean)
    if (result.length === 0) return alert.error('検索結果は0件です。')
    setModalInner(() => (
      <ModalBody>
        <ListGroup>
          {result.map((e, i) => (
            <ListGroupItem tag="button" action key={i} onClick={() => selectBankCode(e)}>{e.name}</ListGroupItem>
          ))}
        </ListGroup>
      </ModalBody>
    ))
    setModal(true)
  }

  const selectBankCode = (bank) => {
    setRouting_number1(bank.code)
    setSearchBank(bank.name)
    setModal(false)
  }

  const searchBranchCode = async () => {
    if (!searchBranch) return
    const targetBankBranches = zenginCode[routing_number1].branches
    const result = Object.keys(targetBankBranches).map(key => {
      if (targetBankBranches[key].name.match(searchBranch)) return targetBankBranches[key]
    }
    ).filter(Boolean)
    if (result.length === 0) return alert.error('検索結果は0件です。')
    setModalInner(() => (
      <ModalBody>
        <ListGroup>
          {result.map((e, i) => (
            <ListGroupItem tag="button" action key={i} onClick={() => selectBranchCode(e)}>{e.name}</ListGroupItem>
          ))}
        </ListGroup>
      </ModalBody>
    ))
    setModal(true)
  }

  const selectBranchCode = (branch) => {
    setRouting_number2(branch.code)
    setSearchBranch(branch.name)
    setModal(false)
  }

  return (
    <Form style={{ marginTop: "1.5em" }} onSubmit={submit}>
      <h3>新しい口座情報を登録</h3>
      <FormGroup style={{ marginTop: '2em' }}>
        <Row form>
          <Col md="4">
            <Label>銀行コード</Label>
            <Input type="number" value={routing_number1} onChange={e => setRouting_number1(e.target.value)} />
          </Col>
          <Col md="6">
            <Label>検索</Label>
            <div style={{ display: 'flex' }}>
              <Input value={searchBank} onChange={e => setSearchBank(e.target.value)} placeholder="(例)三井住友" />
              <Button type="button" style={{ width: '4.5em', marginLeft: '0.5em' }} onClick={searchBankCode}>検索</Button>
            </div>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup style={{ marginTop: '2em' }}>
        <Row form>
          <Col md="4">
            <Label>支店コード</Label>
            <Input type="number" value={routing_number2} onChange={e => setRouting_number2(e.target.value)}/>
          </Col>
          <Col md="6">
            <Label>検索</Label>
            <div style={{ display: 'flex' }}>
              <Input value={searchBranch} onChange={e => setSearchBranch(e.target.value)} placeholder="(例)新宿" />
              <Button type="button" style={{ width: '4.5em', marginLeft: '0.5em' }} disabled={!routing_number1} onClick={searchBranchCode} >検索</Button>
            </div>
          </Col>
        </Row>
        <p><a href="https://www.jp-bank.japanpost.jp/kojin/sokin/furikomi/kouza/kj_sk_fm_kz_1.html" target="_blank">ゆうちょ銀行の支店コード・口座番号を調べる</a></p>
      </FormGroup>
      <FormGroup>
        <Label>口座番号</Label>
        <Input value={account_number} onChange={e => setAccount_number(e.target.value)} />
      </FormGroup>
      <FormGroup>
        <Label>口座名義人 (カタカナ または ローマ字)</Label>
        <Input value={account_holder_name} onChange={e => setAccount_holder_name(e.target.value)} />
      </FormGroup>
      <FormGroup>
        <Row form style={{ margin: 0, marginTop: '2em' }}>
          <Button className="ml-auto" disabled={loading}>{loading ? <Spinner /> : '登録'}</Button>
        </Row>
      </FormGroup>
    </Form>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx)
  return { props: { user } }
}

export default CreateBankAccount