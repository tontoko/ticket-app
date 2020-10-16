import Link from 'next/link'
import React, { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Row, Col } from 'reactstrap'
import { fuego } from '@nandorojo/swr-firestore'
import { useAlert } from 'react-alert'
import errorMsg from '@/src/lib/errorMsg'
import { useRouter } from 'next/router'
import { encodeQuery } from '@/src/lib/parseQuery'
import analytics from '../lib/analytics'

const ForgetPassword = () => {
  const alert = useAlert()
  const [email, setEmail] = useState('')
  const router = useRouter()

  const sendEmail = async (e) => {
    e.preventDefault()
    try {
      await fuego.auth().sendPasswordResetEmail(email)
      router.push({
        pathname: '/login',
        query: {
          msg: encodeQuery(
            '確認メールを送信しました。メールのリンクからパスワードを再設定してください。',
          ),
        },
      })
    } catch (e) {
      ;(await analytics()).logEvent('exception', { description: e.message })
      if (e.code == 'auth/user-not-found') {
        return alert.error('メールアドレスが正しくありません。')
      }
      alert.error(errorMsg(e))
    }
  }
  return (
    <Row>
      <Col sm="12" md={{ size: 6, offset: 3 }}>
        <Form style={{ margin: '5em 0' }} onSubmit={sendEmail}>
          <h4 style={{ marginBottom: '1.5em' }}>パスワード再設定</h4>
          <FormGroup style={{ marginBottom: '1.5em' }}>
            <Label>登録メールアドレス</Label>
            <Input
              type="email"
              name="email"
              placeholder="メールアドレス"
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormGroup>
          <Row form>
            <Button className="ml-auto">送信</Button>
          </Row>
          <FormGroup style={{ marginTop: '1.5em', textAlign: 'right' }}>
            <Link href="/login">
              <a>ログイン画面へ</a>
            </Link>
          </FormGroup>
        </Form>
      </Col>
    </Row>
  )
}

export default ForgetPassword
