import React from 'react';
import {
    Button, Container, Col, Row, Form, Input, FormGroup, Label
} from 'reactstrap';
import Link from 'next/link'

export default () => (
    <Form style={{ marginTop: "2em" }}>
        <FormGroup>
            <p>{`テスト 太郎`}</p>
        </FormGroup>
        <FormGroup>
            <label className="mr-2">金額</label>
            <Input type="number" />
        </FormGroup>
        <FormGroup>
            <label className="mr-2">支払済み</label>
            <Input type="select">
                <option>×</option>
                <option>○</option>
            </Input>
        <FormGroup>
        </FormGroup>
            <label className="mr-2">確認済み</label>
            <Input type="select">
                <option>×</option>
                <option>○</option>
            </Input>
        </FormGroup>
        <Row style={{ margin: 0, marginTop: "0.5em" }}>
            <Link href="/events/reception">
                <Button className="ml-auto">確認</Button>
            </Link>
        </Row>
    </Form>
);