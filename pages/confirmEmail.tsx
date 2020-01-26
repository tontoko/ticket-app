import Link from 'next/link'
import React, {useState, useEffect} from 'react'
import initFirebase from '../initFirebase'
import {useRouter} from 'next/router'
import errorMsg from '../lib/errorMsg'
import Loading from '../components/loading'

export default (props) => {
    const router = useRouter()
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        (async() => {
            // クライアント側の認証を待つ
            const auth = (await initFirebase()).auth()
            if (!auth.currentUser) return
            if (!loading) return
            sendEmail(auth)
        })()
    })

    const sendEmail = async(auth) => {
        try {
            await auth.currentUser.sendEmailVerification()
            setLoading(false)
            setMsg('登録されたメールアドレスに認証用メールを送信しました。')
        } catch (e) {
            console.log(e)
            setLoading(false)
            setMsg(errorMsg(e))
        }
    }

    if (loading) return <Loading/>
    return (
    <h4>{msg}</h4>
    )
}