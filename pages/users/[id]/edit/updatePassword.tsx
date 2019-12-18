import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import initFirebase from '../../../../initFirebase'
import 'firebase/storage'
import Avater from 'react-avatar'

export const UpdatePassword: React.FC<any> = (props) => {
    const [image, setImage] = useState('')
    const [imageFile, setImageFile] = useState()
    const [email, setEmail] = useState('')
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
                console.log(e)
            }
        }
        try {
            currentUser.updatePassword(newPwd)

        } catch (e) {
            console.log(e)
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