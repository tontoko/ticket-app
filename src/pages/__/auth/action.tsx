import React, { useState, useEffect, useRef } from 'react'
import { Form } from 'reactstrap'
import { useAlert } from 'react-alert'
import errorMsg from '@/src/lib/errorMsg'
import Loading from '@/src/components/loading'
import { useRouter } from 'next/router'
import ResetPassword from './resetPassword'
import { encodeQuery } from '@/src/lib/parseQuery'
import { fuego } from '@nandorojo/swr-firestore'

const Action = ({ user }) => {
  const alert = useAlert()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [valid, setValid] = useState(false)
  const [view, setView] = useState(null)
  const mode = useRef('')
  const oobCode = useRef('')

  useEffect(() => {
    ;(async () => {
      if (!loading || !router || !router.query.mode) return
      mode.current = router.query.mode as string
      oobCode.current = router.query.oobCode as string
      try {
        switch (router.query.mode) {
          case 'resetPassword':
            // Display reset password handler and UI.
            handleResetPassword()
            return
          case 'recoverEmail':
            // Display email recovery handler and UI.
            await handleRecoverEmail()
            setTimeout(() => redirectAfterUpdate(), 5000)
            return
          case 'verifyEmail':
            // Display email verification handler and UI.
            await handleVerifyEmail()
            setTimeout(() => redirectAfterUpdate(), 5000)
            return
          default:
            // Error: invalid mode.
            throw new Error('不正なリクエストです。')
        }
      } catch (e) {
        console.error(e)
        alert.error(errorMsg(e))
        setTimeout(() => redirectAfterUpdate(), 5000)
      }
    })()
  }, [router])

  const redirectAfterUpdate = async (msg?: string) => {
    if (user) await fuego.auth().signOut()
    if (msg) {
      const message = encodeQuery(msg)
      return router.push({ pathname: `/login`, query: { msg: message } }, '/login')
    }
    router.push('/login')
  }

  const handleResetPassword = async () => {
    await fuego.auth().verifyPasswordResetCode(oobCode.current)
    setValid(true)
    setView(<ResetPassword confirmResetPassword={confirmResetPassword} />)
    setLoading(false)
  }

  const confirmResetPassword = async (newPwd, newPwdConfirm) => {
    if (newPwd !== newPwdConfirm) return alert.error('確認用パスワードが一致しません。')
    try {
      await fuego.auth().confirmPasswordReset(oobCode.current, newPwd)
      redirectAfterUpdate('新しいパスワードに更新しました。')
    } catch (e) {
      alert.error(errorMsg(e))
    }
  }

  const handleRecoverEmail = async () => {
    const info = await fuego.auth().checkActionCode(oobCode.current)
    const restoredEmail = info['data']['email']
    await fuego.auth().applyActionCode(oobCode.current)
    await fuego.auth().sendPasswordResetEmail(restoredEmail)
    setView(
      <h4>メールアドレスを復元しました。パスワードを変更してください。リダイレクトします。</h4>,
    )
    setValid(true)
    setLoading(false)
  }

  const handleVerifyEmail = async () => {
    await fuego.auth().applyActionCode(oobCode.current)
    setView(<h4>メールアドレスが認証されました。リダイレクトします。</h4>)
    setValid(true)
    setLoading(false)
  }

  if (loading) return <Loading />

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

export default Action
