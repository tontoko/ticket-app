import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem } from 'reactstrap'

export const UserLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(true)

    return (
        <Navbar color="secondary" dark>
            <NavbarBrand href="/" className="mr-auto">主催者レイアウト</NavbarBrand>
            <NavbarToggler onClick={() => setCollapsed(!collapsed)} className="mr-2" />
            <Collapse isOpen={!collapsed} navbar>
                <Nav navbar>
                    <NavItem>
                        <NavLink href="/components/">Components</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="https://github.com/reactstrap/reactstrap">GitHub</NavLink>
                    </NavItem>
                </Nav>
            </Collapse>
        </Navbar>
    )
}

export default UserLayout