import React, { useState, Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Row } from 'reactstrap'

import { useAlert } from 'react-alert'
import { useRouter } from 'next/router'
import { encodeQuery } from '@/src/lib/parseQuery'

import withAuth from '@/src/lib/withAuth'

const Identification = ({ user }) => {
  const alert = useAlert()
  const router = useRouter()

  const [file1, setFile1]: [File, Dispatch<SetStateAction<File>>] = useState()
  const [file2, setFile2]: [File, Dispatch<SetStateAction<File>>] = useState()

  const submit = async (e) => {
    e.preventDefault()

    if (!file1) return alert.error('画像を添付してください')
    const token = await user.getIdToken()
    const formData = new FormData()
    formData.append('file1', file1)
    formData.append('file2', file2)
    formData.append('token', token)
    const res = await fetch('/api/identification', {
      method: 'POST',
      credentials: 'same-origin',
      body: formData,
    })
    if (res.status === 200) {
      router.push({
        pathname: `/users/${user.uid}/edit/organizer`,
        query: {
          msg: encodeQuery(
            '本人確認書類のアップロードに成功しました。確認が完了するまで数日掛かる可能性があります。',
          ),
        },
      })
    }
  }

  return (
    <Form onSubmit={submit}>
      <h4>本人確認書類のアップロード</h4>
      <FormGroup style={{ marginTop: '1.5em' }}>
        <p>有効な身分証明書：</p>
        <ul>
          <li>パスポート</li>
          <li>運転免許証(両面)</li>
          <li>在留カード・特別永住者証明書</li>
          <li>マイナンバーカード (顔写真付き)</li>
          <li>住民基本台帳カード (顔写真付き)/住基カード (顔写真付き)</li>
        </ul>
        <p>ファイル準備の際には、以下の点にご注意ください：</p>
        <ul>
          <li>ファイル形式が JPEG または PNG であること</li>
          <li>身分証全体のカラー画像であること</li>
          <li>ピントが合っていて記載内容が判別できること</li>
          <li>撮影時にフラッシュを使用しない</li>
        </ul>
        <FormGroup style={{ marginTop: '1.5em' }}>
          <Label>表面</Label>
          <Input
            type="file"
            name="file1"
            accept="image/jpeg, image/png"
            style={{
              border: '1px solid gray',
              padding: '0.5em',
              borderRadius: '0.3em',
            }}
            onChange={(e) => setFile1(e.target.files[0])}
          />
        </FormGroup>
        <FormGroup>
          <Label>裏面</Label>
          <Input
            type="file"
            name="file2"
            accept="image/jpeg, image/png"
            style={{
              border: '1px solid gray',
              padding: '0.5em',
              borderRadius: '0.3em',
            }}
            onChange={(e) => setFile2(e.target.files[0])}
          />
        </FormGroup>
        <Row form style={{ margin: 0, marginTop: '2em' }}>
          <Button className="ml-auto">提出する</Button>
        </Row>
      </FormGroup>
    </Form>
  )
}

export default withAuth(Identification)
