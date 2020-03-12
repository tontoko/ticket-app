import Link from 'next/link'
import {useRouter} from 'next/router'
import React, {useEffect, useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
    Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, } from 'reactstrap'
import initFirebase from '@/initFirebase'
import getImg from '@/lib/getImg'

export const Purchase: React.FC = () => {
    const router = useRouter();

    const [familyName, setFamilyName] = useState('')
    const [firstName, setFirstName] = useState('')
    const [email, setEmail] = useState('')
    const [invalidEmail, setInvalidEmail] = useState(false)
    const [event, setEvent]: [firebase.firestore.DocumentData, Dispatch<SetStateAction<firebase.firestore.DocumentData>>] = useState()
    const [img, setImg]: [string, Dispatch<SetStateAction<string>>] = useState()

    useEffect(() => {
        (async () => {
            const { firebase, firestore } = await initFirebase()
            const result = await firestore.collection('events').doc(router.query.id as string).get()
            if (!result.exists) router.push('/user')
            setEvent(result.data())
            setImg(await getImg(result.data().photos[0]))
        })()
    }, [])

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
        router.push({ pathname, query: { familyName, firstName, email } })
    }

    return (
        <Container>
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
                                    <img width="100%" src={img} alt="image" />
                                </Col>
                                <Col xs="auto">
                                    <CardTitle>{event?.name}</CardTitle>
                                    <CardSubtitle>{event?.placeName}</CardSubtitle>
                                    <CardText>{event?.eventDetail}</CardText>
                                </Col>
                            </Row>
                            <Row className="flex-row-reverse">
                                <h4 style={{ marginTop: '1em', marginRight: '1em' }}>テスト金額</h4>
                            </Row>
                        </CardBody>
                    </Card>
                </FormGroup>
                <Row className="flex-row-reverse">
                    <Button style={{ marginRight: '1em' }} onClick={() => submit()}>確認</Button>
                </Row>
            </Form>
        </Container>
    );
}

export default Purchase