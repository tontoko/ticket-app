import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem } from 'reactstrap'

export const UserLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(true)

    return (
        <Navbar color="primary" dark>
            <NavbarBrand href="/" className="mr-auto">ユーザーレイアウト</NavbarBrand>
            <NavbarToggler onClick={() => setCollapsed(!collapsed)} className="mr-2" />
            <Collapse isOpen={!collapsed} navbar>
                <Nav navbar>
                    <NavItem>
                        <NavLink href="/events">イベント一覧</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="/users/show">登録情報</NavLink>
                    </NavItem>
                </Nav>
            </Collapse>
        </Navbar>
    )
}

export default UserLayout