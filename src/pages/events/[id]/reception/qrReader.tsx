import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { useAlert } from 'react-alert';
import Loading from '@/src/components/loading'
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
            proccessQRCode(data.split('params=')[1])
        }
    }

    const handleError = (err) => {
        console.error(err);
    }

    const proccessQRCode = async (data: string) => {
        try {
            const decededData = decodeQuery(data)
            const res = await fetch("/api/ticketReception", {
              method: "POST",
              credentials: "same-origin",
              body: JSON.parse(decededData),
            });
            if (res.status !== 200) return alert.error((await res.json()).msg);
            router.push({ pathname: `/events/${router.query.id}/reception`, query: { msg: encodeQuery((await res.json()).msg) }})
        } catch (e) {
            alert.error('エラーが発生しました。しばらくしてお試しください。')
        }
    }

    return proccessing ? <Loading />
        :
            (
            <div>
                <p>推奨環境はChrome・FireFoxです。iOSはSafariのみ対応しています。<br/>動作しない場合はサードパーティーのQRコードスキャナをご利用ください。</p>
                <QrReader
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%', marginTop: '0.5em' }}
                />
            </div>
            )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { user } = await isLogin(ctx, 'redirect')

    return { props: { user, query: ctx.query } }
}