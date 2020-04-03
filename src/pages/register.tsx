import Link from 'next/link'
import React, { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { useRouter } from 'next/router'

export default () => {
    const alert = useAlert()
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')
    const [pwdConfirm, setPwdConfirm] = useState('')
    const router = useRouter()

    const sendEmail = async () => {
        if (pwd !== pwdConfirm) return alert.error('確認用パスワードが一致していません。')
        const {firebase} = await initFirebase()
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, pwd)
            router.push({ pathname: '/user', query: { msg: 'ログインしました' } }, '/user')
        } catch(e) {
            alert.error(errorMsg(e, 'signup'))
        }
    }

    return (
        <Container>
            <Form style={{ marginTop: '5em' }}>
                <FormGroup>
                    <Label>メールアドレス</Label>
                    <Input type="email" name="email" placeholder="メールアドレス" onChange={e =>setEmail(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>パスワード</Label>
                    <Input type="password" name="password" placeholder="パスワード" onChange={e => setPwd(e.target.value)} />
                    <Input type="password" name="password_confirmation" placeholder="パスワード再入力" style={{ marginTop: '0.7em' }} onChange={e => setPwdConfirm(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    {/* ToDo:サービス名が決まったら修正 */}
                    <Label>
                    このサービスにおける支払処理サービスは、Stripeが提供し、Stripe Connectアカウント契約（Stripe利用規約を含み、総称して「Stripeサービス契約」といいます。）に従うものとします。<br/>
                    このサービスにおける電子チケット取引の継続により、お客様はStripeサービス契約（随時Stripeにより修正されることがあり、その場合には修正されたものを含みます。）に拘束されることに同意するものとします。 <br/>
                    Stripeを通じた支払処理サービスをこのサービスが使用するための条件として、お客様は、このサービスに対してお客様及びお客様の事業に関する正確かつ完全な情報を提供することに同意し、このサービスが当該情報及びStripeが提供する支払処理サービスのお客様による使用に関連する取引情報を共有することを認めるものとします。
                    </Label>
                </FormGroup>
                <Button onClick={() => sendEmail()}>登録</Button>
            </Form>
            <Link href="/login"><a>ログイン</a></Link>
        </Container>
    )
}