import Link from 'next/link'
import {useRouter} from 'next/router'
import React, {useEffect, useState} from 'react'
import {
    Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, FormFeedback, Spinner } from 'reactstrap'
import { useAlert } from 'react-alert'
import { loadStripe } from '@stripe/stripe-js';
import {
    CardElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { GetServerSideProps } from 'next'
import isLogin from '@/lib/isLogin'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import { event } from 'events'
import getImg from '@/lib/getImgSSR'
import { Stripe } from 'stripe'

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter()
    const alert = useAlert()
    const [agree, setAgree] = useState(false)
    const [processing, setProcessing] = useState(false)

    const {familyName, firstName, email} = router.query

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!stripe || !elements) return
        if (agree) return alert.error("同意します が選択されていません")

        setProcessing(true)
        const result = await stripe.confirmCardPayment('{CLIENT_SECRET}', {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: 'Jenny Rosen',
                    email: 'test'
                },
            }
        })

        if (result.error) {
            alert.error(result.error.message)
        } else {
            // The payment has been processed!
            if (result.paymentIntent.status === 'succeeded') {
                // Show a success message to your customer
                // There's a risk of the customer closing the window before callback
                // execution. Set up a webhook or plugin to listen for the
                // payment_intent.succeeded event that handles any business critical
                // post-payment actions.
            }
        }
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
                            <Input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} invalid={!agree} /> 同意します
                        <FormFeedback>必須項目です</FormFeedback>
                        </Label>
                    </FormGroup>
                </Row>
                <Row className="flex-row-reverse">
                    <Spinner></Spinner>
                    <Button disabled={!stripe || !elements || processing} style={{ marginRight: '1em', marginTop: '0.5em' }} onClick={handleSubmit} >購入</Button>
                </Row>
            </Form>
        </Container>
    );
};

const Confirmation: React.FC = () => {
    const stripePromise = loadStripe('publishable key')

    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx)
    const { firestore } = await initFirebaseAdmin()
    const { query } = ctx
    const { familyName, firstName, email, selectedCategory, id } = query
    const data = (await firestore.collection('events').doc(query.id as string).get()).data() as event
    const photos: undefined | string[] = data.photos
    const photoUrls = photos ? await Promise.all(photos.map(async photo => getImg(photo, data.createdUser))) : undefined
    const createdAt = data.createdAt.seconds
    const updatedAt = data.updatedAt.seconds
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const event = { ...data, createdAt, updatedAt, startDate, endDate }
    const category = (await firestore.collection('events').doc(query.id as string).collection('categories').doc(selectedCategory as string).get()).data()

    const stripe = require('stripe')('api_key_test') as Stripe
    const paymentIntent = await stripe.paymentIntents.create({
        amount: category.price,
        currency: 'jpy',
        payment_method_types: ['card'],
        // Verify your integration in this guide by including this parameter
        metadata: { integration_check: 'accept_a_payment' },
    });
    const a = paymentIntent
    return { props: { event, category, photoUrls } }
}

export default Confirmation