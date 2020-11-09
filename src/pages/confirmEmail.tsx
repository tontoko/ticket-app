import React, { useState, useEffect } from 'react'
import errorMsg from '@/src/lib/errorMsg'
import Loading from '@/src/components/loading'
import { fuego } from '@nandorojo/swr-firestore'
import { NextPage } from 'next'
import analytics from '../lib/analytics'

const ConfirmEmail: NextPage<{ user: firebase.default.User }> = ({ user }) => {
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      if (!user || !loading) return
      try {
        await user.sendEmailVerification()
        setLoading(false)
        setMsg('登録されたメールアドレスに認証用メールを送信しました。')
      } catch (e) {
        ;(await analytics()).logEvent('exception', { description: e.message })
        console.log(e)
        setLoading(false)
        setMsg(errorMsg(e))
      }
      setTimeout(() => fuego.auth().signOut(), 5000)
    })()
  }, [])

  if (loading) return <Loading />
  return <h4>{msg}</h4>
}

export default ConfirmEmail
