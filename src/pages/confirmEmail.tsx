import React, { useState, useEffect, useCallback } from 'react'
import errorMsg from '@/src/lib/errorMsg'
import Loading from '@/src/components/loading'
import { fuego } from '@nandorojo/swr-firestore'

const ConfirmEmail = ({ user }) => {
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (!user || !loading || sent) return
      setSent(true)
      sendEmail()
    })()
  }, [user])

  const sendEmail = useCallback(async () => {
    try {
      await user.sendEmailVerification()
      setLoading(false)
      setMsg('登録されたメールアドレスに認証用メールを送信しました。')
    } catch (e) {
      console.log(e)
      setLoading(false)
      setMsg(errorMsg(e))
    }
    setTimeout(async () => {
      fuego.auth().signOut()
    }, 5000)
  }, [])

  if (loading) return <Loading />
  return <h4>{msg}</h4>
}

export default ConfirmEmail
