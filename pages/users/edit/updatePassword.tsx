import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'
import initFirebase from '../../../initFirebase'
import 'firebase/storage'
import { useAlert } from "react-alert"
import errorMsg from '../../../lib/errorMsg'

export const UpdatePassword: React.FC<any> = (props) => {
    const router = useRouter()
    const alert = useAlert()
    const [pwd, setPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [newPwdConfirm, setNewPwdConfirm] = useState('')

    const updatePassword = async () => {
        const firebase = await initFirebase()
        const { currentUser } = firebase.auth()
        if (pwd && newPwd && newPwdConfirm && newPwd === newPwdConfirm) {
            try {
                const currentEmail = firebase.auth().currentUser.email
                const credential = firebase.auth.EmailAuthProvider.credential(currentEmail, pwd)
                await currentUser.reauthenticateAndRetrieveDataWithCredential(credential)
            } catch (e) {
                alert.error(errorMsg(e))
            }
        }
        try {
            await currentUser.updatePassword(newPwd)
            router.push({pathname: `/users/edit`, query: {msg: 'updatePassword'}})
        } catch (e) {
            alert.error(errorMsg(e))
        }
    }

    return (
        <Container>
            <Form style={{ marginTop: "1.5em" }}>
                <h3>登録情報</h3>
                <FormGroup>
                    <Label for="password">現在のパスワード</Label>
                    <Input type="password" name="password" id="password" onChange={e => setPwd(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label for="password">新しいパスワード</Label>
                    <Input type="password" name="password" id="password" onChange={e => setNewPwd(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label for="password_confirm">パスワード確認</Label>
                    <Input type="password" name="password_confirm" id="password_confirm" onChange={e => setNewPwdConfirm(e.target.value)} />
                </FormGroup>
                <Button className="ml-auto" onClick={() => updatePassword()}>変更</Button>
            </Form>
        </Container>
    )
}

export default UpdatePassword