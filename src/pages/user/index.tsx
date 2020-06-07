import Link from 'next/link'
import React from 'react'
import { Form, FormGroup, Button, Label, Input, Row, Card, CardBody, Col, CardTitle, CardSubtitle, CardText } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import getImg from '@/src/lib/getImgSSR'
import moment from 'moment'
import { parseCookies } from 'nookies'

export const UserShow: React.FC<any> = ({user, event}) => {

    const renderUserEvent = () => {
        const showDate = () => {
            const startDate = moment(event.startDate * 1000)
            const endDate = moment(event.endDate * 1000)
            if (startDate.format("YYYYMd") === endDate.format("YYYYMd")) {
                return `${startDate.format("YYYY年 M月d日  H:mm")} - ${endDate.format("H:mm")}`
            } else {
                return `${startDate.format("YYYY年 M月d日  H:mm")} - ${endDate.format("YYYY年  M月d日 H:mm")}`
            }
        }

        return (
            <Link href={`/events/${event.id}`}>
                <div>
                    <Card style={{ cursor: 'pointer' }}>
                        <CardBody>
                            <Row>
                                <Col sm="2" xs="3">
                                    <img width="100%" src={event.photos} alt="Card image cap" />
                                </Col>
                                <Col xs="auto">
                                    <CardTitle>{event.name}</CardTitle>
                                    <CardSubtitle>{event.placeName}</CardSubtitle>
                                    <CardText>{showDate()}</CardText>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </div>
            </Link>
        )
    }

    return (
        <>
        <h2>ようこそ{user.name && ` ${user.name} さん`}</h2>
        <Form style={{marginTop: "1.5em"}}>
            {event &&
            <Row form>
                <h5>このイベントに興味がありますか？</h5>
                {renderUserEvent()}
            </Row>
            }
            <Row form style={{ marginTop: "2em" }}>
                <Link href={`/user/edit`}>
                    <Button className="ml-auto">登録情報の編集</Button>
                </Link>
            </Row>
            <Row form style={{ marginTop: "2em" }}>
                <Button className="ml-auto" onClick={async() => {
                    const {firebase} = await initFirebase()
                    await firebase.auth().signOut()
                }}>
                    ログアウト
                </Button>
            </Row>
        </Form>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx, 'redirect')
    const { firestore } = await initFirebaseAdmin()
    const history: string[] = await (await firestore.collection('users').doc(user.uid).get()).data().eventHistory
    const cookie = parseCookies(ctx)
    let event = null
    if (history || cookie.lastVisitedEvent) {
        let doc: string
        if (history) {
            doc = history.slice(-1)[0]
        } else {
            doc = cookie.lastVisitedEvent
        }
        const result = await firestore.collection('events').doc(doc).get()
        const data = result.data()
        const createdAt = data.createdAt.seconds
        const updatedAt = data.updatedAt.seconds
        const startDate = data.startDate.seconds
        const endDate = data.endDate.seconds
        const photos: string[] = data.photos.length > 0 ? await Promise.all(data.photos.map(async photo => await getImg(photo, data.createdUser))) : [await getImg(null, data.createdUser)]
        event = { ...data, createdAt, updatedAt, startDate, endDate, photos, id: result.id }
    }
    return { props: { user, event } }
}

export default UserShow