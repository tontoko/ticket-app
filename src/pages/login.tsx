import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import React, {useState} from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Col } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { faTwitter, faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'

export const Login = () => {
    const alert = useAlert()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const loginWithEmail = async () => {
        try {
            const {firebase} = await initFirebase()
            await firebase.auth().signInWithEmailAndPassword(email, password)
        } catch (e) {
            alert.error(errorMsg(e, 'signin'))
        }
    }

    const loginWithFacebook = async() => {
        try {
            const {firebase} = await initFirebase()
            const provider = new firebase.auth.FacebookAuthProvider()
            await firebase.auth().signInWithPopup(provider)
        } catch (e) {
            alert.error(errorMsg(e, 'signin/popup'))
        }
    }

    const loginWithTwitter = async () => {
        try {
            const {firebase} = await initFirebase()
            const provider = new firebase.auth.TwitterAuthProvider()
            await firebase.auth().signInWithPopup(provider)
        } catch (e) {
            alert.error(errorMsg(e, 'signin/popup'))}
    }

    const loginWithGoogle = async () => {
        try {
            const {firebase} = await initFirebase()
            const provider = new firebase.auth.GoogleAuthProvider()
            await firebase.auth().signInWithPopup(provider)
        } catch (e) {
            alert.error(errorMsg(e, 'signin/popup'))}
    }

    return (
        <Container>
            <Form style={{marginTop: '5em'}}>
                <FormGroup>
                    <Label>メールアドレス</Label>
                    <Input type="email" name="email" placeholder="メールアドレス" onChange={e => setEmail(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>パスワード</Label>
                    <Input type="password" name="password" placeholder="パスワード" onChange={e => setPassword(e.target.value)} />
                </FormGroup>
                <Button onClick={() => loginWithEmail()}>ログイン</Button>
                <FormGroup style={{ marginTop: '1em' }}>
                    <Col style={{ display: 'flex', padding: 0 }}>
                        <p onClick={() => loginWithTwitter()}><FontAwesomeIcon icon={faTwitter} size="lg" style={{ color: "#1da1f2", marginLeft: "0.5em", cursor: 'pointer' }} className='fa-2x' /></p>
                        <p onClick={() => loginWithFacebook()}><FontAwesomeIcon icon={faFacebook} size="lg" style={{ color: "#4267b2", marginLeft: "0.5em", cursor: 'pointer' }} className='fa-2x' /></p>
                        <p onClick={() => loginWithGoogle()}><FontAwesomeIcon icon={faGoogle} size="lg" style={{ color: "#DB4437", marginLeft: "0.5em", cursor: 'pointer' }} className='fa-2x' /></p>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Link href="/register"><a>ユーザー登録</a></Link>
                </FormGroup>
                <FormGroup>
                    <Link href="/forgetPassword"><a>パスワード再設定</a></Link>
                </FormGroup>
            </Form>
        </Container>
    );
}

export default Login