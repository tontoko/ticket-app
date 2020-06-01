import Link from 'next/link'
import React from 'react'
import { Form, FormGroup, Button, Label, Input, Row } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'

export const UserShow: React.FC<any> = ({user}) => {
    return (
        <>
        <h2>ようこそ{user.name && ` ${user.name} さん`}</h2>
        <Form style={{marginTop: "1.5em"}}>
            <h4>登録情報</h4>
            <FormGroup style={{marginTop: "1em"}}>
                <Label for="email">メールアドレス</Label>
                <Input disabled type="email" name="email" id="email" value={user.email} />
            </FormGroup>
            <Row style={{ margin: 0, marginTop: "0.5em" }}>
                <Link href={`/user/edit`}>
                    <Button className="ml-auto">登録情報の編集</Button>
                </Link>
            </Row>
            <Row style={{ margin: 0, marginTop: "2em" }}>
                <Button className="ml-auto" onClick={async() => {
                    const {firebase} = await initFirebase()
                    await firebase.auth().signOut()
                }}>
                    ログアウト
                </Button>
            </Row>
        </Form>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx, 'redirect')
    return { props: { user } }
}

export default UserShow