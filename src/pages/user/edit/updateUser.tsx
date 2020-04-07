import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Row, Col } from 'reactstrap'
import initFirebase from '@/src/lib/initFirebase'
import 'firebase/storage'
import { useAlert } from "react-alert"
import errorMsg from '@/src/lib/errorMsg'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import DatePicker, { registerLocale } from "react-datepicker"
import ja from 'date-fns/locale/ja'
registerLocale('ja', ja)
import moment, { Moment } from 'moment'
import { toUtcIso8601str } from '@/src/lib/time'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import admin from 'firebase-admin'

export const UpdateUser: React.FC<any> = ({ user, from }: {user: admin.auth.DecodedIdToken, from: string}) => {
  const router = useRouter()
  const alert = useAlert()
  const [pwd, setPwd] = useState('')
  const [form, setForm] = useState({
    first_name_kana: '',
    last_name_kana: '',
    first_name_kanji: '',
    last_name_kanji: '',
    dob: {
      day: moment().day(),
      month: moment().month(),
      year: moment().year()
    },
    address_kana: {
      postal_code: '',
      state: '',
      city: '',
      town: '',
      line1: '',
      line2: ''
    },
    address_kanji: {
      postal_code: '',
      state: '',
      city: '',
      town: '',
      line1: '',
      line2: ''
    },
    gender: 'male'
  })
  const [birthDay, setBirthDay] = useState(toUtcIso8601str(moment()))

  const setFormBirthDay = (moment: Moment) => {
    setBirthDay(toUtcIso8601str(moment))
    const day = moment.day()
    const month = moment.month()
    const year = moment.year()
    setForm({...form, dob: {day, month, year}})
  }
  
  const submit = async(e) => {
    e.preventDefault()
    switch (from) {
      case '購入導線のアドレス':

        break;
      default:
        const { firebase } = await initFirebase()
        const token = await firebase.auth().currentUser.getIdToken()
        const res = await fetch('/api/updateUser', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json'
          }),
          credentials: 'same-origin',
          body: JSON.stringify({
            token,
            ...form
          })
        })
        if (res.status !== 200) return alert.error('エラーが発生しました。しばらくして再度お試しください。')
        break;
    }
  }

  const searchZipCode = async() => {
    const { firebase } = await initFirebase()
    const token = await firebase.auth().currentUser.getIdToken()
    const res = await fetch('/api/searchZipCode', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      credentials: 'same-origin',
      body: JSON.stringify({
        token,
        zip: form.address_kana.postal_code 
      })
    })
    console.log(await res.json())
  }

  return (
    <Form style={{ marginTop: "1.5em" }} onSubmit={submit}>
      <h3>ユーザー情報</h3>
      <p>請求に使用する情報を入力してください。</p>
      <FormGroup>
        <Label>苗字(漢字)</Label>
        <Input value={form.first_name_kanji} onChange={e => setForm({ ...form, first_name_kanji: e.target.value })} />
      </FormGroup>
      <FormGroup>
        <Label>名前(漢字)</Label>
        <Input value={form.last_name_kanji} onChange={e => setForm({ ...form, last_name_kanji: e.target.value })} />
      </FormGroup>
      <FormGroup style={{ marginTop: '1em' }}>
        <Label>苗字(カナ)</Label>
        <Input value={form.first_name_kana} onChange={e => setForm({ ...form, first_name_kana: e.target.value })} />
      </FormGroup>
      <FormGroup>
        <Label>名前(カナ)</Label>
        <Input value={form.last_name_kana} onChange={e => setForm({ ...form, last_name_kana: e.target.value })} />
      </FormGroup>
      <FormGroup>
        <Label>性別</Label>
        <Col>
          <Input id='male' name='gender' type="radio" value='male' checked={form.gender === 'male'} onChange={() => setForm({...form, gender: 'male'})} /><Label for='male'>男性</Label>
        </Col>
        <Col>
          <Input id='female' name='gender' type="radio" value='female' checked={form.gender === 'female'} onChange={() => setForm({ ...form, gender: 'female' })} /><Label for='female'>女性</Label>
        </Col>
      </FormGroup>
      <FormGroup>
        <Label>誕生日</Label>
        <div>
          <DatePicker
            locale="ja"
            selected={moment(birthDay).toDate()}
            maxDate={new Date()}
            onChange={selectedDate => setFormBirthDay(moment(selectedDate))}
            dateFormat="yyyy年 M月d日"
            showYearDropdown
            yearDropdownItemNumber={110}
            scrollableYearDropdown
          />
        </div>
      </FormGroup>

      <Row form>
        <Col sm="4">
          <FormGroup>
            <Label>郵便番号(ハイフン抜き)</Label>
            <Input type='number' value={form.address_kana.postal_code} onChange={e => setForm({ ...form, address_kana: { ...form.address_kana, postal_code: e.target.value }, address_kanji: { ...form.address_kanji, postal_code: e.target.value }})} />
            <Button type="button" onClick={searchZipCode}>郵便番号検索</Button>
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label>住所（カナ）</Label>
        <FormGroup>
          <Input placeholder='都道府県（カナ）' value={form.address_kana.state} onChange={e => setForm({ ...form, address_kana: { ...form.address_kana, state: e.target.value } })} />
          <Input placeholder='区市町村（カナ）' value={form.address_kana.city} onChange={e => setForm({ ...form, address_kana: { ...form.address_kana, city: e.target.value } })} />
          <Input placeholder='町名(丁目まで、カナ)' value={form.address_kana.town} onChange={e => setForm({ ...form, address_kana: { ...form.address_kana, town: e.target.value } })} />
          <Input placeholder='番地、号（カナ）' value={form.address_kana.line1} onChange={e => setForm({ ...form, address_kana: { ...form.address_kana, line1: e.target.value } })} />
          <Input placeholder='建物・部屋番号・その他 (任意、カナ)' value={form.address_kana.line2} onChange={e => setForm({ ...form, address_kana: { ...form.address_kana, line2: e.target.value } })} />
        </FormGroup>

        <FormGroup>
          <Label>住所（漢字）</Label>
          <Input placeholder='都道府県（漢字）' value={form.address_kanji.state} onChange={e => setForm({ ...form, address_kanji: { ...form.address_kanji, state: e.target.value } })} />
          <Input placeholder='区市町村（漢字）' value={form.address_kanji.city} onChange={e => setForm({ ...form, address_kanji: { ...form.address_kanji, city: e.target.value } })} />
          <Input placeholder='町名(丁目まで、漢字)' value={form.address_kanji.town} onChange={e => setForm({ ...form, address_kanji: { ...form.address_kanji, town: e.target.value } })} />
          <Input placeholder='番地、号（漢字）' value={form.address_kanji.line1} onChange={e => setForm({ ...form, address_kanji: { ...form.address_kanji, line1: e.target.value } })} />
          <Input placeholder='建物・部屋番号・その他 (任意、漢字)' value={form.address_kanji.line2} onChange={e => setForm({ ...form, address_kanji: { ...form.address_kanji, line2: e.target.value } })} />
        </FormGroup>
      </FormGroup>
      
      <Row style={{ margin: 0, marginTop: '2em' }}>
        <Button className="ml-auto">変更</Button>
      </Row>
    </Form>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx)
  const { query } = ctx
  const from = query.from ? query.from : ''
  const { firestore } = await initFirebaseAdmin()
  const userData = (await firestore.collection('users').doc(user.uid).get()).data()
  return { props: { user, from } }
}

export default UpdateUser