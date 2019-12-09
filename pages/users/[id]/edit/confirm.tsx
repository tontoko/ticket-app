import Link from 'next/link'
import React from 'react'
import {useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, FormText, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook } from '@fortawesome/free-brands-svg-icons'

export const Confirm: React.FC<any> = (props) => {

    return (
        <Container>
            <Form style={{marginTop: "1.5em"}}>
                <h3>登録情報</h3>
                <FormGroup style={{marginTop: "1em"}}>
                    <Label for="email">メールアドレス</Label>
                    <p>テスト</p>
                </FormGroup>
                <FormGroup>
                    <Label for="password">パスワード</Label>
                    <Input disabled type="password" name="password" id="password" />
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
                    <Row>
                        <Col sm="4">
                            <img height="150em" src="https://cdn.pixabay.com/photo/2019/06/21/20/19/grapes-4290308_1280.jpg" />
                        </Col>
                    </Row>
                </FormGroup>
                <Row style={{ margin: 0, marginTop: "0.5em" }}>
                    <Link href={`/users/${props.user.uid}/show`}>
                        <Button className="ml-auto">確認</Button>
                    </Link>
                </Row>
            </Form>
        </Container>
    )
}

export default Confirm