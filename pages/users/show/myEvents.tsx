import React from 'react';
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Container, Col, Row
} from 'reactstrap';
import Link from 'next/link'

export default () => {
    return (
        <Container>
            <Link href="/events/1">
                <Card style={{ cursor: 'pointer' }}>
                    <CardBody>
                        <Row>
                            <Col xs="2">
                                <img width="100%" src="https://cdn.pixabay.com/photo/2019/06/21/20/19/grapes-4290308_1280.jpg" alt="Card image cap" />
                            </Col>
                            <Col xs="auto">
                                <CardTitle>テストイベント</CardTitle>
                                <CardSubtitle>テスト場所</CardSubtitle>
                                <CardText>テスト説明文</CardText>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Link>
            <Link href="/events/2">
                <Card style={{ cursor: 'pointer' }}>
                    <CardBody>
                        <Row>
                            <Col xs="2">
                                <img width="100%" src="https://cdn.pixabay.com/photo/2019/06/21/20/19/grapes-4290308_1280.jpg" alt="Card image cap" />
                            </Col>
                            <Col xs="auto">
                                <CardTitle>テストイベント</CardTitle>
                                <CardSubtitle>テスト場所</CardSubtitle>
                                <CardText>テスト説明文</CardText>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Link >
            <Row style={{margin: 0, marginTop: "0.5em"}}>
                <Link href="/events/new">
                    <Button className="ml-auto">新しいイベントを作成</Button>
                </Link>
            </Row>
        </Container>
    );
};
