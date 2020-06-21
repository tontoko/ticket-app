import React, { useState } from 'react';
import {
  Button, Container, Col, Row, Form, Input, FormGroup, Label, InputGroup
} from 'reactstrap';
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import { useAlert } from 'react-alert';

export default () => {
  const router = useRouter()
  const alert = useAlert()
  type select = '' | 'mistake' | 'fraud' | "sys_failure" | "other"
  type problem = '' | 'event' | 'system'
  const [select, setSelect] = useState('' as select)
  const [problem, setProblem] = useState('' as problem)
  const [fraudText, setFraudText] = useState('')
  const [otherText, setOtherText] = useState('')
  
  const submit = async e => {
    e.preventDefault()
    switch (select) {
      case 'mistake':
        alert.error('購入したチケットは購入者に責任がない場合を除き返金できません。詳しくは利用規約をご確認ください。')
        break;
      case 'fraud':
        if (!fraudText) return alert.error('詳細を記入してください')
        break;
      case 'other':
        if (!problem) return alert.error('選択肢から選択してください')
        if (!otherText) return alert.error('詳細を記入してください')
        break;
      default:
        alert.error('返金理由を選択してください')
        break;
    }
  }

  return (
    <Form style={{ marginTop: "2em" }} onSubmit={submit} >
      <FormGroup>
        <h4>返金申請</h4>
        <p>返金理由を選択してください</p>
        <Input type="select" value={select} onChange={e => setSelect(e.target.value as select)}>
          <option value="">選択してください</option>
          <option value="mistake">間違ったチケットを購入してしまった</option>
          <option value="fraud">実際のイベント内容が記載内容と大きく異なった</option>
          <option value="other">その他</option>
        </Input>
      </FormGroup>
      {select === 'fraud' &&
        <FormGroup>
          <Input type="textarea" placeholder="詳細を記入してください" value={fraudText} onChange={e => setFraudText(e.target.value)} />
        </FormGroup>
      }
      {select === 'other' &&
        <>
        <FormGroup>
          <Label>問題はどこで発生していますか？</Label>
          <Input type="select" value={problem} onChange={e => setProblem(e.target.value as problem)}>
            <option value="">選択してください</option>
            <option value="event">このイベントについて</option>
            <option value="system">バグ・その他</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Input type="textarea" placeholder="詳細を記入してください" value={otherText} onChange={e => setOtherText(e.target.value)} />
        </FormGroup>
        </>
      }
      <Row form>
        <Button className="ml-auto">送信</Button>
      </Row>
    </Form>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx, 'redirect')
  return { props: { user } }
}