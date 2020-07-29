import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Row } from 'reactstrap'
import { firebase } from '@/src/lib/initFirebase'
import 'firebase/storage'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { encodeQuery } from '@/src/lib/parseQuery'
import withAuth from '@/src/lib/withAuth'

export const UpdatePassword: React.FC<any> = (user) => {
    const router = useRouter()
    const alert = useAlert()
    const [pwd, setPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [newPwdConfirm, setNewPwdConfirm] = useState('')

    const updatePassword = async (e) => {
        e.preventDefault()
        if (pwd && newPwd && newPwdConfirm && newPwd === newPwdConfirm) {
            try {
                const currentEmail = user.email
                const credential = firebase.auth.EmailAuthProvider.credential(currentEmail, pwd)
                await user.reauthenticateAndRetrieveDataWithCredential(credential)
            } catch (e) {
                return alert.error(errorMsg(e))
            }
        }
        try {
            await user.updatePassword(newPwd)
            router.push({ pathname: `/users/${user.uid}/edit`, query: { msg: encodeQuery('パスワードを変更しました') } })
        } catch (e) {
            alert.error(errorMsg(e))
        }
    }

    return (
        <Form style={{ marginTop: "1.5em" }} onSubmit={updatePassword}>
            <h3>登録情報</h3>
            <FormGroup>
                <Label for="password">現在のパスワード</Label>
                <Input type="password" onChange={e => setPwd(e.target.value)} />
            </FormGroup>
            <FormGroup>
                <Label for="password">新しいパスワード</Label>
                <Input type="password" onChange={e => setNewPwd(e.target.value)} />
            </FormGroup>
            <FormGroup>
                <Label for="password_confirm">パスワード確認</Label>
                <Input type="password" onChange={e => setNewPwdConfirm(e.target.value)} />
            </FormGroup>
            <Row style={{ margin: 0 }}>
                <Button className="ml-auto">変更</Button>
            </Row>
        </Form>
    )
}

export default withAuth(UpdatePassword)