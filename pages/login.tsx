import Link from 'next/link'
import React from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'

export const Login: React.FC = (props) => {

    return (
        <Container>
            <Form style={{marginTop: '5em'}}>
                <FormGroup>
                    <Label>メールアドレス</Label>
                    <Input type="email" name="email" placeholder="メールアドレス" />
                </FormGroup>
                <FormGroup>
                    <Label>パスワード</Label>
                    <Input type="password" name="password" placeholder="パスワード" />
                </FormGroup>
                <Button>ログイン</Button>
            </Form>
            <Link href="/register"><a>ユーザー登録</a></Link>
        </Container>
    );
}

export default Login