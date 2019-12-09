import Link from 'next/link'
import Router from 'next/router'
import React, {useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Col } from 'reactstrap'
import initFirebase from '../initFirebase'
import { faTwitter, faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const Login = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const loginWithEmail = async () => {
        try {
            const firebase = await initFirebase()
            firebase.auth().signInWithEmailAndPassword(email, password)
        } catch (e) {
            console.log(e)
        }
    }

    const loginWithFacebook = async() => {
        try {
            const firebase = await initFirebase()
            const provider = new firebase.auth.FacebookAuthProvider()
            const result = await firebase.auth().signInWithPopup(provider)
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // const token = result.credential.accessToken
            // The signed-in user info.
            // const user = result.user
            // ...
        } catch (error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            const credential = error.credential;
            // ...
        }
    }

    const loginWithTwitter = async () => {
        try {
            const firebase = await initFirebase()
            const provider = new firebase.auth.TwitterAuthProvider()
            const result = await firebase.auth().signInWithPopup(provider)
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // const token = result.credential.accessToken
            // The signed-in user info.
            // const user = result.user
            // ...
        } catch (error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            const credential = error.credential;
            // ...
        }
    }

    const loginWithGoogle = async () => {
        try {
            const firebase = await initFirebase()
            const provider = new firebase.auth.GoogleAuthProvider()
            const result = await firebase.auth().signInWithPopup(provider)
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // const token = result.credential.accessToken
            // The signed-in user info.
            // const user = result.user
            // ...
        } catch (error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            const credential = error.credential;
            // ...
        }
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
            </Form>
            <Row style={{ marginTop: '1em' }}>
                <Col style={{ display: 'flex', padding: 0 }}>
                    <p onClick={() => loginWithTwitter()}><FontAwesomeIcon icon={faTwitter} size="lg" style={{ color: "#1da1f2", marginLeft: "0.5em", cursor: 'pointer' }} className='fa-2x' /></p>
                    <p onClick={() => loginWithFacebook()}><FontAwesomeIcon icon={faFacebook} size="lg" style={{ color: "#4267b2", marginLeft: "0.5em", cursor: 'pointer' }} className='fa-2x' /></p>
                    <p onClick={() => loginWithGoogle()}><FontAwesomeIcon icon={faGoogle} size="lg" style={{ color: "#DB4437", marginLeft: "0.5em", cursor: 'pointer' }} className='fa-2x' /></p>
                </Col>
            </Row>
            <Link href="/register"><a>ユーザー登録</a></Link>
        </Container>
    );
}

export default Login