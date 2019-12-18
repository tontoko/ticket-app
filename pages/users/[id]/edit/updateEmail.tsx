import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import initFirebase from '../../../../initFirebase'
import 'firebase/storage'
import { useAlert } from "react-alert"

export const UpdateEmail: React.FC<any> = (props) => {
    const router = useRouter()
    const alert = useAlert()
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')

    const updateEmail = async() => {
        const firebase = await initFirebase()
        const { currentUser } = firebase.auth()
        if (email || pwd) {
            try {
                const currentEmail = firebase.auth().currentUser.email
                const credential = firebase.auth.EmailAuthProvider.credential(currentEmail, pwd)
                await currentUser.reauthenticateAndRetrieveDataWithCredential(credential)
            } catch(e) {
                alert.error(e.message)
            }
        }
        try {
            await currentUser.updateEmail(email)
            router.push({pathname: `/users/${props.user.uid}/edit`, query: {msg: updateEmail}})
        } catch (e) {
            alert.error(e.message)
        }
    }

    return (
        <Container>
            <Form style={{ marginTop: "1.5em" }}>
                <h3>登録情報</h3>
                <FormGroup style={{marginTop: "1em"}}>
                    <Label for="email">メールアドレス</Label>
                    <Input type="email" name="email" id="email" onChange={e => setEmail(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label for="password">現在のパスワード</Label>
                    <Input type="password" name="password" id="password" onChange={e => setPwd(e.target.value)} />
                </FormGroup>
                <Button className="ml-auto" onClick={() => updateEmail()}>変更</Button>
            </Form>
        </Container>
    )
}

export default UpdateEmail