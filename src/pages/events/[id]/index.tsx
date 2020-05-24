import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Button, Container, Col, Row, 
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption,
    FormGroup,
    Card,
    CardBody
} from 'reactstrap';
import getImg from '@/src/lib/getImgSSR'
import { GetServerSideProps } from 'next'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import isLogin from '@/src/lib/isLogin'
import { event } from 'events'
import moment from 'moment'
import btoa from 'btoa'

export default ({ user, event, categories, status, items, tickets }) => {

    const router = useRouter();
    const startDate = moment(event.startDate * 1000)
    const endDate = moment(event.endDate * 1000)
    const [activeIndex, setActiveIndex] = useState(0)
    const [animating, setAnimating] = useState(false)

    const next = () => {
        if (animating) return;
        const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex)
    }

    const previous = () => {
        if (animating) return;
        const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex)
    }

    const goToIndex = (newIndex) => {
        if (animating) return;
        setActiveIndex(newIndex)
    }
    
    const slides = items.map((item) => {
        return (
            <CarouselItem
                onExiting={() =>setAnimating(true)}
                onExited={() => setAnimating(false)}
                key={item.src}
            >
                <img src={item.src} style={{width: "100%", height: "100%"}} />
            </CarouselItem>
        )
    })

    const urlToPurchase = `/events/${router.query.id}/purchase`
    const urlToEdit = `/events/${router.query.id}/edit`
    const urlToReception = `/events/${router.query.id}/reception`
    const urlToReport = `/events/${router.query.id}/report`
    
    const buttons = () => {
        if (status == 'organizer') {
            // 主催者
            return (
                <Row style={{ marginTop: "1.5em" }}>
                    <Col sm="12" style={{ margin: "0.2em" }}>
                        <Link href={urlToReception}>
                            <Button block color="success">会場受付</Button>
                        </Link>
                    </Col>
                    <Col sm="12" style={{ margin: "0.2em" }}>
                        <Link href={urlToEdit}>
                            <Button block color="info">イベントを変更する</Button>
                        </Link>
                    </Col>
                    <Col sm="12" style={{ margin: "0.2em" }}>
                        <Link href={urlToReport}>
                            <Button block color="info">レポートを見る</Button>
                        </Link>
                    </Col>
                </Row>
            )
        } else if (status == 'bought') {
            // 申し込み後
            return (
                <Row style={{ marginTop: "1.5em" }}>
                    <Col sm="12" style={{ margin: "0.2em" }}>
                        <h5>購入済みチケット</h5>
                        {tickets.map((ticket, i) => (
                            <Card style={{ marginBottom: '0.5em' }} key={i}>
                                <CardBody>
                                    <p>{ticket.name}: {ticket.price}円</p>
                                    <p>{ticket.accepted ? '受付済み' : '未受付'}</p>
                                    <Row>
                                        {ticket.error ?
                                            <Col>
                                                <p>購入失敗 ({ticket.error})</p>
                                            </Col>
                                            :
                                            <>
                                                {!ticket.accepted &&
                                                    <Col>
                                                        <Link href={{ pathname: `/events/${event.id}/reception/show`, query: { ticket: btoa(encodeURIComponent(JSON.stringify(ticket))) } }}>
                                                            <Button color="success">受付用のQRコードを表示</Button>
                                                        </Link>
                                                    </Col>
                                                }
                                                <Col>
                                                    <Button color="danger">返金申請</Button>
                                                </Col>
                                            </>
                                        }
                                    </Row>
                                </CardBody>
                            </Card>
                        ))}
                    </Col>
                    <Col sm="12" style={{ marginTop: "1.5em" }}>
                        <Link href={urlToPurchase}>
                            <Button color="primary">追加のチケットを購入する</Button>
                        </Link>
                    </Col>
                </Row >
            )
        } else if (categories.length === 0) {
            return
        }else {
            // 申し込み
            return (
                <div style={{ marginTop: "1.5em" }}>
                    <Link href={urlToPurchase}>
                        <Button color="primary">チケットを購入する</Button>
                    </Link>
                </div>
            )
        }
    }

    const returnCatetgories = () => categories.map((category, i) => {
        const msg = `${category.name}: ${category.price} 円`
        if (status == 'organizer' && !category.public) {
            return <h6 key={i}>{`${msg} (非公開) 残り ${category.stock}枚`}</h6>
        }
        if (category.public) {
            if (category.stock - category.sold < 1) {
                return <h6 key={i} style={{ textDecorationLine: 'line-through' }}>{`${msg}`}<span> 完売</span></h6>
            }
            return <h6 key={i}>{msg}</h6>
        }
    })

    return (
        <>
            <Row style={{ marginTop: '1em', marginLeft: "0" }}>
                <h4>{event.name}</h4>
            </Row>
            <Row style={{ marginTop: '1em' }}>
                <Col xs="12" md="6" lg="4">
                    <Carousel
                        activeIndex={activeIndex}
                        next={next}
                        previous={previous}
                        className="carousel-fade"
                        style={{ width: "100%" }}
                        interval="20000"
                    >
                        <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
                        {slides}
                        <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
                        <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
                    </Carousel>
                    <FormGroup style={{marginTop: '1em'}}>
                        <h5>会場</h5>
                        <p style={{ marginLeft: '0.5em' }}>{event.placeName}</p>
                    </FormGroup>
                    <FormGroup>
                        <h5>開始</h5>
                        <p>{moment(startDate).format("YYYY M月d日 H:mm")}</p>
                    </FormGroup>
                    <FormGroup>
                        <h5>終了</h5>
                        <p>{moment(endDate).format("YYYY M月d日 H:mm")}</p>
                    </FormGroup>
                    <FormGroup style={{ marginTop: '2em' }}>
                        <h5>チケットカテゴリ</h5>
                        <FormGroup style={{marginLeft: '0.5em'}}>
                            {categories && returnCatetgories()}
                        </FormGroup>
                        {status == 'organizer' && <Link href={`/events/${router.query.id}/categories/edit`}><Button>カテゴリの編集</Button></Link>}
                    </FormGroup>
                </Col>
                <Col xs="12" md="6" lg="8" style={{marginTop: '2em'}}>
                    <h6>{event.eventDetail}</h6>
                    {buttons()}
                </Col>
            </Row>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { query } = ctx
    const { user } = await isLogin(ctx)
    const { firestore } = await initFirebaseAdmin()
    const result = await firestore.collection('events').doc(query.id as string).get()
    const data = result.data() as event
    const createdAt = data.createdAt.seconds
    const updatedAt = data.updatedAt.seconds
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const photos: string[] = data.photos.length > 0 ? await Promise.all(data.photos.map(async photo => await getImg(photo, data.createdUser))) : [await getImg(null, data.createdUser)]
    const event = { ...data, createdAt, updatedAt, startDate, endDate, photos, id: result.id }
    const categories = (await firestore.collection('events').doc(query.id as string).collection('categories').get()).docs.map(category => { return { ...category.data(), id: category.id } })
    let status: string
    let tickets = []
    if (!user) {
        status = 'anonymous'
    } else if (event.createdUser == user.uid) {
        status = 'organizer'
    } else {
        const payments = (await firestore.collection('payments').where("event", "==", result.id).where("buyer", "==", user.uid).get()).docs
        tickets = await Promise.all(payments.filter(ticket => ticket.data().event === event.id).map(async ticket => {
            const categorySnapShot = await firestore.collection('events').doc(event.id).collection('categories').doc(ticket.data().category).get()
            return {
                ...categorySnapShot.data(),
                categoryId: categorySnapShot.id,
                paymentId: ticket.id,
                accepted: ticket.data().accepted,
                error: ticket.data().error
            }
        }))
        status = payments.length > 0 && 'bought'
    }
    const items = event.photos.map((url, i) => {
        return {
            src: url,
        }
    })
    return { props: { user, event, categories, status, items, tickets } }
}