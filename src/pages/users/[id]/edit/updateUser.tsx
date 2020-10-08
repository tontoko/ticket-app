import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { Form, FormGroup, Button, Label, Input, Row, Col } from 'reactstrap'
import 'firebase/storage'
import { useAlert } from 'react-alert'
import DatePicker, { registerLocale } from 'react-datepicker'
import ja from 'date-fns/locale/ja'
registerLocale('ja', ja)
import moment, { Moment } from 'moment'
import { toUtcIso8601str } from '@/src/lib/time'
import Stripe from 'stripe'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons'
import { encodeQuery } from '@/src/lib/parseQuery'
import withAuth from '@/src/lib/withAuth'
import { fuego } from '@nandorojo/swr-firestore'
import Loading from '@/src/components/loading'

export const UpdateUser = ({ user }) => {
  const alert = useAlert()
  const router = useRouter()
  const [tosAcceptance, setTosAcceptance] = useState<Stripe.Account.TosAcceptance>()
  const [form, setForm] = useState({
    first_name_kana: '',
    last_name_kana: '',
    first_name_kanji: '',
    last_name_kanji: '',
    dob: {
      day: moment().day(),
      month: moment().month(),
      year: moment().year(),
    },
    address_kana: {
      country: 'JP',
      postal_code: '',
      state: '',
      city: '',
      town: '',
      line1: '',
      line2: '',
    },
    address_kanji: {
      country: 'JP',
      postal_code: '',
      state: '',
      city: '',
      town: '',
      line1: '',
      line2: '',
    },
    gender: 'male',
  })
  const [birthDay, setBirthDay] = useState(toUtcIso8601str(moment()))
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(true)
  let isNew = true

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const res = await fetch('/api/stripeAccountsRetrieve', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ uid: user.uid }),
      })
      const { individual, tos_acceptance } = await res.json()
      if (individual) {
        isNew = false
        setForm(individual)
      }
      tos_acceptance && setTosAcceptance(tos_acceptance)
      setLoading(false)
    })()
  }, [user])

  const setFormBirthDay = (moment: Moment) => {
    setBirthDay(toUtcIso8601str(moment))
    const day = moment.day()
    const month = moment.month()
    const year = moment.year()
    setForm({ ...form, dob: { day, month, year } })
  }

  const submit = async (e) => {
    e.preventDefault()
    const needParams: string[] = []
    for (const [key1, value1] of Object.entries(form)) {
      if (typeof value1 !== 'string' && (key1 === 'address_kana' || key1 === 'address_kanji')) {
        // 入れ子2段目の判定
        for (const [key2, value2] of Object.entries(value1)) {
          if (key2 !== 'line2' && !value2) needParams.push(key2)
        }
      } else {
        if (key1 !== 'line2' && !value1) needParams.push(key1)
      }
    }
    if (needParams.length > 0) return alert.error('項目に入力漏れがあります。')
    if (!agree && !tosAcceptance.date) return alert.error('同意します がチェックされていません。')
    const token = await user.getIdToken()
    const res = await fetch('/api/updateUser', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      credentials: 'same-origin',
      body: JSON.stringify({
        token,
        ...form,
      }),
    })
    if (res.status !== 200)
      return alert.error('エラーが発生しました。しばらくして再度お試しください。')

    if (isNew)
      return router.push({
        pathname: `/users/${user.uid}/edit/identification`,
        query: {
          msg: encodeQuery('ユーザー情報を更新しました。引き続き本人確認書類を提出してください。'),
        },
      })

    return router.push({
      pathname: `/users/${user.uid}/edit`,
      query: { msg: encodeQuery('ユーザー情報を更新しました。') },
    })
  }

  const searchZipCode = async () => {
    try {
      const zip = form.address_kanji.postal_code
      if (!zip) return
      const token = await user.getIdToken()
      const res = await fetch('/api/searchZipCode', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        credentials: 'same-origin',
        body: JSON.stringify({
          token,
          zip,
        }),
      })
      const { address } = await res.json()
      setForm({
        ...form,
        address_kanji: {
          ...form.address_kanji,
          state: address[3].long_name,
          city: address[2].long_name,
          town: address[1].long_name,
        },
      })
    } catch (e) {
      alert.error('エラーが発生しました。入力項目が正しいか確認してください。')
      alert.error(e.message)
    }
  }

  if (loading) return <Loading />

  return (
    <Form style={{ marginTop: '1.5em' }} onSubmit={submit}>
      <h3>ユーザー情報</h3>
      <p>決済に必要な情報を入力してください。</p>
      <FormGroup>
        <Row form>
          <Col md="4">
            <Label>性 (漢字)</Label>
            <Input
              value={form.first_name_kanji}
              onChange={(e) => setForm({ ...form, first_name_kanji: e.target.value })}
            />
          </Col>
          <Col md="4">
            <Label>名 (漢字)</Label>
            <Input
              value={form.last_name_kanji}
              onChange={(e) => setForm({ ...form, last_name_kanji: e.target.value })}
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row form>
          <Col md="4">
            <Label>性 (カナ)</Label>
            <Input
              value={form.first_name_kana}
              onChange={(e) => setForm({ ...form, first_name_kana: e.target.value })}
            />
          </Col>
          <Col md="4">
            <Label>名 (カナ)</Label>
            <Input
              value={form.last_name_kana}
              onChange={(e) => setForm({ ...form, last_name_kana: e.target.value })}
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Label>性別</Label>
        <Col>
          <Input
            id="male"
            name="gender"
            type="radio"
            value="male"
            checked={form.gender === 'male'}
            onChange={() => setForm({ ...form, gender: 'male' })}
          />
          <Label for="male">男性</Label>
        </Col>
        <Col>
          <Input
            id="female"
            name="gender"
            type="radio"
            value="female"
            checked={form.gender === 'female'}
            onChange={() => setForm({ ...form, gender: 'female' })}
          />
          <Label for="female">女性</Label>
        </Col>
      </FormGroup>
      <FormGroup>
        <Label>誕生日(13才以上)</Label>
        <div>
          <DatePicker
            locale="ja"
            selected={moment(birthDay).toDate()}
            maxDate={new Date()}
            onChange={(selectedDate: Date) => setFormBirthDay(moment(selectedDate))}
            dateFormat="yyyy年 M月d日"
            showYearDropdown
            yearDropdownItemNumber={110}
            scrollableYearDropdown
          />
        </div>
      </FormGroup>

      <FormGroup>
        <Label>郵便番号</Label>
        <Row form>
          <Col sm="4">
            <Input
              value={form.address_kana.postal_code}
              onChange={(e) =>
                setForm({
                  ...form,
                  address_kana: { ...form.address_kana, postal_code: e.target.value },
                  address_kanji: { ...form.address_kanji, postal_code: e.target.value },
                })
              }
            />
          </Col>
          <Col sm="4">
            <Button type="button" onClick={searchZipCode}>
              郵便番号検索
            </Button>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Label>住所（カナ）</Label>
        <FormGroup>
          <Input
            placeholder="都道府県（カナ）"
            value={form.address_kana.state}
            onChange={(e) =>
              setForm({ ...form, address_kana: { ...form.address_kana, state: e.target.value } })
            }
          />
          <Input
            placeholder="区市町村（カナ）"
            value={form.address_kana.city}
            onChange={(e) =>
              setForm({ ...form, address_kana: { ...form.address_kana, city: e.target.value } })
            }
          />
          <Input
            placeholder="町名(丁目まで、カナ)"
            value={form.address_kana.town}
            onChange={(e) =>
              setForm({ ...form, address_kana: { ...form.address_kana, town: e.target.value } })
            }
          />
          <Input
            placeholder="番地、号（カナ）"
            value={form.address_kana.line1}
            onChange={(e) =>
              setForm({ ...form, address_kana: { ...form.address_kana, line1: e.target.value } })
            }
          />
          <Input
            placeholder="建物・部屋番号・その他 (任意、カナ)"
            value={form.address_kana.line2 ? form.address_kana.line2 : ''}
            onChange={(e) =>
              setForm({ ...form, address_kana: { ...form.address_kana, line2: e.target.value } })
            }
          />
        </FormGroup>

        <FormGroup>
          <Label>住所（漢字）</Label>
          <Input
            placeholder="都道府県（漢字）"
            value={form.address_kanji.state}
            onChange={(e) =>
              setForm({ ...form, address_kanji: { ...form.address_kanji, state: e.target.value } })
            }
          />
          <Input
            placeholder="区市町村（漢字）"
            value={form.address_kanji.city}
            onChange={(e) =>
              setForm({ ...form, address_kanji: { ...form.address_kanji, city: e.target.value } })
            }
          />
          <Input
            placeholder="町名(丁目まで、漢字)"
            value={form.address_kanji.town}
            onChange={(e) =>
              setForm({ ...form, address_kanji: { ...form.address_kanji, town: e.target.value } })
            }
          />
          <Input
            placeholder="番地、号（漢字）"
            value={form.address_kanji.line1}
            onChange={(e) =>
              setForm({ ...form, address_kanji: { ...form.address_kanji, line1: e.target.value } })
            }
          />
          <Input
            placeholder="建物・部屋番号・その他 (任意、漢字)"
            value={form.address_kanji.line2 ? form.address_kanji.line2 : ''}
            onChange={(e) =>
              setForm({ ...form, address_kanji: { ...form.address_kanji, line2: e.target.value } })
            }
          />
        </FormGroup>
      </FormGroup>

      {(() => {
        if (tosAcceptance && !tosAcceptance.date) {
          return (
            <>
              <FormGroup check style={{ marginTop: '2em', marginBottom: 0 }}>
                <Row form>
                  <Label className="ml-auto" check for="agree">
                    <Input
                      id="agree"
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                    />
                    利用規約を確認し、同意します
                  </Label>
                </Row>
              </FormGroup>
            </>
          )
        } else {
          return (
            <>
              <FormGroup style={{ marginTop: '2em', marginBottom: 0 }}>
                <Label>決済に関する同意事項</Label>
              </FormGroup>
              <FormGroup>
                <p style={{ marginLeft: '1em' }}>
                  <FontAwesomeIcon icon={faCheckSquare} style={{ color: '#00DD00' }} /> 同意済み
                </p>
              </FormGroup>
            </>
          )
        }
      })()}
      <Row form style={{ marginTop: '2em' }}>
        <Button className="ml-auto">更新</Button>
      </Row>
    </Form>
  )
}

export default withAuth(UpdateUser)
