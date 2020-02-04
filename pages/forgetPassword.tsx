import Link from 'next/link'
import React, { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'
import initFirebase from '../initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '../lib/errorMsg'

export default () => {
  const alert = useAlert()
  const [email, setEmail] = useState('')

  const sendEmail = async () => {
    const firebase = await initFirebase()
    try {
      await firebase.auth().sendPasswordResetEmail(email)
      alert.success('確認メールを送信しました。メールのリンクからパスワードを再設定してください。')
    } catch (e) {
      alert.error(errorMsg(e))
    }
  }
  return (
    <Container>
      <Form style={{ marginTop: '5em' }}>
        <FormGroup>
          <Label>登録メールアドレス</Label>
          <Input type="email" name="email" placeholder="メールアドレス" onChange={e => setEmail(e.target.value)} />
        </FormGroup>
        <Button onClick={() => sendEmail()}>登録</Button>
      </Form>
      <Link href="/login"><a>ログイン</a></Link>
    </Container>
  )
}