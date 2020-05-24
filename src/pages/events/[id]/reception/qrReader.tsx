import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const QrReader = dynamic(() => import("react-qr-reader"), {
    loading: () => <p>loading...</p>, ssr: false
})

export default () => {
    const router = useRouter()

    const handleScan = (data) => {
        if (data) {
            // router.push(data)
            console.log(data)
        }
    }

    const handleError = (err) => {
        console.error(err);
    }

    return (
        <div>
            <QrReader
                delay={1000}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
            />
        </div>
    );
}