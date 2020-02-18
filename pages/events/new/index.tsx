import React, {useState} from 'react';
import {
    Button, Container, Col, Row, Form, Input, FormGroup, Label
} from 'reactstrap';
import Link from 'next/link'

export default () => {
    const [files, setFiles] = useState(['', '', ''])
    const [eventName, setEventName] = useState('')
    const [placeName, setPlaceName] = useState('')
    const [eventDetail, setEventDetail] = useState('')

    const changeFiles = async (inputFiles:FileList, i:0|1|2) => {
        const fileReader = new FileReader()
        fileReader.onload = function() {
            const cpfiles = [...files]
            cpfiles[i] = this.result as string
            setFiles(cpfiles)
        }
        fileReader.readAsDataURL(inputFiles[0])
    }

    return (
        <Container>
            <Form style={{ marginTop: "2em" }} >
                <FormGroup>
                    <Label className="mr-2">イベント名</Label>
                    <Input onChange={e => setEventName(e.target.value)} value={eventName}></Input>
                </FormGroup>
                <FormGroup>
                    <Label className="mr-2">会場名</Label>
                    <Input onChange={e => setPlaceName(e.target.value)} value={placeName}></Input>
                </FormGroup>
                <FormGroup>
                    <Label for="describe">イベント詳細</Label>
                    <Input style={{ height: "20em" }} type="textarea" name="text" id="describe" onChange={e => setEventDetail(e.target.value)} value={eventDetail} />
                </FormGroup>
                <Label for="image">添付する画像を選択</Label>
                <FormGroup>
                    <Input type="file" name="file1" style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }} onChange={e => changeFiles(e.target.files, 0)} />
                </FormGroup>
                <FormGroup>
                    <Input type="file" name="file2" style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }} onChange={e => changeFiles(e.target.files, 1)} />
                </FormGroup>
                <FormGroup>
                    <Input type="file" name="file3" style={{ border: "1px solid gray", padding: "0.5em", borderRadius: "0.3em" }} onChange={e => changeFiles(e.target.files, 2)} />
                </FormGroup>
                <FormGroup>
                    <Row style={{ margin: 0, marginTop: "0.5em" }}>
                        <Link 
                            href={
                                { 
                                pathname: '/events/new/confirm', 
                                query: { 
                                    file1: files[0], 
                                    file2: files[1], 
                                    file3: files[2], 
                                    eventName, 
                                    placeName, 
                                    eventDetail ,
                                    msg: 'test'
                                    }
                                }} 
                            as='/events/new/confirm'
                        >
                            <Button className="ml-auto">確認</Button>
                        </Link>
                    </Row>
                </FormGroup>
            </Form>
        </Container>
    );
};
