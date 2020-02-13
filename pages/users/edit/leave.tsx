import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, FormText, Row, Col } from 'reactstrap'
import errorMsg from '../../../lib/errorMsg'
import { useAlert } from "react-alert"
import initFirebase from '../../../initFirebase'

export const Leave = (props) => {
    const alert = useAlert()
    const [checkBox, setCheckBox] = useState(false)
    const [pwd, setPwd] = useState('')

    const leave = async () => {
        if (!checkBox) return alert.error('チェックボックスが選択されていません。')
        const firebase = await initFirebase()
        const auth = firebase.auth()
        const { sign_in_provider } = props.user.firebase
        let credencial:any
        try {
            if (props.sign_in_provider === 'password') {
                credencial = await auth.signInWithEmailAndPassword(auth.currentUser.email, pwd)
            } else { 
                credencial = await auth.currentUser.reauthenticateWithPopup(sign_in_provider)
            }
            await auth.currentUser.reauthenticateWithCredential(credencial)
            await auth.currentUser.delete()
            alert.success('退会処理が完了しました。')
        } catch (e) {
            alert.error(errorMsg(e))
        }
    }

    return (
        <Container>
            <Form style={{ marginTop: "6.5em" }}>
                <h5>本当に退会しますか？</h5>
                <p>削除されたデータは復元することができません。</p>
                <FormGroup check>
                    <Label check>
                        <Input type="checkbox" id="checkbox2" onChange={e => setCheckBox(e.target.checked)} checked={checkBox} />{' '}
                        上記の説明を理解しました
                    </Label>
                </FormGroup>
                {props.sign_in_provider === 'password' && (
                    <>
                    <Input type="password" placeholder="パスワード" value={pwd} onChange={e => setPwd(e.target.value)} />
                    </>
                )}
                <Row style={{ margin: 0, marginTop: "10em" }}>
                    <Button className="ml-auto" onClick={() => leave()}>退会する</Button>
                </Row>
            </Form>
        </Container>
    )
}

export default Leave