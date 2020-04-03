import Link from 'next/link'
import React, {useState, useEffect} from 'react'
import initFirebase from '@/src/lib/initFirebase'
import {useRouter} from 'next/router'
import errorMsg from '@/src/lib/errorMsg'
import Loading from '@/src/components/loading'

export default (props) => {
    const router = useRouter()
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        (async() => {
            // クライアント側の認証を待つ
            const CSRUser = props.CSRUser as firebase.User
            if (!CSRUser) return
            if (!loading) return
            sendEmail(CSRUser)
        })()
    })

    const sendEmail = async (CSRUser: firebase.User) => {
        try {
            await CSRUser.sendEmailVerification()
            setLoading(false)
            setMsg('登録されたメールアドレスに認証用メールを送信しました。')
        } catch (e) {
            console.log(e)
            setLoading(false)
            setMsg(errorMsg(e))
        }
        setTimeout(async() => {
            await (await initFirebase()).firebase.auth().signOut()
            router.push('/login')
        }, 5000)
    }

    if (loading) return <Loading/>
    return (
    <h4>{msg}</h4>
    )
}