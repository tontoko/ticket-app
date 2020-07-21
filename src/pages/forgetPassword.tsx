import Link from 'next/link'
import React, { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'

export default () => {
  const alert = useAlert()
  const [email, setEmail] = useState('')

  const sendEmail = async () => {
    const {firebase} = await initFirebase()
    try {
      await firebase.auth().sendPasswordResetEmail(email)
      alert.success('確認メールを送信しました。メールのリンクからパスワードを再設定してください。')
    } catch (e) {
      if (e.code == 'auth/user-not-found') {
        return alert.error('メールアドレスが正しくありません。')
      }
      alert.error(errorMsg(e))
    }
  }
  return (
    <Form style={{ marginTop: "5em" }}>
      <h4>パスワード再設定</h4>
      <FormGroup style={{ marginTop: "2em" }}>
        <Label>登録メールアドレス</Label>
        <Input
          type="email"
          name="email"
          placeholder="メールアドレス"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormGroup>
      <Row form>
        <Button onClick={() => sendEmail()} className="ml-auto">
          確認
        </Button>
      </Row>
      <FormGroup style={{ marginTop: "1.5em", textAlign: "right" }}>
        <Link href="/login">
          <a>ログイン画面へ</a>
        </Link>
      </FormGroup>
    </Form>
  );
}