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
    const [user, setUser] = useState(props.user)
    
    useEffect(() => {
        // クライアント側の認証を待つ
        setUser(props.user)
        if (!user.providerId) return
        if (!loading) return
        sendEmail()
    })

    const sendEmail = async() => {
        const auth = (await initFirebase()).auth()
        try {
            await auth.currentUser.sendEmailVerification()
            setLoading(false)
            setMsg('登録されたメールアドレスに認証用メールを送信しました。リダイレクトします。')
        } catch (e) {
            console.log(e)
            setMsg(errorMsg(e))
        }
        setTimeout(async () => {
            await auth.signOut()
            router.push('/login')
        }, 5000)
    }

    if (loading) return <Loading/>
    return (
    <h4>{msg}</h4>
    )
}