import {useRouter} from 'next/router'
import React, {useState} from 'react'
import {
    Form, FormGroup, Button, Label, Input, Row, Col, Card, CardBody,
    CardTitle, CardSubtitle, } from 'reactstrap'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import getImg from '@/src/lib/getImgSSR'
import { GetStaticProps, GetStaticPaths } from 'next'
import { event } from 'events'
import { encodeQuery } from '@/src/lib/parseQuery'
import withAuth from '@/src/lib/withAuth'

export const Purchase = ({ user, event, categories, photoUrls }) => {
    const router = useRouter();

    const validCategories = categories.filter(category => category.stock - category.sold > 0)
    const [familyName, setFamilyName] = useState('')
    const [firstName, setFirstName] = useState('')
    const [email, setEmail] = useState(user.email)
    const [invalidEmail, setInvalidEmail] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(validCategories[0].id)

    const changeEmail = (e) => {
        validationEmail()
        setEmail(e.target.value)
    }

    const validationEmail = () => {
        setInvalidEmail(!email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/))
    }

    const submit = (e) => {
        e.preventDefault();
        if (!email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) ||
        !firstName ||
        !familyName) return
        const pathname = `/events/${router.query.id}/purchase/confirm`
        // クエリーをまるごとbase64化
        router.push({ pathname, query: { query: encodeQuery(JSON.stringify({ familyName, firstName, email, selectedCategory, uid: user.uid })) }} )
    }

    return (
        <Form style={{ marginTop: '5em' }} onSubmit={submit}>
            <FormGroup>
                <Label>お名前</Label>
                <Row>
                    <Col xs="6">
                        <Input type="text" name="familyName" placeholder="性" onChange={e =>setFamilyName(e.target.value)} value={familyName} invalid={!familyName} />
                    </Col>
                    <Col xs="6">
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
                        </Row>
                        <Row style={{ marginTop: '0.5em' }}>
                            <Col>
                                <Label>チケットカテゴリ</Label>
                                <Input type="select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                                    {validCategories.map(category => (
                                        category && <option value={category.id} key={category.id}>{category.name}</option>
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
                <Button style={{ marginRight: '1em' }}>購入手続きへ</Button>
            </Row>
        </Form>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { firestore } = await initFirebaseAdmin()
    const paths = await Promise.all((await firestore.collection('events').get()).docs.map(doc => `/events/${doc.id}/purchase`))
    return { paths, fallback: true }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
    const {id} = params
    const { firestore } = await initFirebaseAdmin()
    const data = (await firestore.collection('events').doc(id as string).get()).data() as event
    const photos: undefined | string[] = data.photos
    const photoUrls = photos ? await Promise.all(photos.map(async photo => getImg(photo, data.createdUser))) : undefined
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const event = {...data, startDate, endDate}
    const categoriesSnapShot = (await firestore.collection('events').doc(id as string).collection('categories').orderBy('index').get())
    let categories: FirebaseFirestore.DocumentData[] = []
    categoriesSnapShot.forEach(e => {
        const id = e.id
        const category = e.data()
        category.public && categories.push({ ...category, id })
    })

    return {props: { event, categories, photoUrls }}
}

export default withAuth(Purchase)