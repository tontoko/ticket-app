import React from 'react';
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Container, Col, Row, Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import Link from 'next/link'

export default () => {
    return (
        <Container>
            <div style={{ marginTop: "1em" }}>
                <Link href="/events/1">
                    <Card style={{cursor: 'pointer'}}>
                        <CardBody>
                            <Row>
                                <Col sm="2" xs="3">
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
                                <Col sm="2" xs="3">
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
            </div>
            <Pagination aria-label="Page navigation" xs="" style={{ marginTop: "1em", justifyContent: "center" }}>
                <PaginationItem>
                    <PaginationLink first href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink previous href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        1
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        2
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        3
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        4
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        5
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink next href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink last href="#" />
                </PaginationItem>
            </Pagination>
        </Container>
    );
};
