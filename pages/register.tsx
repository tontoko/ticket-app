import Link from 'next/link'
import React, { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'
import initFirebase from '@/initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '@/lib/errorMsg'

export default () => {
    const alert = useAlert()
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')
    const [pwdConfirm, setPwdConfirm] = useState('')

    const sendEmail = async () => {
        if (pwd !== pwdConfirm) return alert.error('確認用パスワードが一致していません。')
        const {firebase} = await initFirebase()
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, pwd)
        } catch(e) {
            alert.error(errorMsg(e, 'signup'))
        }
    }

    return (
        <Container>
            <Form style={{ marginTop: '5em' }}>
                <FormGroup>
                    <Label>メールアドレス</Label>
                    <Input type="email" name="email" placeholder="メールアドレス" onChange={e =>setEmail(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>パスワード</Label>
                    <Input type="password" name="password" placeholder="パスワード" onChange={e => setPwd(e.target.value)} />
                    <Input type="password" name="password_confirmation" placeholder="パスワード再入力" style={{ marginTop: '0.7em' }} onChange={e => setPwdConfirm(e.target.value)} />
                </FormGroup>
                <Button onClick={() => sendEmail()}>登録</Button>
            </Form>
            <Link href="/login"><a>ログイン</a></Link>
        </Container>
    )
}