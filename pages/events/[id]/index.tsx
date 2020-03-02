import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Button, Container, Col, Row, Label,
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption
} from 'reactstrap';
import getImg from '../../../lib/getImg'
import initFirebase from '../../../initFirebase'
import Loading from '../../../components/loading'

export default props => {

    const router = useRouter();
    const [event, setEvent]: [firebase.firestore.DocumentData, React.Dispatch<firebase.firestore.DocumentData>] = useState()
    const [categories, setCategories]: [firebase.firestore.DocumentData, React.Dispatch<firebase.firestore.DocumentData>] = useState()
    const [loading, setLoading] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0)
    const [animating, setAnimating] = useState(false)
    const [items, setItems] = useState([])
    const [status, setStatus] = useState('')

    useEffect(() => {
        let unsubscribe = () => void
        (async () => {
            const firebase = await initFirebase()
            const firestore = firebase.firestore()
            unsubscribe = await firestore.collection('events').doc(router.query.id as string).onSnapshot(async result => {
                if (!result.exists) router.push('/user')
                const categories = await result.ref.collection('categories').get()
                setCategories(categories.docs.map(category => category.data()))
                setItems(await Promise.all(result.data().photos.map(async (file, i) => {
                    const url = await getImg(file)
                    return {
                        src: url,
                        altText: '画像' + i,
                        caption: '画像' + i
                    }
                })))
                const { createdUser } = result.data()
                if (createdUser == props.user.uid) {
                    setStatus('organizer')
                } else {
                    const payments = await firestore.collection('users').doc(props.user.uid).collection('payments').where("event", "==", result.id).get()
                    payments.size > 0 && setStatus('bought')
                }
                setEvent(result.data())
                setLoading(false)
            })
        })()
        return unsubscribe()
    }, [])

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
                <img src={item.src} alt={item.altText} style={{width: "100%", height: "100%"}} />
                <CarouselCaption captionText={item.caption} captionHeader={item.caption} />
            </CarouselItem>
        );
    });

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
                <div style={{ marginTop: "1.5em" }}>
                    <Link href="">
                        <Button color="danger">チケットを購入済みです！</Button>
                    </Link>
                </div>
            )
        } else {
            // 申し込み
            return (
                <div style={{ marginTop: "1.5em" }}>
                    <Link href={urlToPurchase}>
                        <Button color="primary">このイベントに申し込む</Button>
                    </Link>
                </div>
            )
        }
    }

    if (loading) return <Loading />

    return (
        <Container>
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
                        style={{width: "100%"}}
                        interval="20000"
                    >
                        <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
                        {slides}
                        <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
                        <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
                    </Carousel>
                    <h5 style={{ marginTop: '0.5em' }}>会場</h5>
                    <p>会場: {event.placeName}</p>
                    <h5>チケットカテゴリ</h5>
                    {categories.map(category => <p>{`${category.name}: ${category.price} 円`}</p>)}
                    {status == 'organizer' && <Link href={`/events/${router.query.id}/categories/edit`}><Button>編集する</Button></Link>}
                </Col>
                <Col xs="12" md="6" lg="8" style={{marginTop: '2em'}}>
                    <h6>{event.eventDetail}</h6>
                    {buttons()}
                </Col>
            </Row>
        </Container>
    );
}

