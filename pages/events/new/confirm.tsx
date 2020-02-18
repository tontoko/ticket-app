import React, {useState} from 'react';
import {
    Button, Container, Col, Row, Form, Input, FormGroup, Label, CarouselItem, CarouselCaption, Carousel, CarouselControl, CarouselIndicators
} from 'reactstrap';
import {useRouter} from 'next/router'
import initFirebase from '../../../initFirebase'

const Page = () => {
    const router = useRouter()

    window.onbeforeunload = e => {
        e.returnValue = '本当に移動しますか？'
    }

    const { file1, file2, file3, eventName, placeName, eventDetail } = router.query
    const items = [file1, file2, file3].filter(v=>v).map((file,i) => {
        return {
            src: file as string,
            altText: '画像'+i,
            caption: '画像'+i
        }
    })
    const [activeIndex, setActiveIndex] = useState(0)
    const [animating, setAnimating] = useState(false)

    const next = () => {
        if (animating) return;
        const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1
        setActiveIndex(nextIndex)
    }

    const previous = () => {
        if (animating) return;
        const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1
        setActiveIndex(nextIndex)
    }

    const goToIndex = (newIndex) => {
        if (animating) return;
        setActiveIndex(newIndex)
    }

    const slides = items.map((item,i) => {
        return (
            <CarouselItem
                onExiting={() => setAnimating(true)}
                onExited={() => setAnimating(false)}
                key={i}
            >
                <img src={item.src} alt={item.altText} height="360em" />
                <CarouselCaption captionText={item.caption} captionHeader={item.caption} />
            </CarouselItem>
        )
    })

    const saveImages = async(file:string, number:number, firebase:any) => {
        const dt = new Date();
        const yyyy = dt.getFullYear()
        const MM = ("00" + (dt.getMonth() + 1)).slice(-2)
        const dd = ("00" + dt.getDate()).slice(-2)
        const hh = ("00" + dt.getHours()).slice(-2)
        const mm = ("00" + dt.getMinutes()).slice(-2)
        const ss = ("00" + dt.getSeconds()).slice(-2)
        const filename = yyyy + MM + dd + hh + mm + ss + '_' + number + '.jpg'
        const storageRef = firebase.storage().ref()
        const userEventRef = storageRef.child(`${firebase.auth().currentUser.uid}/events/${filename}`)
        await userEventRef.putString(file, 'data_url')
        return filename
    }

    const createEvent = async() => {
        const firebase = await initFirebase()
        let photos:string[] = []
        file1 && photos.push(await saveImages(file1 as string, 1, firebase))
        file2 && photos.push(await saveImages(file2 as string, 1, firebase))
        file3 && photos.push(await saveImages(file3 as string, 1, firebase))
        const firestore = firebase.firestore()
        await firestore.collection('events').add({
            photos,
            placeName,
            name: eventName,
            created_at: new Date
        })
        router.push('/users/myEvents')
    }

    return (
        <Container>
            <Form style={{ marginTop: "2em", marginBottom: "2em" }}>
                <FormGroup style={{ textAlign: 'center' }}>
                    <Carousel
                        activeIndex={activeIndex}
                        next={next}
                        previous={previous}
                        className="carousel-fade"
                        interval="20000"
                    >
                        <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
                        {slides}
                        <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
                        <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
                    </Carousel>
                </FormGroup>
                <FormGroup>
                    <Label className="mr-2">イベント名</Label>
                    <p>{eventName}</p>
                </FormGroup>
                <FormGroup>
                    <Label className="mr-2">会場名</Label>
                    <p>{placeName}</p>
                </FormGroup>
                <FormGroup>
                    <Label for="describe">イベント詳細</Label>
                    <Input disabled style={{ height: "40em" }} type="textarea" name="text" id="describe" value={router.query.eventDetail} />
                </FormGroup>
                <FormGroup>
                    <Row style={{ margin: 0, marginTop: "0.5em" }}>
                        <Button className="ml-auto" onClick={() => createEvent()}>作成</Button>
                    </Row>
                </FormGroup>
            </Form>
        </Container>
    );
};

Page.getInitialProps = async ({req, res}) => {
    // リロード等でSSRした場合作成画面にリダイレクト
    if (req) {
        res.writeHead(302, { Location: '/events/new' })
        res.end()
    }
}

export default Page