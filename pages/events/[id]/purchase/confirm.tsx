import Link from 'next/link'
import {useRouter} from 'next/router'
import React, {useEffect, useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
    Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, FormFeedback } from 'reactstrap'
import { useAlert } from 'react-alert'
import { loadStripe } from '@stripe/stripe-js';
import {
    CardElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter()
    const alert = useAlert()
    const [ifAgree, setIfAgree] = useState(false)
    const [require, setRequire] = useState(false)

    const [familyName, setFamilyName] = useState(router.query.familyName)
    const [firstName, setFirstName] = useState(router.query.firstName)
    const [email, setEmail] = useState(router.query.email)

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (ifAgree) return setRequire(true)

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        })
    }

    return (
        <Container>
            <Form style={{ marginTop: '5em' }} onSubmit={handleSubmit}>
                <FormGroup>
                    <Label>お名前</Label>
                    <FormGroup>
                        <Label style={{ marginRight: '1em' }}>{familyName}</Label>
                        <Label>{firstName}</Label>
                    </FormGroup>
                </FormGroup>
                <FormGroup>
                    <Label>メールアドレス</Label>
                    <FormGroup>
                        <Label>{email}</Label>
                    </FormGroup>
                </FormGroup>
                <FormGroup>
                    <Label>イベント情報</Label>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col sm="2" xs="3">
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
                <FormGroup check style={{ margin: '2em' }}>
                    <Row className="flex-row-reverse">
                        <Col sm="12" md="6" style={{border: "solid 1px gray", padding: "1em"}}>
                            <Label>クレジットカード情報を入力</Label>
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#424770',
                                            '::placeholder': {
                                                color: '#aab7c4',
                                            },
                                        },
                                        invalid: {
                                            color: '#9e2146',
                                        },
                                    },
                                }}
                            />
                        </Col>
                    </Row>
                </FormGroup>
                <Row className="flex-row-reverse">
                    <FormGroup check style={{ marginRight: '1em' }}>
                        <Label>何たらかんたらに同意する必要がある的な文言</Label>
                    </FormGroup>
                </Row>
                <Row className="flex-row-reverse">
                    <FormGroup check style={{ marginRight: '1em' }}>
                        <Label check>
                            <Input type="checkbox" checked={ifAgree} onChange={() => setIfAgree(!ifAgree)} invalid={!ifAgree} /> 同意します
                        <FormFeedback>必須項目です</FormFeedback>
                        </Label>
                    </FormGroup>
                </Row>
                <Row className="flex-row-reverse">
                    <Button disabled={!stripe} style={{ marginRight: '1em', marginTop: '0.5em' }} onClick={handleSubmit} >購入</Button>
                </Row>
            </Form>
        </Container>
    );
};

const Confirmation: React.FC = () => {
    const stripePromise = loadStripe('api_key_test')

    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
}

export default Confirmation