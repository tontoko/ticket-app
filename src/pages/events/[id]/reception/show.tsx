import QRCode from "qrcode.react"
import {
    Button, Container, Col, Row
} from 'reactstrap';

export default () => (
    <Row style={{marginTop: "2em"}}>
        <Col sm={{ size: 10, offset: 1 }} lg={{ size: 6, offset: 3}}>
            <QRCode style={{width: "100%", height: "100%"}} value="/" />
        </Col>
    </Row>
)