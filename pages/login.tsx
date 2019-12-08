import Link from 'next/link'
import Router from 'next/router'
import React, {useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'
import initFirebase from '../initFirebase'

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
            <a href="/register">ユーザー登録</a>
        </Container>
    );
}

export default Login