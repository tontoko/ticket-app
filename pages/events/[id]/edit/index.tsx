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
                    <Input></Input>
                </FormGroup>
                <FormGroup>
                    <label className="mr-2">会場名</label>
                    <Input></Input>
                </FormGroup>
                <FormGroup>
                    <Label for="describe">イベント詳細</Label>
                    <Input style={{ height: "40em" }} type="textarea" name="text" id="describe" />
                </FormGroup>
                <FormGroup>
                    <Row>
                        <Col sm="4">
                            <img />
                        </Col>
                        <Col sm="8">
                            <Label for="image">添付する画像を選択</Label>
                            <Input type="file" name="file1" id="image" />
                        </Col>
                    </Row>
                </FormGroup>
                <FormGroup>
                    <Row>
                        <Col sm="4">
                            <img />
                        </Col>
                        <Col sm="8">
                            <Label for="image">添付する画像を選択</Label>
                            <Input type="file" name="file2" id="image" />
                        </Col>
                    </Row>
                </FormGroup>
                <FormGroup>
                    <Row>
                        <Col sm="4">
                            <img />
                        </Col>
                        <Col sm="8">
                            <Label for="image">添付する画像を選択</Label>
                            <Input type="file" name="file3" id="image" />
                        </Col>
                    </Row>
                </FormGroup>
                <Row style={{ margin: 0, marginTop: "0.5em" }}>
                    <Link href="/events/new/confirm">
                        <Button className="ml-auto">確認</Button>
                    </Link>
                </Row>
            </Form>
        </Container>
    );
};
