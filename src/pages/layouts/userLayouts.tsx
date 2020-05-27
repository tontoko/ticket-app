import Link from 'next/link'
import React from 'react'
import { useState, useEffect } from 'react'
import {
    Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, Container } from 'reactstrap'
import Avater from 'react-avatar'
import { useAlert } from "react-alert"
import { useRouter } from 'next/router'
import {GetServerSideProps} from 'next'
import isLogin from '@/src/lib/isLogin'
import { decodeQuery } from '@/src/lib/parseQuery'

const UserLayout: React.FC<any> = ({user, children}) => {
    const router = useRouter()
    const alert = useAlert()
    const [isOpen, toggle] = useState(false)

    useEffect(() => {
        const { msg } = router.query
        if (msg) alert.success(decodeQuery(msg as string))
    },[router.query])

    return (
        <>
        <Navbar style={{ backgroundColor: "#A0522D"}} expand="md" dark>
            <NavbarBrand href="/">Ticket-App</NavbarBrand>
            {user && user.email && 
                <>
                <div style={{marginLeft: "auto"}}>
                    <Link href={`/user`}>
                        <div className="ml-auto mr-2">
                                <Avater 
                                size="40" 
                                round 
                                style={{ cursor: "pointer" }}
                                src={user.picture}
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
        <Container style={{ marginTop: '2em', marginBottom: '2em' }}>
            {children}
        </Container>
        </>
    );
}

export default UserLayout