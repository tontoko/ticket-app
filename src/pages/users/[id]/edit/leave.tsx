import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Row } from 'reactstrap'
import errorMsg from '@/src/lib/errorMsg'
import { useAlert } from "react-alert"
import Link from 'next/link'
import { firebase, auth } from '@/src/lib/initFirebase'
import withAuth from '@/src/lib/withAuth'

export const Leave = ({user}) => {
  const alert = useAlert()
  const [checkBox, setCheckBox] = useState(false)
  const [pwd, setPwd] = useState('')

  const submit = async (e) => {
    e.preventDefault();
    if (!checkBox) return alert.error('チェックボックスが選択されていません。')
    const { providerData } = user as firebase.User
    try {
        if (providerData[0].providerId === "password") {
          const credencial: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            pwd
          );
          await user.reauthenticateWithCredential(credencial);
        } else {
          await user.reauthenticateWithPopup(providerData[0]);
        }
        
        await user.delete()
        alert.success('退会処理が完了しました。')
    } catch (e) {
        alert.error(errorMsg(e))
    }
  }
  // TODO: お問い合わせページ作成
  // TODO: 退会条件の設定
  return (
    <Form style={{ marginTop: "6.5em" }} onSubmit={submit}>
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
          />{" "}
          上記の説明と利用規約を確認し、理解しました
        </Label>
      </FormGroup>
      {user.providerData[0].providerId === "password" && (
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
  );
}

export default withAuth(Leave)