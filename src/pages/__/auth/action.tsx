import React, { useState, useEffect } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import Loading from '@/src/components/loading'
import {useRouter} from 'next/router'
import Firebase from 'firebase'
import ResetPassword from './resetPassword'
import { GetServerSideProps } from 'next'
import { encodeQuery } from '@/src/lib/parseQuery'

export default ({user, mode, oobCode}) => {
    const alert = useAlert()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [valid, setValid] = useState(false)
    const [view, setView] = useState(null)

    useEffect(() => {
        (async() => {
            if (!loading) return
            const auth = (await initFirebase()).firebase.auth()
            try {
                switch (mode as string) {
                    case 'resetPassword':
                        // Display reset password handler and UI.
                        handleResetPassword(auth)
                        return
                    case 'recoverEmail':
                        // Display email recovery handler and UI.
                        await handleRecoverEmail(auth)
                        setTimeout(() => redirectAfterUpdate(auth), 5000)
                        return
                    case 'verifyEmail':
                        // Display email verification handler and UI.
                        await handleVerifyEmail(auth)
                        setTimeout(() => redirectAfterUpdate(auth), 5000)
                        return
                    default:
                        // Error: invalid mode.
                        throw new Error("不正なリクエストです。")
                }
            } catch (e) {
                alert.error(errorMsg(e))
                setTimeout(() => redirectAfterUpdate(auth), 5000)
            }
        })()
    }, [])

    const redirectAfterUpdate = async(auth:Firebase.auth.Auth, msg?:string) => {
        if (auth.currentUser) {
            await auth.signOut()
        }
        if (msg) {
            const message = encodeQuery(msg)
            return router.push({ pathname: `/login`, query: { msg: message } }, "/login");
        }
        router.push("/login");
    }

    const handleResetPassword = async (auth:Firebase.auth.Auth) => {
        await auth.verifyPasswordResetCode(oobCode as string)
        setValid(true)
        setView(<ResetPassword confirmResetPassword={confirmResetPassword} />)
        setLoading(false)
    }

    const confirmResetPassword = async (newPwd, newPwdConfirm) => {
        if (newPwd !== newPwdConfirm) return alert.error('確認用パスワードが一致しません。')
        const auth = (await initFirebase()).firebase.auth()
        try {
            await auth.confirmPasswordReset(oobCode as string, newPwd)
            redirectAfterUpdate(auth, '新しいパスワードに更新しました。')
        } catch(e) {
            alert.error(errorMsg(e))
        }
    }

    const handleRecoverEmail = async (auth: Firebase.auth.Auth) => {
        const info = await auth.checkActionCode(oobCode as string)
        const restoredEmail = info['data']['email']
        await auth.applyActionCode(oobCode as string)
        await auth.sendPasswordResetEmail(restoredEmail)
        setView(<h4>メールアドレスを復元しました。パスワードを変更してください。リダイレクトします。</h4>)
        setValid(true)
        setLoading(false)
    }

    const handleVerifyEmail = async (auth: Firebase.auth.Auth) => {
        await auth.applyActionCode(oobCode as string)
        setView(<h4>メールアドレスが認証されました。リダイレクトします。</h4>)
        setValid(true)
        setLoading(false)
    }

    if (loading) {
        return <Loading/>
    }
    return (
        <Form style={{ marginTop: '5em' }}>
            {(() => {
                if (!valid) {
                    return (
                        <>
                            <h4>認証に失敗しました。リダイレクトします。</h4>
                            <div style={{ marginTop: '2em' }}>
                                <a href="/login">ログイン</a>
                            </div>
                        </>
                    )
                }
                return view
            })()}
        </Form>
    )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const {query} = ctx
    const { mode, oobCode } = query
    return {props: {mode,oobCode}}
}