import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Button, Col, Row, 
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    FormGroup} from 'reactstrap';
import getImg from '@/src/lib/getImgSSR'
import { GetServerSideProps } from 'next'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import isLogin from '@/src/lib/isLogin'
import { event } from 'events'
import moment from 'moment'
import { setCookie } from 'nookies'
import {
  LineShareButton,
  FacebookShareButton,
  TwitterShareButton,
  FacebookIcon,
  LineIcon,
  TwitterIcon,
} from "react-share";
import Tickets from '@/src/components/tickets';

export default ({ event, categories, status, items, tickets, setModal, setModalInner }) => {

    const router = useRouter();
    const startDate = moment(event.startDate * 1000)
    const endDate = moment(event.endDate * 1000)
    const [activeIndex, setActiveIndex] = useState(0)
    const [animating, setAnimating] = useState(false);

    const [twitterShareProps, setTwitterShareProps] = useState({
      url: "",
      title: "",
    });
    const [facebookShareProps, setFacebookShareProps] = useState({
      url: "",
      quote: "",
    });
    const [lineShareProps, setLineShareProps] = useState({
      url: "",
      title: "",
    });

    useEffect(() => {
        setTwitterShareProps({
            url: location.href,
            title: event.name,
        })
        setFacebookShareProps({
          url: location.href,
          quote: event.name,
        });
        setLineShareProps({
          url: location.href,
          title: event.name,
        });
    },[])

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
                <img src={item.src} style={{ width: "100%", height: "100%" }} onClick={() => callModalForImg(item.src)} />
            </CarouselItem>
        )
    })

    const callModalForImg = (src) => {
        setModalInner(<img src={src} style={{ width: "100%", height: "100%" }} onClick={() => setModal(false)} />)
        setModal(true)
    }

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
                  {tickets.map((ticket, i) => <Tickets ticket={ticket} event={event} key={i} />)}
                </Col>
                <Col sm="12" style={{ marginTop: "1.5em" }}>
                  <Link href={urlToPurchase}>
                    <Button block color="primary">
                      追加のチケットを購入する
                    </Button>
                  </Link>
                </Col>
              </Row>
            );
        } else if (categories.length === 0) {
            return
        } else if (status == 'anonymous') {
            return (
                <Row style={{ marginTop: "2em" }}>
                    <Col sm="12" style={{ margin: "0.2em" }}>
                        <p>チケットの購入にはログインが必要です</p>
                        <Link href='/login'>
                            <Button block color="info">ログイン / 会員登録する</Button>
                        </Link>
                    </Col>
                </Row>
            )
        }else {
            return (
                <Row style={{ marginTop: "1.5em" }}>
                    <Col sm="12" style={{ margin: "0.2em" }}>
                        <Link href={urlToPurchase}>
                            <Button block color="primary">チケットを購入する</Button>
                        </Link>
                    </Col>
                </Row>
            )
        }
    }

    const returnCatetgories = () => categories.map((category, i) => {
        const msg = `${category.name}: ${category.price} 円`
        const organizerMsg = status == 'organizer' && ` 残り ${category.stock - category.sold} 枚`
        if (status == 'organizer' && !category.public) {
            return <h6 key={i}>{msg}{organizerMsg} (非公開)</h6>
        }
        if (category.public) {
            if (category.stock - category.sold < 1) {
                return <h6 key={i} style={{ textDecorationLine: 'line-through' }}>{msg}{organizerMsg}<span> 完売</span></h6>
            }
            return <h6 key={i}>{msg}{organizerMsg}</h6>
        }
    })

    return (
      <>
        <Row style={{ marginTop: "1em", marginLeft: "0" }}>
          <h3>
            【{moment(startDate).format("d/M")}】{event.name}
          </h3>
        </Row>
        <Row style={{ marginTop: "1em" }}>
          <Col xs="12" md="6" lg="4">
            <Carousel
              activeIndex={activeIndex}
              next={next}
              previous={previous}
              className="carousel-fade"
              style={{ width: "100%" }}
              interval="20000"
            >
              <CarouselIndicators
                items={items}
                activeIndex={activeIndex}
                onClickHandler={goToIndex}
              />
              {slides}
              <CarouselControl
                direction="prev"
                directionText="Previous"
                onClickHandler={previous}
              />
              <CarouselControl
                direction="next"
                directionText="Next"
                onClickHandler={next}
              />
            </Carousel>
            <FormGroup style={{ marginTop: "1em" }}>
              <h5>会場</h5>
              <p style={{ marginLeft: "0.5em" }}>{event.placeName}</p>
            </FormGroup>
            <FormGroup>
              <h5>開始</h5>
              <p>{moment(startDate).format("YYYY年 M月d日 H:mm")}</p>
            </FormGroup>
            <FormGroup>
              <h5>終了</h5>
              <p>{moment(endDate).format("YYYY年 M月d日 H:mm")}</p>
            </FormGroup>
            <FormGroup>
              <TwitterShareButton {...twitterShareProps} style={{ marginRight: "1em" }}>
                <TwitterIcon size={40} />
              </TwitterShareButton>
              <FacebookShareButton {...facebookShareProps} style={{ marginRight: "1em" }}>
                <FacebookIcon size={40} />
              </FacebookShareButton>
              <LineShareButton {...lineShareProps}>
                <LineIcon size={40} />
              </LineShareButton>
            </FormGroup>
            <FormGroup style={{ marginTop: "2em" }}>
              <h5>チケットカテゴリ</h5>
              <FormGroup style={{ marginLeft: "0.5em" }}>
                {categories && returnCatetgories()}
              </FormGroup>
              {status == "organizer" && (
                <Link href={`/events/${router.query.id}/categories/edit`}>
                  <Button>カテゴリの編集</Button>
                </Link>
              )}
            </FormGroup>
          </Col>
          <Col xs="12" md="6" lg="8" style={{ marginTop: "2em" }}>
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
    const eventRef = firestore.collection('events').doc(query.id as string)
    const result = await eventRef.get()
    const data = result.data() as event
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const photos: string[] = data.photos.length > 0 ? await Promise.all(data.photos.map(async photo => await getImg(photo, data.createdUser, '800'))) : [await getImg(null, data.createdUser)]
    const event = { ...data, startDate, endDate, photos, id: result.id }
    const categories = (await firestore.collection('events').doc(query.id as string).collection('categories').orderBy('index').get()).docs.map(category => { return { ...category.data(), id: category.id } })
    let status: string
    let tickets = []
    if (!user) {
        status = 'anonymous'
        setCookie(ctx, 'lastVisitedEvent', event.id, {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        })
    } else if (event.createdUser == user.uid) {
        status = 'organizer'
    } else {
        const payments = (await firestore.collection('payments').where("event", "==", result.id).where("buyer", "==", user.uid).get()).docs
        tickets = await Promise.all(payments.filter(ticket => ticket.data().event === event.id).map(async payment => {
            const targetCategory = categories.filter(catgegory => catgegory.id === payment.data().category)[0]
            return {
                ...targetCategory,
                categoryId: targetCategory.id,
                paymentId: payment.id,
                accepted: payment.data().accepted,
                error: payment.data().error,
                buyer: payment.data().buyer,
                seller: payment.data().seller
            }
        }))
        status = payments.length > 0 && 'bought'
        // ログイン済みで主催者以外の場合に履歴に追加
        if (data) {
          let { eventHistory } = (await firestore.collection('users').doc(user.uid).get()).data()
          if (!eventHistory) eventHistory = []
          eventHistory = Array.from(new Set([...eventHistory, result.id]));
          eventHistory.length > 10 && eventHistory.shift()
          await firestore.collection('users').doc(user.uid).update({ eventHistory })
        }
    }
    const items = event.photos.map((url) => {
        return {
            src: url,
        }
    })
    return { props: { user, event, categories, status, items, tickets } }
}