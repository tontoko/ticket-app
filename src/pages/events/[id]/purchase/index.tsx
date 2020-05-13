import Link from 'next/link'
import {useRouter} from 'next/router'
import React, {useEffect, useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
    Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, } from 'reactstrap'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import initFirebase from '@/src/lib/initFirebase'
import getImg from '@/src/lib/getImgSSR'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import { event } from 'events'

export const Purchase = ({ event, categories, photoUrls }) => {
    const router = useRouter();

    const [familyName, setFamilyName] = useState('')
    const [firstName, setFirstName] = useState('')
    const [email, setEmail] = useState('')
    const [invalidEmail, setInvalidEmail] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(categories[0].id)

    const changeEmail = (e) => {
        validationEmail()
        setEmail(e.target.value)
    }

    const validationEmail = () => {
        setInvalidEmail(!email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/))
    }

    const submit = () => {
        if (!email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) ||
        !firstName ||
        !familyName) return
        const pathname = `/events/${router.query.id}/purchase/confirm`
        router.push({ pathname, query: { familyName, firstName, email, selectedCategory } })
    }

    return (
        <Form style={{ marginTop: '5em' }}>
            <FormGroup>
                <Label>お名前</Label>
                <Row>
                    <Col xs="3">
                        <Input type="text" name="familyName" placeholder="性" onChange={e =>setFamilyName(e.target.value)} value={familyName} invalid={!familyName} />
                    </Col>
                    <Col xs="3">
                        <Input type="text" name="firstName" placeholder="名" onChange={e => setFirstName(e.target.value)} value={firstName} invalid={!firstName} />
                    </Col>
                </Row>
            </FormGroup>
            <FormGroup>
                <Label>メールアドレス</Label>
                <Input type="email" name="email" placeholder="メールアドレス" onChange={changeEmail} value={email} invalid={invalidEmail}/>
            </FormGroup>
            <FormGroup>
                <Label>イベント情報</Label>
                <Card>
                    <CardBody>
                        <Row>
                            <Col sm="2" xs="3">
                                <img width="100%" src={photoUrls[0]} alt="image" />
                            </Col>
                            <Col xs="auto">
                                <CardTitle>{event.name}</CardTitle>
                                <CardSubtitle>開催地: {event.placeName}</CardSubtitle>
                            </Col>
                            <Col>
                                <Label>チケットカテゴリ</Label>
                                <Input type="select" value={selectedCategory} onChange={e =>  setSelectedCategory(e.target.value)}>
                                    {categories.map(category => (
                                        category.stock && <option value={category.id} key={category.id}>{category.name}</option>
                                    ))}
                                </Input>
                            </Col>
                        </Row>
                        <Row className="flex-row-reverse">
                            <h4 style={{ marginTop: '1em', marginRight: '1em' }}>
                                {categories.filter(category => category.id === selectedCategory)[0].price} 円
                            </h4>
                        </Row>
                    </CardBody>
                </Card>
            </FormGroup>
            <Row className="flex-row-reverse">
                <Button style={{ marginRight: '1em' }} onClick={() => submit()}>確認</Button>
            </Row>
        </Form>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const {user} = await isLogin(ctx)
    const { firestore } = await initFirebaseAdmin()
    const {query} = ctx
    const data = (await firestore.collection('events').doc(query.id as string).get()).data() as event
    const photos: undefined | string[] = data.photos
    const photoUrls = photos ? await Promise.all(photos.map(async photo => getImg(photo, data.createdUser))) : undefined
    const createdAt = data.createdAt.seconds
    const updatedAt = data.updatedAt.seconds
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const event = {...data, createdAt, updatedAt, startDate, endDate}
    const categoriesSnapShot = (await firestore.collection('events').doc(query.id as string).collection('categories').get())
    let categories: FirebaseFirestore.DocumentData[] = []
    categoriesSnapShot.forEach(e => {
        const id = e.id
        const category = e.data()
        categories.push({ ...category, id })
    })
    return {props: { event, categories, photoUrls }}
}

export default Purchase