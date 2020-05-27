import Link from 'next/link'
import {useRouter} from 'next/router'
import React, {useEffect, useState} from 'react'
import {
    Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, FormFeedback, Spinner } from 'reactstrap'
import { useAlert } from 'react-alert'
import {
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import getImg from '@/src/lib/getImgSSR'
import stripe from '@/src/lib/stripe'
import initFirebase from '@/src/lib/initFirebase'
import atob from 'atob'
import { decodeQuery, encodeQuery } from '@/src/lib/parseQuery'

const Confirmation = ({ familyName, firstName, email, event, category, photoUrls, client_secret, categoryId, eventId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter()
    const alert = useAlert()
    const [agree, setAgree] = useState(false)
    const [processing, setProcessing] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!stripe || !elements) return
        if (!agree) return alert.error("同意します が選択されていません")
        const { firestore } = await initFirebase()
        setProcessing(true)
        const ticket = (await firestore.collection('events').doc(eventId).collection('categories').doc(categoryId).get()).data()
        if (category.stock - category.sold < 1 || !ticket.public) {
            const msg = ticket.stock - ticket.sold < 1 ? '在庫がありませんでした。リダイレクトします。' : '対象のチケットは主催者によって非公開に設定されました。リダイレクトします。'
            alert.error(msg)
            setTimeout(() => {
                router.push(`/events/${eventId}`)
            }, 3000);
            return
        }
        const res = await stripe.confirmCardPayment(client_secret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: `${familyName} ${firstName}`,
                    email
                },
            }
        })
        if (res.error) {
            alert.error('エラーが発生しました。')
            return setProcessing(false)
        }
        router.push({ pathname: '/user/myTickets', query: { msg:  encodeQuery('チケットの購入処理を開始しました。\n処理が完了すると「購入済みチケット」に表示されます。') } }, '/user/myTickets')
    }

    return (
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
                    {/* TODO 利用規約作る */}
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
                <Button disabled={!stripe || !elements || processing}>{processing ? <Spinner/> : '購入'}</Button>
            </Row>
        </Form>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx)
    const { firestore } = await initFirebaseAdmin()
    const { query } = ctx
    const { familyName, firstName, email, selectedCategory } = JSON.parse(decodeQuery(query.query as string))
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
    const eventId = eventSnapShot.id
    const categoryId = categorySnapShot.id
    // @ts-ignore
    const { stripeId }  = (await firestore.collection('users').doc(event.createdUser).get()).data()
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: category.price,
        currency: 'jpy',
        transfer_data: {
            amount: category.price - category.price * 0.08,
            destination: stripeId
        },
        payment_method_types: ['card'],
        on_behalf_of: stripeId,
        metadata: {
            event: eventSnapShot.id,
            category: categorySnapShot.id,
            seller: data.createdUser,
            buyer: user.uid,
        }
    })
    const { client_secret } = paymentIntent
    return { props: { familyName, firstName, email, event, category, photoUrls, client_secret, user, categoryId, eventId } }
}

export default Confirmation