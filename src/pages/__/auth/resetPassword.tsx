import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { Form, FormGroup, Button, Label, Input, Container } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import Loading from '@/src/components/loading'
import { useRouter } from 'next/router'
import Firebase from 'firebase'
import ResetPassword from './resetPassword'

interface props {
  confirmResetPassword: (newPwd:string, newPwdConfirm:string) => void
}

export default (props: props) => {
  const [newPwd, setNewPwd] = useState('')
  const [newPwdConfirm, setNewPwdConfirm] = useState('') 

  return (
      <>
        <FormGroup>
          <Label for="password">新しいパスワード</Label>
          <Input type="password" name="password" id="password" onChange={e => setNewPwd(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label for="password_confirm">パスワード確認</Label>
          <Input type="password" name="password_confirm" id="password_confirm" onChange={e => setNewPwdConfirm(e.target.value)} />
        </FormGroup>
      <Button className="ml-auto" onClick={() => props.confirmResetPassword(newPwd, newPwdConfirm)}>変更</Button>
      </>
  )
}