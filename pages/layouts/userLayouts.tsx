import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
    Form, FormGroup, Button, Label, Input, Container, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem } from 'reactstrap'
import Avater from 'react-avatar'

export const UserLayout: React.FC = () => {

    // return (
    //     <Navbar color="primary" dark>
    //         <NavbarBrand href="/" className="mr-auto">ユーザーレイアウト</NavbarBrand>
    //         <Avater size="50" round style={{marginRight: "1em", cursor: "pointer"}} />
    //         <NavbarToggler onClick={() => setCollapsed(!collapsed)} className="mr-2" />
    //         <Collapse isOpen={!collapsed} navbar>
    //             <Nav navbar>
    //                 <NavItem>
    //                     <NavLink href="/events">イベント一覧</NavLink>
    //                 </NavItem>
    //                 <NavItem>
    //                     <NavLink href="/users/show/myEvents">主催するイベント</NavLink>
    //                 </NavItem>
    //                 <NavItem>
    //                     <NavLink href="/users/show/myTickets">購入済みチケット</NavLink>
    //                 </NavItem>
    //             </Nav>
    //         </Collapse>
    //     </Navbar>
    // )

    const [isOpen, toggle] = useState(false)

    return (
        <div>
            <Navbar color="primary" expand="md" dark>
                <NavbarBrand href="/">ユーザーレイアウト</NavbarBrand>
                <Avater size="50" className="ml-auto" round style={{ marginRight: "1em", cursor: "pointer" }} />
                <NavbarToggler onClick={() => toggle(!isOpen)} />
                <Collapse isOpen={isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <NavLink href="/events">イベント一覧</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/users/show/myEvents">主催するイベント</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/users/show/myTickets">購入済みチケット</NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
        </div>
    );
}

export default UserLayout