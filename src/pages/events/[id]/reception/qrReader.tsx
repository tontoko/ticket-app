import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import initFirebase from '@/src/lib/initFirebase';
import { query } from 'express';
import { useAlert } from 'react-alert';
import Loading from '@/src/components/loading'
const QrReader = dynamic(() => import("react-qr-reader"), {
    loading: () => <p>loading...</p>, ssr: false
})

export default () => {
    const router = useRouter()
    const alert = useAlert()
    const [proccessing, setProccesing] = useState(false)

    const handleScan = (data: string) => {
        if (data) {
            const receivedData = JSON.parse(data)
            setProccesing(true)
            proccessQRCode(receivedData)
        }
    }

    const handleError = (err) => {
        console.error(err);
    }

    const proccessQRCode = async (receivedData) => {
        try {
            const { functions } = await initFirebase()
            const res = await functions.httpsCallable('ticketReception')({ ...receivedData })
            router.push({pathname: `/events/${router.query.id}/reception`, query: { msg: res.data.msg }})
        } catch (e) {
            alert.error(e.message)
        }
    }

    return proccessing ? <Loading />
        :
            (
            <div>
                <QrReader
                    delay={1000}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%' }}
                />
            </div>
            )
}