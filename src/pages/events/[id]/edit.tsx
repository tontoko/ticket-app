import React, { useState,useEffect } from 'react';
import {
    Button, Container, Col, Row, Form, Input, FormGroup, Label, Spinner
} from 'reactstrap';
import Link from 'next/link'
import { useRouter } from 'next/router'
import initFirebase from '@/src/lib/initFirebase'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import Loading from '@/src/components/loading'
import getImg from '@/src/lib/getImgSSR'
import isLogin from '@/src/lib/isLogin'
import { GetServerSideProps } from 'next'
import {event} from 'events'
import DatePicker, { registerLocale } from "react-datepicker"
import ja from 'date-fns/locale/ja'
registerLocale('ja', ja)
import moment from 'moment'
import { toUtcIso8601str } from '@/src/lib/time'
import { useAlert } from 'react-alert';
import errorMsg from '@/src/lib/errorMsg';
import { encodeQuery } from '@/src/lib/parseQuery';

export default ({ user, event, photoUrls }) => {
    const router = useRouter()
    const alert = useAlert()
    const [files, setFiles] = useState(['', '', ''])
    const [eventName, setEventName] = useState(event.name)
    const [placeName, setPlaceName] = useState(event.placeName)
    const [eventDetail, setEventDetail] = useState(event.eventDetail)
    const [startDate, setStartDate] = useState(toUtcIso8601str(moment(event.startDate * 1000)))
    const [endDate, setEndDate] = useState(toUtcIso8601str(moment(event.endDate * 1000)))
    const [loading, setLoading] = useState(false)

    const changeFiles = async (inputFiles: FileList, i: 0 | 1 | 2) => {
        const fileReader = new FileReader()
        fileReader.onload = function () {
            const cpfiles = [...files]
            cpfiles[i] = this.result as string
            setFiles(cpfiles)
        }
        fileReader.readAsDataURL(inputFiles[0])
    }

    const saveImages = async (file: string, number: number, firebase: any) => {
        const dt = new Date();
        const yyyy = dt.getFullYear()
        const MM = ("00" + (dt.getMonth() + 1)).slice(-2)
        const dd = ("00" + dt.getDate()).slice(-2)
        const hh = ("00" + dt.getHours()).slice(-2)
        const mm = ("00" + dt.getMinutes()).slice(-2)
        const ss = ("00" + dt.getSeconds()).slice(-2)
        const filename = yyyy + MM + dd + hh + mm + ss + '_' + number
        const storageRef = firebase.storage().ref()
        const userEventRef = storageRef.child(`${firebase.auth().currentUser.uid}/events/${filename}.jpg`)
        await userEventRef.putString(file, 'data_url')
        return filename
    }

    const updateEvent = async () => {
        setLoading(true)
        const { firebase } = await initFirebase()
        let photos: string[] = []
        photos[0] = files[0] ? await saveImages(files[0] as string, 1, firebase) : event.photos[0]
        photos[1] = files[1] ? await saveImages(files[1] as string, 2, firebase) : event.photos[1]
        photos[2] = files[2] ? await saveImages(files[2] as string, 3, firebase) : event.photos[2]
        // 配列の空要素を削除して先頭から詰める
        photos = photos.filter(v => v)
        const firestore = firebase.firestore()
        try {
            await firestore.collection('events').doc(router.query.id as string).update({
                photos,
                placeName,
                name: eventName,
                createdUser: firebase.auth().currentUser.uid,
                eventDetail,
                startDate: moment(startDate as string).toDate(),
                endDate: moment(endDate as string).toDate(),
            })
            router.push({ pathname: `/events/${router.query.id}`, query: { msg: encodeQuery('更新しました') }})
        } catch(e) { 
            alert.error(errorMsg(e))
            setLoading(false)
        }
    }

    const submit = (e) => {
        e.preventDefault()
        if (eventName.length == 0 || placeName.length == 0) return
        updateEvent()
    }

    const fileInput = (i:0|1|2) => (
        <div style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }}>
            {(photoUrls[i]) && (
            <Row>
                <Col xs="6" sm="4" md="2">
                    <p style={{margin:0,marginTop:'0.5em'}}>現在の画像</p>
                    <img src={photoUrls[i]} style={{ width: "100%" }} />
                </Col>
            </Row>
            )}
            {(files[i]) && (
            <Row>
                <Col xs="6" sm="4" md="2">
                    <p style={{margin:0,marginTop:'0.5em'}}>新しい画像</p>
                    <img src={files[i]} style={{ width: "100%" }} />
                </Col>
            </Row>
            )}
            <Input type="file" name="file1" accept=".jpg" onChange={e => changeFiles(e.target.files, i)} />
        </div>
    )

    return (
        <Form style={{ marginTop: "2em" }} onSubmit={submit}>
            <FormGroup>
                <Label className="mr-2">イベント名</Label>
                <Input onChange={e => setEventName(e.target.value)} value={eventName} invalid={eventName.length == 0}></Input>
            </FormGroup>
            <FormGroup>
                <Label className="mr-2">会場名</Label>
                <Input onChange={e => setPlaceName(e.target.value)} value={placeName} invalid={placeName.length == 0}></Input>
            </FormGroup>
            <FormGroup>
                <Label for="describe">イベント詳細</Label>
                <Input style={{ height: "20em" }} type="textarea" name="text" id="describe" onChange={e => setEventDetail(e.target.value)} value={eventDetail} />
            </FormGroup>
            <FormGroup>
                <p style={{ marginBottom: '.5rem' }}>開始</p>
                <DatePicker
                    locale="ja"
                    selected={moment(startDate).toDate()}
                    selectsStart
                    startDate={moment(startDate).toDate()}
                    minDate={new Date()}
                    onChange={selectedDate => setStartDate(toUtcIso8601str(moment(selectedDate)))}
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
                    onChange={selectedDate => setEndDate(toUtcIso8601str(moment(selectedDate)))}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="yyyy年 M月d日 H:mm"
                />
            </FormGroup>
            <Label>添付する画像を選択(.jpgファイルのみ対応)</Label>
            <FormGroup>
                {fileInput(0)}
            </FormGroup>
            <FormGroup>
                {fileInput(1)}
            </FormGroup>
            <FormGroup>
                {fileInput(2)}
            </FormGroup>
            <FormGroup>
                <Row style={{ margin: 0, marginTop: "0.5em" }}>
                    <Button className="ml-auto" disabled={loading}>{loading ? <Spinner/> : '確認'}</Button>
                </Row>
            </FormGroup>
        </Form>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const {user} = await isLogin(ctx, 'redirect')
    const {firestore} = await initFirebaseAdmin()

    const {query} = ctx
    const data = (await firestore.collection('events').doc(query.id as string).get()).data() as event
    const photos: undefined | string[] = data.photos
    const photoUrls = photos ? await Promise.all(photos.map(async photo => getImg(photo, user.user_id))) : undefined
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds

    return { props: { user, event: { ...data, startDate, endDate }, photoUrls } }
}