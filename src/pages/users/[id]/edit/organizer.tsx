import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { FormGroup, Label } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { NextPage } from 'next'
import withAuth from '@/src/lib/withAuth'
import { Stripe } from '@/src/lib/stripe'
import Loading from '@/src/components/loading'

const Organizer: NextPage<{
  user: firebase.default.User
}> = ({ user }) => {
  const [state, setState] = useState<{ status: string; balance: Stripe.Balance }>()

  const available = useMemo(() => {
    let sum = 0
    state?.balance.available.forEach((balance) => (sum += balance.amount))
    return sum
  }, [state?.balance.available])

  const pending = useMemo(() => {
    let sum = 0
    state?.balance.pending.forEach((balance) => (sum += balance.amount))
    return sum
  }, [state?.balance.pending])

  useEffect(() => {
    ;(async () => {
      const { individual } = (await (
        await fetch('/api/stripeAccountsRetrieve', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ uid: user.uid }),
        })
      ).json()) as Stripe.Account
      const { balance } = (await (
        await fetch('/api/stripeBalanceRetrieve', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ uid: user.uid }),
        })
      ).json()) as { balance: Stripe.Balance }
      const verification = individual ? individual.verification : null
      const status = verification && verification.status
      console.log(verification)
      setState({ status, balance })
    })()
  }, [user.uid])

  if (!state) return <Loading />

  return (
    <div style={{ marginTop: '1.5em', marginBottom: '1.5em' }}>
      <h4>イベント主催者用管理画面</h4>
      <Label>イベントを開催するには、ユーザー情報と本人確認書類を登録する必要があります。</Label>
      <FormGroup style={{ marginTop: '1.5em' }}>
        <Link href={`/users/${user.uid}/edit/updateUser`}>
          <a>ユーザー情報を追加・修正する</a>
        </Link>
      </FormGroup>
      <FormGroup>
        {(() => {
          if (state?.status === 'unverified')
            return (
              <p>
                本人確認書類:
                <Link href={`/users/${user.uid}/edit/identification`}>
                  <a>
                    <FontAwesomeIcon
                      icon={faExclamationCircle}
                      style={{ color: 'red', marginLeft: '0.5em' }}
                    />{' '}
                    提出が必要です。提出しない場合、銀行口座への出金が行えない場合があります。
                  </a>
                </Link>
              </p>
            )
          if (state?.status === 'pending') return <p>本人確認書類: 確認中</p>
          if (state?.status === 'verified')
            return (
              <p>
                本人確認書類:{' '}
                <FontAwesomeIcon
                  icon={faCheckSquare}
                  style={{ color: '#00DD00', marginLeft: '0.5em' }}
                />{' '}
                確認済
              </p>
            )
        })()}
      </FormGroup>
      <FormGroup style={{ marginBottom: '1em' }}>
        <Link href={`/users/${user.uid}/bankAccounts`}>
          <a>売上振り込み用 銀行口座を追加・修正する</a>
        </Link>
      </FormGroup>

      <FormGroup style={{ marginTop: '3em', marginBottom: '1.5em' }}>
        <h4>売上と入金</h4>
        <p>
          入金待ち: {available} 円<br />
          暫定売上(確認中): {pending} 円
        </p>
      </FormGroup>
    </div>
  )
}

export default withAuth(Organizer)
