import Link from 'next/link'
import React, { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Spinner, Row, Col } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import isLogin from '../lib/isLogin'

export default () => {
    const alert = useAlert()
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')
    const [pwdConfirm, setPwdConfirm] = useState('')
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const register = async (e) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        if (pwd !== pwdConfirm) return alert.error('確認用パスワードが一致していません。')
        const {firebase} = await initFirebase()
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, pwd)
        } catch(e) {
            alert.error(errorMsg(e, 'signup'))
            setLoading(false)
        }
    }

    return (
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Form style={{ marginTop: "5em" }} onSubmit={register}>
            <FormGroup>
              <Label>メールアドレス</Label>
              <Input
                type="email"
                name="email"
                placeholder="メールアドレス"
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>
            <FormGroup style={{ marginBottom: "1.5em" }}>
              <Label>パスワード</Label>
              <Input
                type="password"
                name="password"
                placeholder="パスワード"
                onChange={(e) => setPwd(e.target.value)}
              />
              <Input
                type="password"
                name="password_confirmation"
                placeholder="パスワード再入力"
                style={{ marginTop: "0.7em" }}
                onChange={(e) => setPwdConfirm(e.target.value)}
              />
            </FormGroup>
            <Row form>
              <Button disabled={loading} className="ml-auto">
                {loading ? <Spinner /> : "登録"}
              </Button>
            </Row>
          </Form>
          <FormGroup style={{ textAlign: "right" }}>
            <p style={{ marginTop: "0.7em" }}>
              既にアカウントをお持ちの方は
              <Link href="/login">
                <a>ログイン</a>
              </Link>
            </p>
          </FormGroup>
        </Col>
      </Row>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  await isLogin(ctx, "redirect");
  return { props: {} };
};