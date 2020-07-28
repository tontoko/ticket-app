import Link from 'next/link'
import React, { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Col } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { useRouter } from 'next/router'
import { encodeQuery } from '../lib/parseQuery'
import { GetServerSideProps } from 'next'
import isLogin from '../lib/isLogin'

const ForgetPassword = () => {
  const alert = useAlert()
  const [email, setEmail] = useState('')
  const router = useRouter()

  const sendEmail = async () => {
    const {firebase} = await initFirebase()
    try {
      await firebase.auth().sendPasswordResetEmail(email)
      router.push({
        pathname: "/login",
        query: {
          msg: encodeQuery(
            "確認メールを送信しました。メールのリンクからパスワードを再設定してください。"
          ),
        },
      });
    } catch (e) {
      if (e.code == 'auth/user-not-found') {
        return alert.error('メールアドレスが正しくありません。')
      }
      alert.error(errorMsg(e))
    }
  }
  return (
    <Row>
      <Col sm="12" md={{ size: 6, offset: 3 }}>
        <Form style={{ margin: "5em 0" }}>
          <h4 style={{ marginBottom: "1.5em" }}>パスワード再設定</h4>
          <FormGroup style={{ marginBottom: "1.5em" }}>
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
      </Col>
    </Row>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  await isLogin(ctx, "redirect");
  return { props: {} };
};

export default ForgetPassword