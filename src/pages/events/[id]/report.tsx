import React, { Component, useState, ReactElement } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Table, Container, Row, Col, Label, Button, Input } from 'reactstrap';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import isLogin from '@/src/lib/isLogin';
import { GetServerSideProps } from 'next';
import { event } from 'events';

export default ({ user, event, categories, payments }) => {
    let totalSalesProspect = 0
    let totalSales = 0
    let totalFee = 0
    let totalIncome = 0
    let categoryReport: ReactElement[] = []

    categories.map((category, i) => {
        const targetPayments = payments.filter(targetPayment => targetPayment.category === category.id)
        const manualPaid = category.manualPayments ? category.manualPayments.filter(manualPayment => manualPayment.paid).length : 0
        const manualUnpaid = (category.manualPayments ? category.manualPayments.length : 0) - manualPaid
        const visited = targetPayments.filter(targetPayment => targetPayment.accepted).length + manualPaid
        const sold = category.sold - manualUnpaid
        totalSalesProspect += category.stock * category.price
        totalSales += sold * category.price
        totalFee += sold * Math.floor(category.price * 0.05)
        totalIncome += sold * category.price - sold * Math.floor(category.price * 0.05)
        categoryReport.push(
            <tr key={i}>
                <td>{category.name}</td>
                <td>{sold}</td>
                <td>{category.stock - sold}</td>
                <td>{Math.floor(sold / category.stock * 100)} %</td>
                <td>{visited}</td>
                <td>{sold ? Math.floor(visited / sold * 100) : 0} %</td>
            </tr>
        )
    })

    // TODO: 電子チケットの一覧も見れるようにする
    return (
        <>
            <Row style={{margin: "0", marginTop: "1em"}}>
                <h3>{event.name} レポート</h3>
            </Row>
            <Table striped style={{ marginTop: "1em" }}>
                <thead>
                    <tr>
                        <th>チケットカテゴリ</th>
                        <th>販売数</th>
                        <th>残在庫数</th>
                        <th>販売 / 在庫</th>
                        <th>来場数</th>
                        <th>来場 / 販売</th>
                    </tr>
                </thead>
                <tbody>
                    {categoryReport}
                </tbody>
            </Table>
            <Table striped style={{ marginTop: "1em" }}>
                <thead>
                    <tr>
                        <th>売上見込み</th>
                        <th>売上合計</th>
                        <th>手数料合計</th>
                        <th>実収入</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{totalSalesProspect} 円</td>
                        <td>{totalSales} 円</td>
                        <td>{totalFee} 円</td>
                        <td>{totalIncome} 円</td>
                    </tr>
                </tbody>
            </Table>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user, query } = await isLogin(ctx, 'redirect')
    const { firestore } = await initFirebaseAdmin()
    
    const result = await firestore.collection('events').doc(query.id as string).get()
    const data = result.data() as event
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds
    const event = { ...data, startDate, endDate, id: result.id }

    const categories = (await firestore.collection('events').doc(query.id as string).collection('categories').orderBy('index').get()).docs.map(category => { return { ...category.data(), id: category.id } })
    const payments = (await firestore.collection('payments').where("event", "==", result.id).get()).docs.map(payment => payment.data())

    return { props: { user, event, categories, payments } }
}