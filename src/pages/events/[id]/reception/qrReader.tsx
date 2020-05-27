import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import initFirebase from '@/src/lib/initFirebase';
import { query } from 'express';
import { useAlert } from 'react-alert';
import Loading from '@/src/components/loading'
import { Button } from 'reactstrap';
import { GetServerSideProps } from 'next';
import isLogin from '@/src/lib/isLogin';
import { decodeQuery, encodeQuery } from '@/src/lib/parseQuery';
const QrReader = dynamic(() => import("react-qr-reader"), {
    loading: () => <p>loading...</p>, ssr: false
})

export default ({query}) => {
    const router = useRouter()
    const alert = useAlert()
    const [proccessing, setProccesing] = useState(false)

    useEffect(() => {
        if (query.params) {
            proccessQRCode(query.params)
        }
    }, [])

    const handleScan = (data: string) => {
        if (data) {
            setProccesing(true)
            proccessQRCode(data)
        }
    }

    const handleError = (err) => {
        console.error(err);
    }

    const proccessQRCode = async (data: string) => {
        try {
            const decededData = decodeQuery(data.split('params=')[1])
            const { functions } = await initFirebase()
            const res = await functions.httpsCallable('ticketReception')(JSON.parse(decededData))
            router.push({pathname: `/events/${router.query.id}/reception`, query: { msg: encodeQuery(res.data.msg) }})
        } catch (e) {
            alert.error(e.message)
        }
    }

    return proccessing ? <Loading />
        :
            (
            <div>
                <p>動作推奨環境はPC版Chrome・FireFoxです。<br/>スマホで動作しない場合はサードパーティーのQRコードスキャナをご使用ください。</p>
                <QrReader
                    delay={1000}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%', marginTop: '0.5em' }}
                />
            </div>
            )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { user } = await isLogin(ctx)

    return { props: { user, query: ctx.query } }
}