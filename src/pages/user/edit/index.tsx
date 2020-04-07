import Link from 'next/link'
import React from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'

const UserShow = ({user}) => {
    return (
        <Form style={{marginTop: "1.5em"}}>
            <h4>登録情報の変更</h4>
            {user.firebase.sign_in_provider === 'password' && (
            <>
            <FormGroup style={{ marginTop: '2em' }}>
                <Link href={`/user/edit/updateEmail`}><a>メールアドレスを変更する</a></Link>
            </FormGroup>
            <FormGroup>
                <Link href={`/user/edit/updatePassword`}><a>パスワードを変更する</a></Link>
            </FormGroup>
            </>
            )}

            <FormGroup>
                <Link href={`/user/edit/updateUser`}><a>ユーザー情報を追加/修正する</a></Link>
            </FormGroup>
            <FormGroup>
                <Link href={`/user/edit/updateBankData`}><a>銀行口座を追加/修正する(販売者向け)</a></Link>
            </FormGroup>

            {user.firebase.sign_in_provider !== 'password' &&
            <FormGroup style={{marginTop: '2em'}}>
                <Label>連携済みサービス</Label>
                <Row style={{ margin: 0 }}>
                    <Col style={{ display: 'flex', padding: 0 }}>
                        {user.firebase.sign_in_provider === 'twitter.com' &&
                        <p><FontAwesomeIcon icon={faTwitter} size="lg" style={{ color: "#1da1f2" }} className="fa-2x" /></p>}
                        {user.firebase.sign_in_provider === 'facebook.com' &&
                        <p><FontAwesomeIcon icon={faFacebook} size="lg" style={{ color: "#4267b2" }} className="fa-2x" /></p>}
                        {user.firebase.sign_in_provider === 'google.com' &&
                        <p><FontAwesomeIcon icon={faGoogle} size="lg" style={{ color: "#DB4437" }} className="fa-2x" /></p>}
                    </Col>
                </Row>
            </FormGroup>
            }
            <Row style={{ margin: 0, marginTop: "5em" }}>
                <Link href={`/user/edit/leave`}>
                    <Button className="ml-auto">退会</Button>
                </Link>
            </Row>
        </Form>
    )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const {user} = await isLogin(ctx)
    return {props: {user}}
}

export default UserShow