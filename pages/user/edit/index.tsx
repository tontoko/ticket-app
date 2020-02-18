import Link from 'next/link'
import { useState, useEffect } from 'react'
import React from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { useAlert } from "react-alert"
import { useRouter } from 'next/router'

const UserShow = (props) => {
    const router = useRouter()
    const alert = useAlert()

    useEffect(() => {
        const {msg} = router.query
        msg ?? alert.success(msg)
    })

    return (
        <Container>
            <Form style={{marginTop: "1.5em"}}>
                <h4>登録情報の変更</h4>
                {props.params.sign_in_provider === 'password' && (
                <>
                <FormGroup style={{ marginTop: '2em' }}>
                    <Link href={`/user/edit/updateEmail`}><a>メールアドレスを変更する</a></Link>
                </FormGroup>
                <FormGroup>
                    <Link href={`/user/edit/updatePassword`}><a>パスワードを変更する</a></Link>
                </FormGroup>
                </>
                )}

                {props.params.sign_in_provider !== 'password' &&
                    <FormGroup style={{marginTop: '2em'}}>
                        <Label>連携済みサービス</Label>
                        <Row style={{ margin: 0 }}>
                            <Col style={{ display: 'flex', padding: 0 }}>
                                {props.params.sign_in_provider === 'twitter.com' &&
                                    <p><FontAwesomeIcon icon={faTwitter} size="lg" style={{ color: "#1da1f2" }} className="fa-2x" /></p>}
                                {props.params.sign_in_provider === 'facebook.com' &&
                                    <p><FontAwesomeIcon icon={faFacebook} size="lg" style={{ color: "#4267b2" }} className="fa-2x" /></p>}
                                {props.params.sign_in_provider === 'google.com' &&
                                    <p><FontAwesomeIcon icon={faGoogle} size="lg" style={{ color: "#DB4437" }} className="fa-2x" /></p>}
                            </Col>
                        </Row>
                    </FormGroup>}
                <Row style={{ margin: 0, marginTop: "5em" }}>
                    <Link href={`/user/edit/leave`}>
                        <Button className="ml-auto">退会</Button>
                    </Link>
                </Row>
            </Form>
        </Container>
    )
}

export default UserShow