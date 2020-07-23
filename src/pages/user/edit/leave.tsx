import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Row } from 'reactstrap'
import errorMsg from '@/src/lib/errorMsg'
import { useAlert } from "react-alert"
import initFirebase from '@/src/lib/initFirebase'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import Link from 'next/link'

export const Leave = ({user}) => {
    const alert = useAlert()
    const [checkBox, setCheckBox] = useState(false)
    const [pwd, setPwd] = useState('')

    const leave = async () => {
        if (!checkBox) return alert.error('チェックボックスが選択されていません。')
        const {firebase} = await initFirebase()
        const auth = firebase.auth()
        const { sign_in_provider } = user.firebase
        try {
            if (sign_in_provider === 'password') {
                const credencial: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, pwd)
                await auth.currentUser.reauthenticateWithCredential(credencial)
            } else { 
                await auth.currentUser.reauthenticateWithPopup(sign_in_provider)
            }
            
            await auth.currentUser.delete()
            alert.success('退会処理が完了しました。')
        } catch (e) {
            alert.error(errorMsg(e))
        }
    }
    // TODO: お問い合わせページ作成
    // TODO: 退会条件の設定
    return (
      <Form style={{ marginTop: "6.5em" }}>
        <h5>本当に退会しますか？</h5>
        <ul>
          <li>削除されたアカウントは復元できません。</li>
          <li>
            決済履歴などの情報は保管されます。詳しくは
            <Link href='/termsOfUse'>
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
        {user.firebase.sign_in_provider === "password" && (
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
          <Button className="ml-auto" onClick={() => leave()}>
            退会する
          </Button>
        </Row>
      </Form>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx, 'redirect')
    return { props: { user } }
}

export default Leave