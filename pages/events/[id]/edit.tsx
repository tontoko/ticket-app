import React, { useState,useEffect } from 'react';
import {
    Button, Container, Col, Row, Form, Input, FormGroup, Label
} from 'reactstrap';
import Link from 'next/link'
import { useRouter } from 'next/router'
import initFirebase from '@/initFirebase'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import Loading from '@/components/loading'
import getImg from '@/lib/getImgSSR'
import isLogin from '@/lib/isLogin'
import { GetServerSideProps } from 'next'
import {event} from 'events'

export default ({ user, event, photoUrls, dbStartDate, DbTime }) => {
    const router = useRouter()
    const [files, setFiles] = useState(['', '', ''])
    const [eventName, setEventName] = useState(event.name)
    const [placeName, setPlaceName] = useState(event.placeName)
    const [eventDetail, setEventDetail] = useState(event.eventDetail)
    const [startDate, setStartDate] = useState(dbStartDate)
    const [time, setTime] = useState(DbTime)

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
        const { firebase } = await initFirebase()
        let photos: string[] = []
        photos[0] = files[0] ? await saveImages(files[0] as string, 1, firebase) : event.photos[0]
        photos[1] = files[1] ? await saveImages(files[1] as string, 2, firebase) : event.photos[1]
        photos[2] = files[2] ? await saveImages(files[2] as string, 3, firebase) : event.photos[2]
        // 配列の空要素を削除して先頭から詰める
        photos = photos.filter(v => v)
        const firestore = firebase.firestore()
        await firestore.collection('events').doc(router.query.id as string).update({
            photos,
            placeName,
            name: eventName,
            createdAt: new Date,
            createdUser: firebase.auth().currentUser.uid,
            eventDetail,
            startDate: new Date(startDate as string),
            updatedAt: new Date(startDate as string),
            time
        })
        router.push(`/events/${router.query.id}`)
    }

    const submit = () => {
        if (eventName.length == 0 || placeName.length == 0) return
        updateEvent()
    }

    const fileInput = (i:0|1|2) => (
        <div style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }}>
            {(photoUrls[i]) && (<>
                <p style={{margin:0,marginTop:'0.5em'}}>現在の画像</p>
                <img src={photoUrls[i]} height="360px" width="auto" />
            </>)}
            {(files[i]) && (<>
                <p style={{margin:0,marginTop:'0.5em'}}>新しい画像</p>
                <img src={files[i]} height="360px" width="auto" />
            </>)}
            <Input type="file" name="file1" accept=".jpg" onChange={e => changeFiles(e.target.files, i)} />
        </div>
    )

    return (
        <Container>
            <Form style={{ marginTop: "2em" }} >
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
                    <Label>開始日</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
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
                        <Button className="ml-auto" onClick={() => submit()}>確認</Button>
                    </Row>
                </FormGroup>
            </Form>
        </Container>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const {user} = await isLogin(ctx)
    const {firestore} = await initFirebaseAdmin()

    const {query} = ctx
    const data = (await firestore.collection('events').doc(query.id as string).get()).data() as event
    const date: Date = data.startDate.toDate()
    const dbStartDate = date.toISOString().substr(0, 10)
    const DbTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    const photos: undefined | string[] = data.photos
    const photoUrls = photos ? await Promise.all(photos.map(async photo => getImg(photo, user.user_id,'360'))) : undefined
    const createdAt = data.createdAt.seconds
    const updatedAt = data.updatedAt.seconds
    const startDate = data.startDate.seconds

    return { props: { user, event: { ...data, createdAt, updatedAt, startDate }, photoUrls, dbStartDate, DbTime } }
}