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
import isLogin from '@/src/lib/isLogin'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import { event } from 'events'
import getImg from '@/src/lib/getImgSSR'
import { Stripe } from 'stripe'

const CheckoutForm = ({ familyName, firstName, email, event, category, photoUrls, client_secret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter()
    const alert = useAlert()
    const [agree, setAgree] = useState(false)
    const [processing, setProcessing] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!stripe || !elements) return
        if (!agree) return alert.error("同意します が選択されていません")

        setProcessing(true)
        const result = await stripe.confirmCardPayment(client_secret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: `${familyName} ${firstName}`,
                    email
                },
            }
        })

        if (result.error) {
            alert.error(result.error.message)
            console.log(client_secret)
            setProcessing(false)
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
                                    <img width="100%" src={photoUrls[0]} alt="Card image cap" />
                                </Col>
                                <Col xs="auto">
                                    <CardTitle>{event.name}</CardTitle>
                                    <CardSubtitle>{event.placeName}</CardSubtitle>
                                </Col>
                            </Row>
                            <Row className="flex-row-reverse">
                                <h4 style={{ marginTop: '1em', marginRight: '1em' }}>{category.price} 円</h4>
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
                <Row className="flex-row-reverse" style={{ marginRight: '1em', marginTop: '0.5em' }}>
                    <Button disabled={!stripe || !elements || processing} onClick={handleSubmit} >購入</Button>
                    <Spinner style={{marginRight: '1em', display: processing ? 'inline-block' : 'none'}} />
                </Row>
            </Form>
        </Container>
    );
};

const Confirmation = ({ familyName, firstName, email, event, category, photoUrls, client_secret, env }) => {
    const publishableKey = env === 'prod' ? 'test' : 'pk_test_DzqNDAGEkW8eadwK9qc1NlrW003yS2dW8N'
    const stripePromise = loadStripe(publishableKey)

    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm familyName={familyName} firstName={firstName} email={email} event={event} category={category} photoUrls={photoUrls} client_secret={client_secret} />
        </Elements>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx)
    const { firestore } = await initFirebaseAdmin()
    const { query } = ctx
    const { familyName, firstName, email, selectedCategory, id } = query
    const eventSnapShot = (await firestore.collection('events').doc(query.id as string).get())
    const data = eventSnapShot.data()
    const photos: undefined | string[] = data.photos
    const photoUrls = photos ? await Promise.all(photos.map(async photo => getImg(photo, data.createdUser))) : undefined
    const createdAt = data.createdAt.seconds
    const updatedAt = data.updatedAt.seconds
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const event = { ...data, createdAt, updatedAt, startDate, endDate }
    const categorySnapShot = (await firestore.collection('events').doc(query.id as string).collection('categories').doc(selectedCategory as string).get())
    const category = categorySnapShot.data()

    const env = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? 'prod' : 'dev'
    const stripeSecret = env === 'prod' ? process.env.STRIPE_PROD_SECRET : process.env.STRIPE_DEV_SECRET
    const stripe = require('stripe')(stripeSecret) as Stripe
    const paymentIntent = await stripe.paymentIntents.create({
        amount: category.price,
        currency: 'jpy',
        payment_method_types: ['card'],
        // Verify your integration in this guide by including this parameter
        metadata: { 
            event: eventSnapShot.id,
            category: categorySnapShot.id
        }
    })
    const { client_secret } = paymentIntent
    return { props: { familyName, firstName, email, event, category, photoUrls, client_secret, env } }
}

export default Confirmation