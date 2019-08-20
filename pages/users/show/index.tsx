import Link from 'next/link'
import React from 'react'
import {useState} from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, FormText } from 'reactstrap'


export const UserShow: React.FC = () => {

    return (
        <Container>
            <Form>
                <h2>登録情報</h2>
                <FormGroup>
                    <Label for="email">メールアドレス</Label>
                    <Input type="email" name="email" id="email" />
                </FormGroup>
                <FormGroup>
                    <Label for="password">パスワード</Label>
                    <Input type="password" name="password" id="password" />
                </FormGroup>
                <FormGroup>
                    <Label for="password_confirm">パスワード確認</Label>
                    <Input type="password" name="password_confirm" id="password_confirm" />
                </FormGroup>
                <FormGroup>
                    <Label>連携済みサービス</Label>
                    
                </FormGroup>
                <FormGroup>
                    <Label for="image">プロフィール画像を選択</Label>
                    <Input type="file" name="image" id="image" />
                </FormGroup>
                <Button>Submit</Button>
            </Form>
        </Container>
    )
}

export default UserShow