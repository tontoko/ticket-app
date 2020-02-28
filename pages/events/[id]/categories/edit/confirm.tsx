//todo






import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
  Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, FormFeedback
} from 'reactstrap'

const Confirmation: React.FC = () => {

  const router = useRouter()

  useEffect(() => {
    // ログインしてなければリダイレクト
    if (false) {
      router.push('/login')
    }
    if (ifAgree) {
      setRequire(false)
    }
  })

  const [ifAgree, setIfAgree] = useState(false)
  const [require, setRequire] = useState(false)

  const handleSubmit = () => {
    if (ifAgree) {
      router.push(`/events/${router.query.id}/purchase/checkout`)
    } else {
      setRequire(true)
    }
  }

  const [familyName, setFamilyName] = useState(router.query.familyName)
  const [firstName, setFirstName] = useState(router.query.firstName)
  const [email, setEmail] = useState(router.query.email)

  let agreeCheckBox
  if (require) {
    agreeCheckBox = (
      <FormGroup check style={{ marginRight: '1em' }}>
        <Label check>
          <Input type="checkbox" checked={ifAgree} onChange={() => setIfAgree(!ifAgree)} invalid /> 同意します
                        <FormFeedback>必須項目です</FormFeedback>
        </Label>
      </FormGroup>
    )
  } else {
    agreeCheckBox = (
      <FormGroup check style={{ marginRight: '1em' }}>
        <Label check>
          <Input type="checkbox" checked={ifAgree} onChange={() => setIfAgree(!ifAgree)} /> 同意します
                        <FormFeedback>必須項目です</FormFeedback>
        </Label>
      </FormGroup>
    )
  }

  return (
    <Container>
      <Form style={{ marginTop: '5em' }}>
        <FormGroup>
          <Label>お名前</Label>
          <FormGroup>
            <Label style={{ marginRight: '1em' }}>{familyName}</Label>
            <Label>{firstName}</Label>
          </FormGroup>
        </FormGroup>
        <FormGroup>
          <Label>メールアドレス</Label>
          <FormGroup>
            <Label>{email}</Label>
          </FormGroup>
        </FormGroup>
        <FormGroup>
          <Label>イベント情報</Label>
          <Card>
            <CardBody>
              <Row>
                <Col sm="2" xs="3">
                  <img width="100%" src="https://cdn.pixabay.com/photo/2019/06/21/20/19/grapes-4290308_1280.jpg" alt="Card image cap" />
                </Col>
                <Col xs="auto">
                  <CardTitle>テストイベント</CardTitle>
                  <CardSubtitle>テスト場所</CardSubtitle>
                  <CardText>テスト説明文</CardText>
                </Col>
              </Row>
              <Row className="flex-row-reverse">
                <h4 style={{ marginTop: '1em', marginRight: '1em' }}>テスト金額</h4>
              </Row>
            </CardBody>
          </Card>
        </FormGroup>
        <Row className="flex-row-reverse">
          {agreeCheckBox}
        </Row>
        <Row className="flex-row-reverse">
          <Button style={{ marginRight: '1em', marginTop: '0.5em' }} onClick={handleSubmit} >購入</Button>
        </Row>
      </Form>
    </Container>
  );
}

export default Confirmation