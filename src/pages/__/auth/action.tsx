import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Form } from 'reactstrap'
import { useAlert } from 'react-alert'
import errorMsg from '@/src/lib/errorMsg'
import Loading from '@/src/components/loading'
import { useRouter } from 'next/router'
import ResetPassword from './resetPassword'
import { encodeQuery } from '@/src/lib/parseQuery'
import { fuego } from '@nandorojo/swr-firestore'
import analytics from '@/src/lib/analytics'

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
        ;(await analytics()).logEvent('exception', { description: e.message })
        console.error(e)
        alert.error(errorMsg(e))
        setTimeout(() => redirectAfterUpdate(), 5000)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert, loading, router])

  const redirectAfterUpdate = useCallback(
    async (msg?: string) => {
      if (user) await fuego.auth().signOut()
      if (msg) {
        const message = encodeQuery(msg)
        return router.push({ pathname: `/login`, query: { msg: message } }, '/login')
      }
      router.push('/login')
    },
    [router, user],
  )

  const handleResetPassword = useCallback(async () => {
    await fuego.auth().verifyPasswordResetCode(oobCode.current)
    setValid(true)
    setView(<ResetPassword confirmResetPassword={confirmResetPassword} />)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const confirmResetPassword = useCallback(
    async (newPwd, newPwdConfirm) => {
      if (newPwd !== newPwdConfirm) return alert.error('確認用パスワードが一致しません。')
      try {
        await fuego.auth().confirmPasswordReset(oobCode.current, newPwd)
        redirectAfterUpdate('新しいパスワードに更新しました。')
      } catch (e) {
        ;(await analytics()).logEvent('exception', { description: e.message })
        alert.error(errorMsg(e))
      }
    },
    [alert, redirectAfterUpdate],
  )

  const handleRecoverEmail = useCallback(async () => {
    const info = await fuego.auth().checkActionCode(oobCode.current)
    const restoredEmail = info['data']['email']
    await fuego.auth().applyActionCode(oobCode.current)
    await fuego.auth().sendPasswordResetEmail(restoredEmail)
    setView(
      <h4>メールアドレスを復元しました。パスワードを変更してください。リダイレクトします。</h4>,
    )
    setValid(true)
    setLoading(false)
  }, [])

  const handleVerifyEmail = useCallback(async () => {
    await fuego.auth().applyActionCode(oobCode.current)
    setView(<h4>メールアドレスが認証されました。リダイレクトします。</h4>)
    setValid(true)
    setLoading(false)
  }, [])

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
