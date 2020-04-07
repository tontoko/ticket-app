import React, { Component, useState } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Table, Container, Row, Col, Label, Button, Input } from 'reactstrap';

export default () => {

    const router = useRouter()

    const [state, setState] = useState([
        {
            id: 1,
            firstName: "テスト",
            familyName: "太郎",
            price: 1000,
            confirmed: false,
            paid: false
        },
        {
            id: 2,
            firstName: "テスト",
            familyName: "二郎",
            price: 2000,
            confirmed: false,
            paid: false
        },
        {
            id: 3,
            firstName: "テスト",
            familyName: "三郎",
            price: 3000,
            confirmed: false,
            paid: false
        }
    ])

    const column = (e,i) => {
        const editHref = `/events/${e.id}/reception/edit`

        return (
            <tr key={e.id}>
                <td>{state[i].confirmed ? "○" : "×"}</td>
                <td>{e.firstName}</td>
                <td>{e.familyName}</td>
                <td>{e.price}</td>
                <td>{state[i].paid ? "○" : "×"}</td>
                <td><Button href={editHref}>編集</Button></td>
            </tr>
        );
    }

    const readHref = `/events/${router.query.id}/reception/qrReader`

    return (
        <>
            <Row style={{marginTop: "1.5em"}}>
                <Col>
                    <Link href={readHref}>
                        <Button color="success">QRリーダーを起動する</Button>
                    </Link>
                </Col>
            </Row>
            <Table striped style={{ marginTop: "1em" }}>
                <thead>
                    <tr>
                        <th>確認</th>
                        <th>性</th>
                        <th>名</th>
                        <th>金額</th>
                        <th>支払い</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {state.map((e,i) => column(e,i))}
                </tbody>
            </Table>
        </>
    );
}