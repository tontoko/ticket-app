import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'
import initFirebase from '../../../initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '../../../lib/errorMsg'
import Loading from '../../../components/loading'
import {useRouter} from 'next/router'
import Firebase from 'firebase'

interface props {
    user: Firebase.User
}

export default (props:props) => {
    const alert = useAlert()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState('')
    const [valid, setValid] = useState(false)

    const [mode, setMode] = useState('')
    const [code, setCode] = useState('')
    
    const [newPwd, setNewPwd] = useState('')
    const [newPwdConfirm, setNewPwdConfirm] = useState('')    

    useEffect(() => {
        (async() => {
            if(!props.user) {
                setLoading(false)
                setTimeout(() => {
                    router.push('/login')
                }, 5000)
            }
            try {
                const { mode, oobCode } = router.query
                setMode(mode as string)
                setCode(oobCode as string)
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
        switch (mode) {
            case 'resetPassword':
                // Display reset password handler and UI.
                handleResetPassword(auth);
                break;
            case 'recoverEmail':
                // Display email recovery handler and UI.
                handleRecoverEmail(auth);
                break;
            case 'verifyEmail':
                // Display email verification handler and UI.
                handleVerifyEmail(auth);
                break;
            default:
                // Error: invalid mode.
                throw new Error("不正なリクエストです。")
        }
    } 

    const handleResetPassword = async (auth:Firebase.auth.Auth) => {
        try {
            auth.verifyPasswordResetCode(code)
            setValid(true)
            setLoading(false)
        }catch(e) {
            throw new Error("エラーが発生しました。")
        }
    }

    const confirmResetPassword = async() => {
        if (newPwd !== newPwdConfirm) return alert.error('確認用パスワードが一致しません。')
        const auth = (await initFirebase()).auth()
        auth.confirmPasswordReset(code, newPwd).then(function (resp) {
            router.push({pathname: `/users/${props.user.uid}/edit`, query: {msg: mode}})
        }).catch(function (error) {
            alert.error('エラーが発生しました。')
        });
    }

    const handleRecoverEmail = async (auth: Firebase.auth.Auth) => {
        try {
            const info = await auth.checkActionCode(code)
            const restoredEmail = info['data']['email']
            await auth.applyActionCode(code)
            await auth.sendPasswordResetEmail(restoredEmail)
            setMsg("メールアドレスを復元しました。パスワードを変更してください。リダイレクトします。")
            setValid(true)
            setLoading(false)
            setTimeout(() => {
                router.push({pathname: `/users/${props.user.uid}/edit`})
            }, 5000)
        } catch(e) {
            throw new Error("エラーが発生しました。")
        }
    }

    const handleVerifyEmail = async (auth: Firebase.auth.Auth) => {
        try {
            await auth.applyActionCode(code)
            setMsg("メールアドレスが認証されました。リダイレクトします。")
            setValid(true)
            setLoading(false)
            setTimeout(() => {
                router.push({ pathname: `/users/${props.user.uid}/edit`})
            }, 5000)
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
                if (!props.user) {
                    return (
                        <>
                        <h4>ログインしていません。再度ログインしてください。</h4>
                        <div style={{ marginTop: '2em' }}>
                            <a href="/login">ログイン</a>
                        </div>
                        </>
                    )
                } else if (!valid) {
                    return (
                        <>
                        <h4>認証に失敗しました。リダイレクトします。</h4>
                        <div style={{ marginTop: '2em' }}>
                            <a href="/login">ログイン</a>
                        </div>
                        </>
                    )
                } else if (mode === 'resetPassword') {
                    return (
                        <Container>
                            <Form style={{ marginTop: "1.5em" }}>
                                <FormGroup>
                                    <Label for="password">新しいパスワード</Label>
                                    <Input type="password" name="password" id="password" onChange={e => setNewPwd(e.target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="password_confirm">パスワード確認</Label>
                                    <Input type="password" name="password_confirm" id="password_confirm" onChange={e => setNewPwdConfirm(e.target.value)} />
                                </FormGroup>
                                <Button className="ml-auto" onClick={() => confirmResetPassword()}>変更</Button>
                            </Form>
                        </Container>
                    )
                } else {
                    return (
                        <h4>{msg}</h4>
                    )
                }
            })()}
            </Form>
        </Container>
    )
}