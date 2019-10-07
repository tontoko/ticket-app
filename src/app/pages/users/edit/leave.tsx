import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, FormText, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faFacebook } from '@fortawesome/free-brands-svg-icons'

export const Leave: React.FC = () => {

    return (
        <Container>
            <Form style={{ marginTop: "6.5em" }}>
                <h5>本当に退会しますか？</h5>
                <p>削除されたデータは復元することができません。</p>
                <Row style={{ margin: 0, marginTop: "10em" }}>
                    <Button className="ml-auto">上記の説明を理解した上で退会</Button>
                </Row>
            </Form>
        </Container>
    )
}

export default Leave