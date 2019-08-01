import Link from 'next/link'
import React from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'

export default () => {
    return (
        <Container>
            <Form style={{ marginTop: '5em' }}>
                <FormGroup>
                    <Label>メールアドレス</Label>
                    <Input type="email" name="email" placeholder="メールアドレス" />
                </FormGroup>
                <FormGroup>
                    <Label>パスワード</Label>
                    <Input type="password" name="password" placeholder="パスワード" />
                    <Input type="password" name="password_confirmation" placeholder="パスワード再入力" style={{ marginTop: '0.7em' }} />
                </FormGroup>
                <Button>登録</Button>
            </Form>
            <Link href="/login"><a>ログイン</a></Link>
        </Container>
    )
}