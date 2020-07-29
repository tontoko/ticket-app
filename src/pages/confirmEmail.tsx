import Link from 'next/link'
import React, {useState, useEffect} from 'react'
import {useRouter} from 'next/router'
import errorMsg from '@/src/lib/errorMsg'
import Loading from '@/src/components/loading'
import { auth } from '../lib/initFirebase'

export default ({user}) => {
    const router = useRouter()
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        (async() => {
            // クライアント側の認証を待つuser
            if (!user) return;
            if (!loading) return
            sendEmail();
        })()
    })

    const sendEmail = async () => {
        try {
            await user.sendEmailVerification();
            setLoading(false)
            setMsg('登録されたメールアドレスに認証用メールを送信しました。')
        } catch (e) {
            console.log(e)
            setLoading(false)
            setMsg(errorMsg(e))
        }
        setTimeout(async() => {
            await auth.signOut()
            router.push('/login')
        }, 5000)
    }

    if (loading) return <Loading/>
    return (
    <h4>{msg}</h4>
    )
}