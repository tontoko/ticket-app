import React from 'react';
import {
    Button, Container, Col, Row, Form, Input, FormGroup, Label
} from 'reactstrap';
import Link from 'next/link'

export default () => {
    return (
        <Container>
            <Form style={{ marginTop: "2em" }}>
                <FormGroup>
                    <label className="mr-2">イベント名</label>
                    <p>てすと</p>
                </FormGroup>
                <FormGroup>
                    <label className="mr-2">会場名</label>
                    <p>てすと</p>
                </FormGroup>
                <FormGroup>
                    <Label for="describe">イベント詳細</Label>
                    <Input disabled value="てすと" style={{ height: "40em" }} type="textarea" name="text" id="describe" />
                </FormGroup>
                <FormGroup>
                    <Row>
                        <Col sm="4">
                            <img />
                        </Col>
                        <Col sm="4">
                            <img />
                        </Col>
                        <Col sm="4">
                            <img />
                        </Col>
                    </Row>
                </FormGroup>
                <Row style={{ margin: 0, marginTop: "0.5em" }}>
                    <Link href="/events">
                        <Button className="ml-auto">確認</Button>
                    </Link>
                </Row>
            </Form>
        </Container>
    );
};