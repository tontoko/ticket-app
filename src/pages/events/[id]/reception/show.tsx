import QRCode from "qrcode.react"
import {
    Col, Row
} from 'reactstrap';
import { useState, useEffect } from "react";
import Loading from '@/src/components/loading'
import { decodeQuery, encodeQuery } from "@/src/lib/parseQuery";
import { useRouter } from "next/router";

export default () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [value, setValue] = useState('')
    
    useEffect(() => {
        if (!router) return
        (async () => {
            const decodedQuery = JSON.parse(decodeQuery(router.query.ticket as string));
            const { paymentId, seller, buyer } = decodedQuery
            const encodedQuery = encodeQuery(JSON.stringify({ paymentId, seller, buyer }))
            setValue(
              `https://${document.domain}/events/${router.query.id}/reception/qrReader?params=${encodedQuery}`
            );
            setLoading(false)
        })()
    }, [router])

    if (loading) return <Loading/>

    return (
        <Row style={{marginTop: "2em"}}>
            <Col sm={{ size: 10, offset: 1 }} lg={{ size: 6, offset: 3}}>
                <div style={{ margin: '1em' }}>
                    <QRCode style={{ width: "100%", height: "100%" }} value={value} />
                </div>
            </Col>
            <Col sm={{ size: 10, offset: 1 }} lg={{ size: 6, offset: 3 }} style={{ marginTop: '1.5em' }}>
                <p>会場受付でQRコードをスキャンしてください。</p>
            </Col>
        </Row>
    )
}