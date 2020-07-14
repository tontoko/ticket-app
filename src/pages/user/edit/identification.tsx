import Link from 'next/link'
import React, { useState, Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import stripe from '@/src/lib/stripe'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import initFirebase from '@/src/lib/initFirebase'
import { useAlert } from 'react-alert'
import { useRouter } from 'next/router'
import { encodeQuery } from '@/src/lib/parseQuery'

const Identification = ({ user, verification }) => {
  const alert = useAlert()
  const router = useRouter()

  const [file1, setFile1]: [File, Dispatch<SetStateAction<File>>] = useState()
  const [file2, setFile2]: [File, Dispatch<SetStateAction<File>>] = useState()

  const submit = async (e) => {
    e.preventDefault()
    if (!file1) return alert.error('')
    const { firebase } = await initFirebase()
    const token = await firebase.auth().currentUser.getIdToken()
    const formData = new FormData()
    formData.append('file1', file1)
    formData.append('file2', file2)
    formData.append('token', token)
    const res = await fetch('/api/identification', {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    })
    if (res.status === 200) {
      router.push({ pathname: '/user/edit', query: { msg: encodeQuery('本人確認書類のアップロードに成功しました。') } }, 'user/edit')
    }
  }

  return (
    <Form onSubmit={submit}>
      <h4>本人確認書類のアップロード</h4>
      <FormGroup style={{ marginTop: "1.5em" }}>
        <p>有効な身分証明書：</p>
        <ul>
          <li>運転免許書</li>
          <li>パスポート</li>
          <li>外国国籍を持つ方の場合は在留カード</li>
          <li>住基カード（顔写真つきのみ）</li>
        </ul>
        <p>ファイル準備の際には、以下の点にご注意ください：</p>
        <ul>
          <li>ファイル形式が JPEG または PNG であること</li>
          <li>身分証全体のカラー画像であること</li>
          <li>ピントが合っていて記載内容が判別できること</li>
          <li>撮影時にフラッシュを使用しない</li>
        </ul>
        <FormGroup style={{ marginTop: "1.5em" }}>
          <Label>表面</Label>
          <Input type="file" name="file1" accept="image/jpeg, image/png" style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }} onChange={e => setFile1(e.target.files[0])} />
        </FormGroup>
        <FormGroup>
          <Label>裏面</Label>
          <Input type="file" name="file2" accept="image/jpeg, image/png" style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }} onChange={e => setFile2(e.target.files[0])} />
        </FormGroup>
        <Row form style={{ margin: 0, marginTop: "2em" }}>
          <Button className="ml-auto">提出する</Button>
        </Row>
      </FormGroup>
    </Form>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx, 'redirect')
  const { firestore } = await initFirebaseAdmin()
  const { stripeId } = (await firestore.collection('users').doc(user.uid).get()).data()
  const result = await stripe.accounts.retrieve(
    stripeId
  )
  const { individual } = result
  const { verification } = individual
  return { props: { user, verification } }
}

export default Identification