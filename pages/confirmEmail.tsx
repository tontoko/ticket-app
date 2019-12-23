import Link from 'next/link'
import React, {useState, useEffect} from 'react'
import initFirebase from '../initFirebase'
import {useRouter} from 'next/router'

export default () => {
    const router = useRouter()
    const [msg, setMsg] = useState('')

    useEffect(() => {
        (async() => {
            try{
                const firebase = await initFirebase()
                await firebase.auth().currentUser.sendEmailVerification()
                setMsg('登録されたメールアドレスに認証用メールを送信しました。リダイレクトします。')
                await firebase.auth().signOut()
                
            }catch(e) {
                setMsg('エラーが発生しました。')
            }
            setTimeout(async () => {
                router.push('/login')
            }, 5000)
        })()
    })

    return (
    <h4>{msg}</h4>
    )
}