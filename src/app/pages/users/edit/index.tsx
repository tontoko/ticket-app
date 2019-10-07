import Link from 'next/link'
import React from 'react'
import {useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, FormText, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook } from '@fortawesome/free-brands-svg-icons'

export const UserShow: React.FC = () => {

    return (
        <Container>
            <Form style={{marginTop: "1.5em"}}>
                <h3>登録情報</h3>
                <FormGroup style={{marginTop: "1em"}}>
                    <Label for="email">メールアドレス</Label>
                    <Input type="email" name="email" id="email" />
                </FormGroup>
                <FormGroup>
                    <Label for="password">パスワード</Label>
                    <Input type="password" name="password" id="password" />
                </FormGroup>
                <FormGroup>
                    <Label for="password_confirm">パスワード確認</Label>
                    <Input type="password" name="password_confirm" id="password_confirm" />
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
                <FormGroup>
                    <Label for="image">プロフィール画像を選択</Label>
                    <Input type="file" name="image" id="image" style={{border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em"}} />
                </FormGroup>
                <Row style={{ margin: 0, marginTop: "0.5em" }}>
                    <Link href="/users/1/edit/confirm">
                        <Button className="ml-auto">確認</Button>
                    </Link>
                </Row>
                <Row style={{ margin: 0, marginTop: "1.5em" }}>
                    <Link href="/users/edit/leave">
                        <Button className="ml-auto">退会</Button>
                    </Link>
                </Row>
            </Form>
        </Container>
    )
}

export default UserShow