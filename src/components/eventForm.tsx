import React, { useState } from 'react'
import { Button, Col, Row, Form, Input, FormGroup, Label } from 'reactstrap'
import DatePicker, { registerLocale } from 'react-datepicker'
import ja from 'date-fns/locale/ja'
registerLocale('ja', ja)
import moment from 'moment'
import { toUtcIso8601str } from '@/src/lib/time'
import { useAlert } from 'react-alert'
import previewEvent from '@/src/lib/previewEvent'
import { useRouter } from 'next/router'
import { encodeQuery } from '@/src/lib/parseQuery'
import errorMsg from '@/src/lib/errorMsg'
import storage from '../lib/storage'
import { useDocument, fuego } from '@nandorojo/swr-firestore'

const EventForm = ({
  user,
  setModal,
  setModalInner,
  photoUrls,
  loading,
  setLoading,
  mode,
  event,
}) => {
  const router = useRouter()
  const alert = useAlert()
  const { update } = useDocument(router && `events/${router.query.id as string}`)

  if (mode === 'new') {
    event = {
      name: '',
      placeName: '',
      eventDetail: '',
      startDate: moment(),
      endDate: moment(),
      photos: [],
    }
    photoUrls = []
  } else if (mode === 'edit') {
    event = {
      ...event,
      startDate: moment(event.startDate * 1000),
      endDate: moment(event.endDate * 1000),
    }
  }

  const [files, setFiles] = useState(['', '', ''])
  const [eventName, setEventName] = useState(event.name)
  const [placeName, setPlaceName] = useState(event.placeName)
  const [eventDetail, setEventDetail] = useState(event.eventDetail)
  const [startDate, setStartDate] = useState(toUtcIso8601str(event.startDate))
  const [endDate, setEndDate] = useState(toUtcIso8601str(event.endDate))

  const changeFiles = async (inputFiles: FileList, i: number) => {
    if (!inputFiles[0]) {
      const cpfiles = [...files]
      cpfiles[i] = ''
      return setFiles(cpfiles)
    }
    const fileReader = new FileReader()
    fileReader.onload = function () {
      const cpfiles = [...files]
      cpfiles[i] = this.result as string
      setFiles(cpfiles)
    }
    fileReader.readAsDataURL(inputFiles[0])
  }

  const submit = (e) => {
    e.preventDefault()
    if (eventName.length == 0 || placeName.length == 0)
      return alert.error('必須項目が入力されていません')
    if (moment(startDate).isAfter(moment(endDate)))
      return alert.error('終了時刻は開始時刻より早く設定できません')

    const photos = [
      files[0] ? files[0] : photoUrls[0],
      files[1] ? files[1] : photoUrls[1],
      files[2] ? files[2] : photoUrls[2],
    ].filter((v) => v)

    const params = {
      eventName,
      placeName,
      eventDetail,
      startDate,
      endDate,
    }
    previewEvent({
      setModalInner,
      setModal,
      submitEvent,
      params,
      photos,
    })
  }

  const fileInput = (i: number) => (
    <div
      style={{
        border: '1px solid gray',
        padding: '0.5em',
        borderRadius: '0.3em',
      }}
    >
      {photoUrls[i] && (
        <Row>
          <Col xs="6" sm="4" md="2">
            <p style={{ margin: 0, marginTop: '0.5em' }}>現在の画像</p>
            <img src={photoUrls[i]} style={{ width: '100%' }} alt="now image" />
          </Col>
        </Row>
      )}
      {files[i] && (
        <Row>
          <Col xs="6" sm="4" md="2">
            {photoUrls[i] && <p style={{ margin: 0, marginTop: '0.5em' }}>新しい画像</p>}
            <img src={files[i]} style={{ width: '100%' }} alt="new image" />
          </Col>
        </Row>
      )}
      <Input
        type="file"
        name="file1"
        accept=".jpg"
        onChange={(e) => changeFiles(e.target.files, i)}
      />
    </div>
  )

  const saveImages = async (file: string, number: number) => {
    const dt = new Date()
    const yyyy = dt.getFullYear()
    const MM = ('00' + (dt.getMonth() + 1)).slice(-2)
    const dd = ('00' + dt.getDate()).slice(-2)
    const hh = ('00' + dt.getHours()).slice(-2)
    const mm = ('00' + dt.getMinutes()).slice(-2)
    const ss = ('00' + dt.getSeconds()).slice(-2)
    const filename = yyyy + MM + dd + hh + mm + ss + '_' + number
    const storageRef = (await storage()).ref()
    const userEventRef = storageRef.child(`${user.uid}/events/${filename}.jpg`)
    await userEventRef.putString(file, 'data_url')
    return filename
  }

  const submitEvent = async () => {
    if (loading) return
    setLoading(true)
    let photos: string[] = []
    photos[0] = files[0] ? await saveImages(files[0] as string, 1) : event.photos[0]
    photos[1] = files[1] ? await saveImages(files[1] as string, 2) : event.photos[1]
    photos[2] = files[2] ? await saveImages(files[2] as string, 3) : event.photos[2]
    // 配列の空要素を削除して先頭から詰める
    photos = photos.filter((v) => v)

    const eventData = {
      photos,
      placeName,
      name: eventName,
      createdUser: user.uid,
      eventDetail,
      startDate: moment(startDate as string).toDate(),
      endDate: moment(endDate as string).toDate(),
    }
    try {
      let msg = ''
      let pathname = ''
      if (mode === 'new') {
        const result = await fuego.db.collection('events').add(eventData)
        msg = 'イベントを作成しました。'
        pathname = `/events/${result.id}`
      } else if (mode === 'edit') {
        await update(eventData)
        msg = 'イベントが更新されました。表示に反映されるまで時間がかかる場合があります。'
        pathname = `/events/${router.query.id}`
      }

      setModal(false)
      router.push({
        pathname,
        query: { msg: encodeQuery(msg) },
      })
      return true
    } catch (e) {
      alert.error(errorMsg(e))
      setLoading(false)
      return false
    }
  }

  return (
    <Form style={{ marginTop: '2em' }} onSubmit={submit}>
      <FormGroup>
        <Label className="mr-2">イベント名</Label>
        <Input
          onChange={(e) => setEventName(e.target.value)}
          value={eventName}
          invalid={eventName.length == 0}
        ></Input>
      </FormGroup>
      <FormGroup>
        <Label className="mr-2">会場名</Label>
        <Input
          onChange={(e) => setPlaceName(e.target.value)}
          value={placeName}
          invalid={placeName.length == 0}
        ></Input>
      </FormGroup>
      <FormGroup>
        <Label for="describe">イベント詳細</Label>
        <Input
          style={{ height: '20em' }}
          type="textarea"
          name="text"
          id="describe"
          onChange={(e) => setEventDetail(e.target.value)}
          value={eventDetail}
        />
      </FormGroup>
      <FormGroup>
        <p style={{ marginBottom: '.5rem' }}>開始</p>
        <DatePicker
          locale="ja"
          selected={moment(startDate).toDate()}
          selectsStart
          startDate={moment(startDate).toDate()}
          minDate={new Date()}
          onChange={(selectedDate: Date) => setStartDate(toUtcIso8601str(moment(selectedDate)))}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="yyyy年 M月d日 H:mm"
        />
      </FormGroup>
      <FormGroup>
        <p style={{ marginBottom: '.5rem' }}>終了</p>
        <DatePicker
          locale="ja"
          selected={moment(endDate).toDate()}
          selectsEnd
          endDate={moment(endDate).toDate()}
          minDate={new Date()}
          onChange={(selectedDate: Date) => setEndDate(toUtcIso8601str(moment(selectedDate)))}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="yyyy年 M月d日 H:mm"
        />
      </FormGroup>
      <Label>添付する画像を選択(.jpgファイルのみ対応)</Label>
      <FormGroup>{fileInput(0)}</FormGroup>
      <FormGroup>{fileInput(1)}</FormGroup>
      <FormGroup>{fileInput(2)}</FormGroup>
      <FormGroup>
        <Row style={{ margin: 0, marginTop: '0.5em' }}>
          <Button className="ml-auto">確認</Button>
        </Row>
      </FormGroup>
    </Form>
  )
}

export default EventForm
