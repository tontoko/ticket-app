import React from 'react';
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Container, Col, Row, Pagination, PaginationItem, PaginationLink, Form, FormGroup, Label, Input
} from 'reactstrap';
import Link from 'next/link'

export default () => {
    return (
        <Container>
            <Form inline style={{ marginTop: "1em" }}>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                    <Label for="id" className="mr-sm-2">ID</Label>
                    <Input type="text" name="id" id="id" />
                </FormGroup>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                    <Label for="name" className="mr-sm-2">名前</Label>
                    <Input type="text" name="name" id="name" />
                </FormGroup>
                <Col sm="12" md="1" className="p-0">
                    <Button style={{ height: "2.4em", width: "4em" }}>検索</Button>
                </Col>
            </Form>
            <div style={{ marginTop: "1em" }}>
                <a href="/events/1">
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
                </a>
                <a href="/events/2">
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
                </a>
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
