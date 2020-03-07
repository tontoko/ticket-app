import React, { useState,useEffect } from 'react';
import {
    Button, Container, Col, Row, Form, Input, FormGroup, Label
} from 'reactstrap';
import Link from 'next/link'
import { useRouter } from 'next/router'
import initFirebase from '../../../../initFirebase'
import Loading from '../../../../components/loading'

export default () => {
    const router = useRouter()
    const [files, setFiles] = useState(['', '', ''])
    const [eventName, setEventName] = useState('')
    const [placeName, setPlaceName] = useState('')
    const [eventDetail, setEventDetail] = useState('')
    const [startDate, setStartDate] = useState('')
    const [time, setTime] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        (async () => {
            const {firestore} = await initFirebase()
            const event = (await firestore.collection('events').doc(router.query.id as string).get()).data()
            setEventName(event.name)
            setPlaceName(event.placeName)
            setEventDetail(event.eventDetail)
            const date = event.startDate as firebase.firestore.Timestamp
            setStartDate(event.startDate)
            setLoading(false)
        })()
    }, [])

    const changeFiles = async (inputFiles: FileList, i: 0 | 1 | 2) => {
        const fileReader = new FileReader()
        fileReader.onload = function () {
            const cpfiles = [...files]
            cpfiles[i] = this.result as string
            setFiles(cpfiles)
        }
        fileReader.readAsDataURL(inputFiles[0])
    }

    const submit = () => {
        window.scrollTo(0, 0)
        if (eventName.length == 0 || placeName.length == 0) return
        router.push({
            pathname: '/events/new/confirm',
            query: {
                file1: files[0],
                file2: files[1],
                file3: files[2],
                eventName,
                placeName,
                eventDetail,
                startDate,
                time
            },
        },
            '/events/new/confirm'
        )
    }

    if (loading) return <Loading />

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
                    <Input type="file" name="file1" accept=".jpg" style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }} onChange={e => changeFiles(e.target.files, 0)} />
                </FormGroup>
                <FormGroup>
                    <Input type="file" name="file2" accept=".jpg" style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }} onChange={e => changeFiles(e.target.files, 1)} />
                </FormGroup>
                <FormGroup>
                    <Input type="file" name="file3" accept=".jpg" style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }} onChange={e => changeFiles(e.target.files, 2)} />
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
