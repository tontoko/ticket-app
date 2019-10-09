import Link from 'next/link'
import React from 'react'
import {useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, FormText, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook } from '@fortawesome/free-brands-svg-icons'
import initFirebase from '../../../initFirebase'

export const UserShow: React.FC = () => {

    return (
        <Container>
            <Form style={{marginTop: "1.5em"}}>
                <h3>登録情報</h3>
                <FormGroup style={{marginTop: "1em"}}>
                    <Label for="email">メールアドレス</Label>
                    <Input disabled type="email" name="email" id="email" />
                </FormGroup>
                <FormGroup>
                    <Label>連携済みサービス</Label>
                    <Row style={{ margin: 0, marginTop: "0.5em" }}>
                        <Col>
                            <FontAwesomeIcon icon={faTwitter} size="lg" style={{ color: "#1da1f2", marginLeft: "1em" }} />
                            <FontAwesomeIcon icon={faFacebook} size="lg" style={{ color: "#4267b2", marginLeft: "1em" }} />
                        </Col>
                    </Row>
                </FormGroup>
                <Row style={{ margin: 0, marginTop: "0.5em" }}>
                    <Link href="/users/1/edit">
                        <Button className="ml-auto">編集</Button>
                    </Link>
                </Row>
                <Row style={{ margin: 0, marginTop: "1em" }}>
                    <Link href="/login">
                        <Button className="ml-auto" onClick={async() => {
                            const firebase = await initFirebase()
                            firebase.auth().signOut()
                        }}>
                            ログアウト</Button>
                    </Link>
                </Row>
            </Form>
        </Container>
    )
}

export default UserShow