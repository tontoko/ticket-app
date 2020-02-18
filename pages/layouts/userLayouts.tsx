import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import {
    Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem } from 'reactstrap'
import Avater from 'react-avatar'

export const UserLayout: React.FC<any> = (props) => {

    const [isOpen, toggle] = useState(false)
    return (
        <div>
            <Navbar style={{ backgroundColor: "#A0522D"}} expand="md" dark>
                <NavbarBrand href="/">ユーザーレイアウト</NavbarBrand>
                {props.params.email && 
                    <>
                    <div style={{marginLeft: "auto"}}>
                        <Link href={`/user`}>
                            <div className="ml-auto mr-2">
                                    <Avater 
                                    size="40" 
                                    round 
                                    style={{ cursor: "pointer" }}
                                    src={props.params.picture}
                                    />
                            </div>
                        </Link>
                    </div>
                    <NavbarToggler onClick={() => toggle(!isOpen)} />
                    <Collapse isOpen={isOpen} navbar className="justify-content-end flex-grow-0">
                        <Nav navbar>
                            <NavItem>
                                <NavLink href={`/user/myEvents`}>主催するイベント</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href={`/user/myTickets`}>購入済みチケット</NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                    </>
                }
            </Navbar>
        </div>
    );
}

export default UserLayout