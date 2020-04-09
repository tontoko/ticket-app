import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import 'firebase/storage'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import Link from 'next/link'

export const UpdateBankData: React.FC<any> = (props) => {
  const router = useRouter()
  const alert = useAlert()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')

  return (
    <Form style={{ marginTop: "1.5em" }}>
      <h3>口座情報</h3>
      {/* 口座リスト */}

      <FormGroup>
        <Link href="/user/edit/bankData/new">
          <Button>新しい口座を登録</Button>
        </Link>
      </FormGroup>
    </Form>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx)
  return { props: { user } }
}

export default UpdateBankData