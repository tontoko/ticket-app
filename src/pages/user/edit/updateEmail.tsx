import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import 'firebase/storage'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import { encodeQuery } from '@/src/lib/parseQuery'

export const UpdateEmail: React.FC<any> = (props) => {
    const router = useRouter()
    const alert = useAlert()
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')

    const updateEmail = async(e) => {
        e.preventDefault()
        const {firebase} = await initFirebase()
        const { currentUser } = firebase.auth()
        if (email || pwd) {
            try {
                const currentEmail = firebase.auth().currentUser.email
                const credential = firebase.auth.EmailAuthProvider.credential(currentEmail, pwd)
                await currentUser.reauthenticateAndRetrieveDataWithCredential(credential)
            } catch(e) {
                return alert.error(errorMsg(e))
            }
        }
        try {
            await currentUser.updateEmail(email)
            router.push({pathname: `/user/edit`, query: {msg: encodeQuery('メールアドレスを変更しました') }}, '/user/edit')
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

export const getServerSideProps: GetServerSideProps = async ctx => {
    const {user} = await isLogin(ctx, 'redirect')
    return {props: {user}}
}

export default UpdateEmail