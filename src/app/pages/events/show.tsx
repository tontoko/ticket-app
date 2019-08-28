import React, {useState} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Button, Container, Col, Row, 
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption
} from 'reactstrap';

const items = [
    {
        src: 'https://cdn.pixabay.com/photo/2019/08/12/10/03/tourism-4400872_1280.jpg',
        altText: 'Test Slide 1',
        caption: 'Test Slide 1'
    },
    {
        src: 'https://cdn.pixabay.com/photo/2018/07/30/10/54/moon-3572287_1280.jpg',
        altText: 'Test Slide 2',
        caption: 'Test Slide 2'
    },
    {
        src: 'https://cdn.pixabay.com/photo/2019/08/13/03/16/tokyo-4402415_1280.jpg',
        altText: 'Test Slide 3',
        caption: 'Test Slide 3'
    }
];

export default () => {

    const router = useRouter();

    const [activeIndex, setActiveIndex] = useState(0)
    const [animating, setAnimating] = useState(false)
    const [title, setTitle] = useState(`ID: ${router.query.id} のテストタイトル`)

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
        if (false) {
            // 申し込み
            return (
                <div style={{ marginTop: "1.5em" }}>
                    <Link href={urlToPurchase}>
                        <Button color="primary">このイベントに申し込む</Button>
                    </Link>
                </div>
            )
        } else if (false) {
            // 申し込み後
            return (
                <div style={{ marginTop: "1.5em" }}>
                    <Link href="">
                        <Button color="danger">チケットを購入済みです！</Button>
                    </Link>
                </div>
            )
        } else {
            // 主催者
            return (
                <Row style={{ marginTop: "1.5em" }}>
                    <Col sm="12" style={{ margin: "0.2em" }}>
                        <Link href={urlToReception}>
                            <Button block color="success">会場受付</Button>
                        </Link>
                    </Col>
                    <Col sm="12" style={{margin: "0.2em"}}>
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
        }
    }

    return (
        <Container>
            <Row style={{ marginTop: '1em', marginLeft: "0" }}>
                <h4>{title}</h4>
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
                </Col>
                <Col xs="12" md="6" lg="8">
                    <h6>イベントの説明　テストテストテストテストテストテストテストテストテストテストテストテストテストテストテストテストテストテストテストテストテスト</h6>
                    {buttons()}
                </Col>
            </Row>
        </Container>
    );
}

