import React, { useState } from 'react'
import { FormGroup, Button, Label, Input, Row, Col } from 'reactstrap'

interface Props {
  confirmResetPassword: (newPwd: string, newPwdConfirm: string) => void
}

const ResetPassword = (props: Props) => {
  const [newPwd, setNewPwd] = useState('')
  const [newPwdConfirm, setNewPwdConfirm] = useState('')

  return (
    <Row>
      <Col sm="12" md={{ size: 6, offset: 3 }}>
        <FormGroup>
          <Label for="password">新しいパスワード</Label>
          <Input
            type="password"
            name="password"
            id="password"
            onChange={(e) => setNewPwd(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label for="password_confirm">パスワード確認</Label>
          <Input
            type="password"
            name="password_confirm"
            id="password_confirm"
            onChange={(e) => setNewPwdConfirm(e.target.value)}
          />
        </FormGroup>
        <Button
          className="ml-auto"
          onClick={() => props.confirmResetPassword(newPwd, newPwdConfirm)}
        >
          変更
        </Button>
      </Col>
    </Row>
  )
}

export default ResetPassword
