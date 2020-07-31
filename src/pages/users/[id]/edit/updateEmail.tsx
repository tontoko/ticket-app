import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row } from 'reactstrap'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { encodeQuery } from '@/src/lib/parseQuery'
import { firebase } from '@/src/lib/initFirebase'
import withAuth from '@/src/lib/withAuth'

export const UpdateEmail: React.FC<any> = (user) => {
    const router = useRouter()
    const alert = useAlert()
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')

    const updateEmail = async(e) => {
        e.preventDefault()
        if (email || pwd) {
            try {
                const currentEmail = user.email
                const credential = firebase.auth.EmailAuthProvider.credential(currentEmail, pwd)
                await user.reauthenticateAndRetrieveDataWithCredential(credential)
            } catch(e) {
                return alert.error(errorMsg(e))
            }
        }
        try {
            await user.updateEmail(email)
            router.push({pathname: `/users/${user.uid}/edit`, query: {msg: encodeQuery('メールアドレスを変更しました') }})
        } catch (e) {
            alert.error(errorMsg(e))
        }
    }

    return (
        <Form style={{ marginTop: "1.5em" }} onSubmit={updateEmail}>
            <h3>登録情報</h3>
            <FormGroup style={{marginTop: "1em"}}>
                <Label for="email">新しいメールアドレス</Label>
                <Input type="email" name="email" id="email" onChange={e => setEmail(e.target.value)} />
            </FormGroup>
            <FormGroup>
                <Label for="password">現在のパスワード</Label>
                <Input type="password" name="password" id="password" onChange={e => setPwd(e.target.value)} />
            </FormGroup>
            <Row style={{ margin: 0 }}>
                <Button className="ml-auto">変更</Button>
            </Row>
        </Form>
    )
}

export default withAuth(UpdateEmail)