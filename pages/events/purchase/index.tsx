import Link from 'next/link'
import {useRouter} from 'next/router'
import React, {useEffect, useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
    Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, } from 'reactstrap'

export const Purchase: React.FC = () => {

    useEffect(() => {
        // ログインしてなければリダイレクト
        if (false) {
            router.push('/login')
        }
    })

    const changeFamilyName = (e) => {
        setFamilyName(e.target.value)
    }

    const changeFirstName = (e) => {
        setFirstName(e.target.value)
    }

    const changeEmail = (e) => {
        setEmail(e.target.value)
    }

    const router = useRouter();
    const UrlToConfirmation = `/events/${router.query.id}/purchase/confirmation`

    const [familyName, setFamilyName] = useState('')
    const [firstName, setFirstName] = useState('')
    const [email, setEmail] = useState('')

    return (
        <Container>
            <Form style={{ marginTop: '5em' }}>
                <FormGroup>
                    <Label>お名前</Label>
                    <Row>
                        <Col xs="3">
                            <Input type="text" name="familyName" placeholder="性" onChange={changeFamilyName} value={familyName} />
                        </Col>
                        <Col xs="3">
                            <Input type="text" name="firstName" placeholder="名" onChange={changeFirstName} value={firstName} />
                        </Col>
                    </Row>
                </FormGroup>
                <FormGroup>
                    <Label>メールアドレス</Label>
                    <Input type="email" name="email" placeholder="メールアドレス" onChange={changeEmail} value={email} />
                </FormGroup>
                <FormGroup>
                    <Label>イベント情報</Label>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col xs="2">
                                    <img width="100%" src="https://cdn.pixabay.com/photo/2019/06/21/20/19/grapes-4290308_1280.jpg" alt="Card image cap" />
                                </Col>
                                <Col xs="auto">
                                    <CardTitle>テストイベント</CardTitle>
                                    <CardSubtitle>テスト場所</CardSubtitle>
                                    <CardText>テスト説明文</CardText>
                                </Col>
                            </Row>
                            <Row className="flex-row-reverse">
                                <h4 style={{ marginTop: '1em', marginRight: '1em' }}>テスト金額</h4>
                            </Row>
                        </CardBody>
                    </Card>
                </FormGroup>
                <Row className="flex-row-reverse">
                    <Link href={{ pathname: UrlToConfirmation, query: { familyName, firstName, email } }}><Button style={{ marginRight: '1em' }}>確認</Button></Link>
                </Row>
            </Form>
        </Container>
    );
}

export default Purchase