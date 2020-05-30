import React, {useState, useEffect} from 'react';
import {
    Button, Container, Col, Row, Form, Input, FormGroup, Label, CarouselItem, CarouselCaption, Carousel, CarouselControl, CarouselIndicators, Spinner
} from 'reactstrap';
import {useRouter} from 'next/router'
import initFirebase from '@/src/lib/initFirebase'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import moment from 'moment'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import stripe from '@/src/lib/stripe';

const Page = ({ currently_due, errors, eventually_due, past_due }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    
    const query = router.query
    const { file1, file2, file3, eventName, placeName, eventDetail, startDate, endDate } = query

    useEffect(() => {
        if (!eventName || !placeName) {
            router.back()
        } else if (currently_due.length || errors.length || eventually_due.length || past_due.length) {
            router.push('/user/edit')
        } else {
            setLoading(false)
        }
    }, [])

    const items = [file1, file2, file3].filter(v=>v).map(file => {
        return {
            src: file as string
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
            >
                <img src={item.src} height="360em" />
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
        const filename = yyyy + MM + dd + hh + mm + ss + '_' + number
        const storageRef = firebase.storage().ref()
        const userEventRef = storageRef.child(`${firebase.auth().currentUser.uid}/events/${filename}.jpg`)
        await userEventRef.putString(file, 'data_url')
        return filename
    }

    const createEvent = async(e) => {
        e.preventDefault()
        if (loading) false
        setLoading(true)
        const {firebase} = await initFirebase()
        let photos:string[] = []
        file1 && photos.push(await saveImages(file1 as string, 1, firebase))
        file2 && photos.push(await saveImages(file2 as string, 2, firebase))
        file3 && photos.push(await saveImages(file3 as string, 3, firebase))
        const firestore = firebase.firestore()
        await firestore.collection('events').add({
            photos,
            placeName,
            name: eventName,
            createdAt: new Date,
            createdUser: firebase.auth().currentUser.uid,
            eventDetail,
            startDate: moment(startDate as string).toDate(),
            endDate: moment(endDate as string).toDate(),
            updatedAt: new Date
        })
        router.push('/user/myEvents')
    }

    return (
        <Form style={{ marginTop: "2em", marginBottom: "2em" }} onSubmit={createEvent}>
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
                <Label>開始</Label>
                <Input value={moment(startDate).format("YYYY年 M月d日 H:mm")} disabled />
            </FormGroup>
            <FormGroup>
                <Label>終了</Label>
                <Input value={moment(endDate).format("YYYY年 M月d日 H:mm")} disabled />
            </FormGroup>
            <FormGroup>
                <Label for="describe">イベント詳細</Label>
                <Input disabled style={{ height: "40em" }} type="textarea" name="text" id="describe" value={query.eventDetail} />
            </FormGroup>
            <FormGroup>
                <Row style={{ margin: 0, marginTop: "0.5em" }}>
                    <Button disabled={loading} className="ml-auto">{loading ? <Spinner/> : '作成'}</Button>
                </Row>
            </FormGroup>
        </Form>
    );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    // クエリが渡って来ていない場合リダイレクト
    const { user } = await isLogin(ctx, 'redirect')

    const { firestore } = await initFirebaseAdmin()
    const { stripeId } = (await firestore.collection('users').doc(user.uid).get()).data()
    const { individual } = await stripe.accounts.retrieve(
        stripeId
    )
    const { currently_due, errors, eventually_due, past_due } = individual.requirements
    
    return { props: { user, currently_due, errors, eventually_due, past_due }}
}

export default Page