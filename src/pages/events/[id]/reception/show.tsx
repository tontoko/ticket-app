import QRCode from "qrcode.react"
import {
    Col, Row
} from 'reactstrap';
import { GetServerSideProps } from "next";
import isLogin from "@/src/lib/isLogin";
import { useState, useEffect } from "react";
import Loading from '@/src/components/loading'

export default ({query}) => {
    const [loading, setLoading] = useState(true)
    const [value, setValue] = useState('')
    
    useEffect(() => {
        // TODO: 不要なデータ削ぎ落とし
        setValue(`https://${document.domain}/events/${query.id}/reception/qrReader?params=${query.ticket}`)
        setLoading(false)
    }, [])

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