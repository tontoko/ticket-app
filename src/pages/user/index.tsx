import Link from 'next/link'
import React from 'react'
import {useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, FormText, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import initFirebase from '@/src/lib/initFirebase'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import { useRouter } from 'next/router'

export const UserShow: React.FC<any> = (props) => {
    const router = useRouter()
    return (
        <Container>
            <Form style={{marginTop: "1.5em"}}>
                <h3>登録情報</h3>
                <FormGroup style={{marginTop: "1em"}}>
                    <Label for="email">メールアドレス</Label>
                    <Input disabled type="email" name="email" id="email" value={props.user.email} />
                </FormGroup>
                {props. user.sign_in_provider !== 'password' && 
                <FormGroup>
                    <Label>連携済みサービス</Label>
                    <Row style={{ margin: 0, marginTop: "0.5em" }}>
                        <Col style={{display: 'flex', padding: 0}}>
                            {props.user.sign_in_provider === 'twitter.com' && 
                                <p><FontAwesomeIcon icon={faTwitter} size="lg" style={{ color: "#1da1f2" }} className="fa-2x" /></p>}
                            {props.user.sign_in_provider === 'facebook.com' && 
                                <p><FontAwesomeIcon icon={faFacebook} size="lg" style={{ color: "#4267b2" }} className="fa-2x" /></p>}
                            {props.user.sign_in_provider === 'google.com' && 
                                <p><FontAwesomeIcon icon={faGoogle} size="lg" style={{ color: "#DB4437" }} className="fa-2x" /></p>}
                        </Col>
                    </Row>
                </FormGroup>}
                <Row style={{ margin: 0, marginTop: "0.5em" }}>
                    <Link href={`/user/edit`}>
                        <Button className="ml-auto">編集</Button>
                    </Link>
                </Row>
                <Row style={{ margin: 0, marginTop: "1em" }}>
                    <Button className="ml-auto" onClick={async() => {
                        const {firebase} = await initFirebase()
                        await firebase.auth().signOut()
                    }}>
                        ログアウト
                    </Button>
                </Row>
            </Form>
        </Container>
    )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx)
    return { props: { user } }
}

export default UserShow