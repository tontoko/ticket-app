import QRCode from "qrcode.react"
import {
    Button, Container, Col, Row
} from 'reactstrap';
import { useRouter } from "next/router";
import atob from 'atob'
import { GetServerSideProps } from "next";
import isLogin from "@/src/lib/isLogin";

export default ({query}) => {
    const value = decodeURIComponent(escape(atob(query.ticket as string)))
    return (
        <Row style={{marginTop: "2em"}}>
            <Col sm={{ size: 10, offset: 1 }} lg={{ size: 6, offset: 3}}>
                <QRCode style={{width: "100%", height: "100%"}} value={value} />
            </Col>
        </Row>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { user } = await isLogin(ctx)

    return { props: { user, query: ctx.query } }
}