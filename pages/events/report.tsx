import React, { Component, useState } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Table, Container, Row, Col, Label, Button, Input } from 'reactstrap';

export default () => {

    return (
        <Container>
            <Row style={{margin: "0", marginTop: "1em"}}>
                <h3>テストレポート</h3>
            </Row>
            <Table striped style={{ marginTop: "1em" }}>
                <thead>
                    <tr>
                        <th>購入</th>
                        <th>来場</th>
                        <th>キャンセル</th>
                        <th>不明</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>100</td>
                        <td>80</td>
                        <td>10</td>
                        <td>10</td>
                    </tr>
                </tbody>
            </Table>
            <Table striped style={{ marginTop: "1em" }}>
                <thead>
                    <tr>
                        <th>売上合計</th>
                        <th>割引合計</th>
                        <th>見込み</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>180000</td>
                        <td>20000</td>
                        <td>150000</td>
                    </tr>
                </tbody>
            </Table>
        </Container>
    );
}