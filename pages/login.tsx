import Link from 'next/link'
import Router from 'next/router'
import React, {useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Col } from 'reactstrap'
import initFirebase from '@/initFirebase'
import { faTwitter, faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAlert } from "react-alert"
import errorMsg from '@/lib/errorMsg'

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
            const result = await firebase.auth().signInWithPopup(provider)
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // const token = result.credential.accessToken
            // The signed-in user info.
            // const user = result.user
            // ...
        } catch (e) {
            // Handle Errors here.
            const errorCode = e.code;
            const errorMessage = e.message;
            // The email of the user's account used.
            const email = e.email;
            // The firebase.auth.AuthCredential type that was used.
            const credential = e.credential;
            // ...
            alert.error(errorMsg(e, 'signin/popup'))
        }
    }

    const loginWithTwitter = async () => {
        try {
            const {firebase} = await initFirebase()
            const provider = new firebase.auth.TwitterAuthProvider()
            const result = await firebase.auth().signInWithPopup(provider)
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // const token = result.credential.accessToken
            // The signed-in user info.
            // const user = result.user
            // ...
        } catch (e) {
            // Handle Errors here.
            const errorCode = e.code;
            const errorMessage = e.message;
            // The email of the user's account used.
            const email = e.email;
            // The firebase.auth.AuthCredential type that was used.
            const credential = e.credential;
            // ...
            alert.error(errorMsg(e, 'signin/popup'))        }
    }

    const loginWithGoogle = async () => {
        try {
            const {firebase} = await initFirebase()
            const provider = new firebase.auth.GoogleAuthProvider()
            const result = await firebase.auth().signInWithPopup(provider)
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // const token = result.credential.accessToken
            // The signed-in user info.
            // const user = result.user
            // ...
        } catch (e) {
            // Handle Errors here.
            const errorCode = e.code;
            const errorMessage = e.message;
            // The email of the user's account used.
            const email = e.email;
            // The firebase.auth.AuthCredential type that was used.
            const credential = e.credential;
            // ...
            alert.error(errorMsg(e, 'signin/popup'))        }
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