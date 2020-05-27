import QRCode from "qrcode.react"
import {
    Col, Row
} from 'reactstrap';
import { GetServerSideProps } from "next";
import isLogin from "@/src/lib/isLogin";
import { useState, useEffect } from "react";
import Loading from '@/src/components/loading'
import { decodeQuery, encodeQuery } from "@/src/lib/parseQuery";
import initFirebase from "@/src/lib/initFirebase";

export default ({ query, CSRUser }) => {
    const [loading, setLoading] = useState(true)
    const [value, setValue] = useState('')
    
    useEffect(() => {
        (async () => {
            if (!CSRUser) return
            const decodedQuery = JSON.parse(decodeQuery(query.ticket))
            const { paymentId, seller, buyer } = decodedQuery
            const buyerToken = await CSRUser.getIdToken()
            const encodedQAuery = encodeQuery(JSON.stringify({ paymentId, seller, buyer, buyerToken }))
            setValue(`https://${document.domain}/events/${query.id}/reception/qrReader?params=${encodedQAuery}`)
            setLoading(false)
        })()
    }, [CSRUser])

    if (loading) return <Loading/>

    return (
        <Row style={{marginTop: "2em"}}>
            <Col sm={{ size: 10, offset: 1 }} lg={{ size: 6, offset: 3}}>
                <QRCode style={{width: "100%", height: "100%"}} value={value} />
            </Col>
            <Col sm={{ size: 10, offset: 1 }} lg={{ size: 6, offset: 3 }} style={{ marginTop: '1.5em' }}>
                <p>会場受付でQRコードをスキャンしてください。</p>
            </Col>
        </Row>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { user } = await isLogin(ctx)

    return { props: { user, query: ctx.query } }
}