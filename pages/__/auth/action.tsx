import React, { useState, useEffect } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'
import initFirebase from '../../../initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '../../../lib/errorMsg'
import Loading from '../../../components/loading'
import {useRouter} from 'next/router'
import Firebase from 'firebase'
import ResetPassword from './resetPassword'

interface props {
    user: Firebase.User
}

export default (props:props) => {
    const alert = useAlert()
    const router = useRouter()
    const { mode, oobCode } = router.query
    const [loading, setLoading] = useState(true)
    const [valid, setValid] = useState(false)
    const [view, setView] = useState(null)

    useEffect(() => {
        (async() => {
            try {
                manageMode()
            } catch(e) {
                setLoading(false)
                setTimeout(() => {
                    window.location.href = '/login'
                }, 5000)
            }
        })()
    })

    const manageMode = async () => {
        // await firebase.auth().checkActionCode(oobCode as string)
        const auth = (await initFirebase()).auth()
        switch (mode as string) {
            case 'resetPassword':
                // Display reset password handler and UI.
                await handleResetPassword(auth);
                break;
            case 'recoverEmail':
                // Display email recovery handler and UI.
                await handleRecoverEmail(auth);
                break;
            case 'verifyEmail':
                // Display email verification handler and UI.
                await handleVerifyEmail(auth);
                break;
            default:
                // Error: invalid mode.
                throw new Error("不正なリクエストです。")
        }
        await auth.currentUser.reload()
        const token = await auth.currentUser.getIdToken()
        await fetch('/api/login', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Cache-Control': 'private'
            }),
            credentials: 'same-origin',
            body: JSON.stringify({
                token
            })
        })
        const pathname = props.user ? `/users/${props.user.uid}/edit` : '/login'
        setTimeout(() => {
            router.push({ pathname, query: { msg: mode } })
        }, 5000)
    } 

    const handleResetPassword = async (auth:Firebase.auth.Auth) => {
        try {
            auth.verifyPasswordResetCode(oobCode as string)
            setValid(true)
            setView(<ResetPassword confirmResetPassword={confirmResetPassword} />)
            setLoading(false)
        }catch(e) {
            throw new Error("エラーが発生しました。")
        }
    }

    const confirmResetPassword = async (newPwd, newPwdConfirm) => {
        if (newPwd !== newPwdConfirm) return alert.error('確認用パスワードが一致しません。')
        const auth = (await initFirebase()).auth()
        try {
            await auth.confirmPasswordReset(oobCode as string, newPwd)
        } catch(e) {
            alert.error(errorMsg(e))
        }
    }

    const handleRecoverEmail = async (auth: Firebase.auth.Auth) => {
        try {
            const info = await auth.checkActionCode(oobCode as string)
            const restoredEmail = info['data']['email']
            await auth.applyActionCode(oobCode as string)
            await auth.sendPasswordResetEmail(restoredEmail)
            setView(<h4>メールアドレスを復元しました。パスワードを変更してください。リダイレクトします。</h4>)
            setValid(true)
            setLoading(false)
        } catch(e) {
            throw new Error("エラーが発生しました。")
        }
    }

    const handleVerifyEmail = async (auth: Firebase.auth.Auth) => {
        try {
            await auth.applyActionCode(oobCode as string)
            setView(<h4>メールアドレスが認証されました。リダイレクトします。</h4>)
            setValid(true)
            setLoading(false)
        }catch(e) {
            throw new Error("エラーが発生しました。")
        }
    }

    if (loading) {
        return <Loading/>
    }
    return (
        <Container>
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
        </Container>
    )
}