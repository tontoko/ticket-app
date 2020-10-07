import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { useAlert } from 'react-alert'
import Loading from '@/src/components/loading'
import { decodeQuery, encodeQuery } from '@/src/lib/parseQuery'
import withAuth from '@/src/lib/withAuth'
import { fuego } from '@nandorojo/swr-firestore'
const QrReader = dynamic(() => import('react-qr-reader'), {
  // eslint-disable-next-line react/display-name
  loading: () => <p>loading...</p>,
  ssr: false,
})

const QrReaderPage = ({ user }) => {
  const router = useRouter()
  const alert = useAlert()
  const [proccessing, setProccesing] = useState(false)

  useEffect(() => {
    if (!router) return
    if (router.query.params) {
      proccessQRCode(router.query.params as string)
    }
  }, [router])

  const handleScan = (data: string) => {
    if (data) {
      proccessQRCode(data.split('params=')[1])
    }
  }

  const handleError = (err) => {
    console.error(err)
  }

  const proccessQRCode = async (data: string) => {
    try {
      setProccesing(true)
      const token = await user.getIdToken()
      const decededData = decodeQuery(data)
      const res = await fetch('/api/ticketReception', {
        method: 'POST',
        credentials: 'same-origin',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          ...JSON.parse(decededData),
          token,
        }),
      })
      if (res.status !== 200) throw new Error((await res.json()).error)
      router.push({
        pathname: `/events/${router.query.id}/reception`,
        query: { msg: encodeQuery((await res.json()).msg) },
      })
    } catch (e) {
      alert.error(e.message)
    }
    setProccesing(false)
  }

  if (proccessing) return <Loading />

  return (
    <div>
      <p>
        推奨環境はChrome・FireFoxです。iOSはSafariのみ対応しています。
        <br />
        動作しない場合はサードパーティーのQRコードスキャナをご利用ください。
      </p>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%', marginTop: '0.5em' }}
      />
    </div>
  )
}

export default withAuth(QrReaderPage)
