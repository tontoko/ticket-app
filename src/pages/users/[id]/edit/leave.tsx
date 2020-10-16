import React, { useMemo } from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Row } from 'reactstrap'
import errorMsg from '@/src/lib/errorMsg'
import { useAlert } from 'react-alert'
import Link from 'next/link'
import { fuego } from '@nandorojo/swr-firestore'
import withAuth from '@/src/lib/withAuth'
import { GetServerSideProps, NextPage } from 'next'
import { stripeAccounts, stripeBalance } from '@/src/lib/stripeRetrieve'
import { Stripe } from '@/src/lib/stripe'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { event } from 'app'
import moment from 'moment'
import analytics from '@/src/lib/analytics'

export const Leave: NextPage<{
  user: firebase.User
  balance: Stripe.Balance
  canLeave: boolean
}> = ({ user, balance, canLeave }) => {
  const alert = useAlert()
  const [checkBox, setCheckBox] = useState(false)
  const [pwd, setPwd] = useState('')

  const available = useMemo(() => {
    let sum = 0
    balance.available.forEach((balance) => (sum += balance.amount))
    return sum
  }, [balance.available])

  const pending = useMemo(() => {
    let sum = 0
    balance.pending.forEach((balance) => (sum += balance.amount))
    return sum
  }, [balance.pending])

  const submit = async (e) => {
    e.preventDefault()
    if (!checkBox) return alert.error('チェックボックスが選択されていません。')
    if (available || pending) return alert.error('送金待ちの残高が残っています。')
    if (!canLeave) return alert.error('開催イベントの終了から10日間は退会できません。')
    const { providerData } = user
    try {
      if (providerData[0].providerId === 'password') {
        const credencial: firebase.auth.AuthCredential = fuego.auth.EmailAuthProvider.credential(
          user.email,
          pwd,
        )
        await user.reauthenticateWithCredential(credencial)
      } else {
        await user.reauthenticateWithPopup(providerData[0])
      }

      await user.delete()
      alert.success('退会処理が完了しました。')
    } catch (e) {
      ;(await analytics()).logEvent('exception', { description: e.message })
      alert.error(errorMsg(e))
    }
  }

  return (
    <Form style={{ marginTop: '6.5em' }} onSubmit={submit}>
      <h5>本当に退会しますか？</h5>
      <ul>
        <li>削除されたアカウントは復元できません。</li>
        <li>
          決済履歴などの情報は保管されます。詳しくは
          <Link href="/termsOfUse">
            <a>利用規約</a>
          </Link>
          をご確認ください。
        </li>
      </ul>
      <FormGroup check>
        <Label check>
          <Input
            type="checkbox"
            id="checkbox2"
            onChange={(e) => setCheckBox(e.target.checked)}
            checked={checkBox}
          />{' '}
          上記の説明と利用規約を確認し、理解しました
        </Label>
      </FormGroup>
      {user.providerData[0].providerId === 'password' && (
        <FormGroup>
          <Input
            type="password"
            placeholder="パスワードを入力してください"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
        </FormGroup>
      )}
      <Row style={{ margin: 0 }}>
        <Button className="ml-auto">退会する</Button>
      </Row>
    </Form>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query
  const balance = await stripeBalance(id)
  const { firestore } = await initFirebaseAdmin()
  const events = (await firestore.collection('events').where('createdUser', '==', id).get()).docs
  let canLeave = true
  await Promise.all(
    events.map((event) => {
      const endDate = moment((event.data() as event).endDate.toDate())
      if (endDate.add(10, 'days').valueOf() > moment().valueOf()) {
        canLeave = false
      }
    }),
  )
  return {
    props: { balance, canLeave },
    // revalidate: 1
  }
}

export default withAuth(Leave)
