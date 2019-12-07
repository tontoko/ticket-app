import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem } from 'reactstrap'
import Avater from 'react-avatar'

export const UserLayout: React.FC = () => {
    const [isOpen, toggle] = useState(false)

    return (
        <Navbar color="danger" dark>
            <NavbarBrand href="/">管理者ツール</NavbarBrand>
            <a href="/users/show">
                <div className="ml-auto mr-2">
                    <Avater size="40" round style={{ cursor: "pointer" }} />
                </div>
            </a>
            <NavbarToggler onClick={() => toggle(!isOpen)} />
            <Collapse isOpen={isOpen} navbar className="justify-content-end flex-grow-0">
                <Nav navbar>
                    <NavItem>
                        <NavLink href="/events">イベント一覧</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="/users/index">ユーザー一覧</NavLink>
                    </NavItem>
                </Nav>
            </Collapse>
        </Navbar>
    )
}

export default UserLayout