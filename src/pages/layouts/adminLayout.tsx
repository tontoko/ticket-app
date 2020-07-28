import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem } from 'reactstrap'
import Avater from 'react-avatar'

const UserLayout: React.FC = () => {
    const [isOpen, toggle] = useState(false)

    return (
        // 未実装
        <Navbar color="danger" dark>
            <NavbarBrand href="/">管理者ツール</NavbarBrand>
            <Link href="/user/1">
                <div className="ml-auto mr-2">
                    <Avater size="40" round style={{ cursor: "pointer" }} />
                </div>
            </Link>
            <NavbarToggler onClick={() => toggle(!isOpen)} />
            <Collapse isOpen={isOpen} navbar className="justify-content-end flex-grow-0">
                <Nav navbar>
                    <NavItem>
                        <NavLink href="/events">イベント一覧</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="/user/index">ユーザー一覧</NavLink>
                    </NavItem>
                </Nav>
            </Collapse>
        </Navbar>
    )
}

export default UserLayout