import Link from 'next/link'
import React, {useState} from 'react'
import { Form, FormGroup, Button, Label, Input, Col, Spinner, Row } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import isLogin from '../lib/isLogin'
import { GetServerSideProps } from 'next'

const Login = () => {
    const alert = useAlert()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    
    const loginWithEmail = async (e) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        try {
            const {firebase} = await initFirebase()
            await firebase.auth().signInWithEmailAndPassword(email, password)
        } catch (e) {
            alert.error(errorMsg(e, 'signin'))
            setLoading(false)
        }
    }

    const loginWithFacebook = async() => {
        if (loading) return
        setLoading(true)
        try {
            const {firebase} = await initFirebase()
            const provider = new firebase.auth.FacebookAuthProvider()
            await firebase.auth().signInWithPopup(provider)
        } catch (e) {
            alert.error(errorMsg(e, 'signin/popup'))
            setLoading(false)
        }
    }


    const loginWithGoogle = async () => {
        if (loading) return
        setLoading(true)
        try {
            const {firebase} = await initFirebase()
            const provider = new firebase.auth.GoogleAuthProvider()
            await firebase.auth().signInWithPopup(provider)
        } catch (e) {
            alert.error(errorMsg(e, 'signin/popup'))
            setLoading(false)
        }
    }

    return (
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Form style={{ marginTop: "5em" }} onSubmit={loginWithEmail}>
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>
            <Row form>
              <Button disabled={loading} className="ml-auto">
                {loading ? <Spinner /> : "ログイン"}
              </Button>
            </Row>
          </Form>
          <Form>
            <FormGroup style={{ marginTop: "1em" }}>
              <Row form>
                <Col style={{ display: "flex", padding: 0 }}>
                  <p className="ml-auto" onClick={() => loginWithFacebook()}>
                    <FontAwesomeIcon
                      icon={faFacebook}
                      size="lg"
                      style={{
                        color: "#4267b2",
                        marginLeft: "0.5em",
                        cursor: "pointer",
                      }}
                      className="fa-2x"
                    />
                  </p>
                  <p onClick={() => loginWithGoogle()}>
                    <FontAwesomeIcon
                      icon={faGoogle}
                      size="lg"
                      style={{
                        color: "#DB4437",
                        marginLeft: "0.5em",
                        cursor: "pointer",
                      }}
                      className="fa-2x"
                    />
                  </p>
                </Col>
              </Row>
            </FormGroup>
            <FormGroup style={{ textAlign: "right" }}>
              <Link href="/register">
                <a>ユーザー登録</a>
              </Link>
            </FormGroup>
            <FormGroup style={{ textAlign: "right" }}>
              <Link href="/forgetPassword">
                <a>パスワード再設定</a>
              </Link>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    );
}

export default Login

export const getServerSideProps: GetServerSideProps = async ctx => {
    await isLogin(ctx, 'redirect');
    return { props: { } }
}