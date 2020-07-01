import Link from 'next/link'
import React from 'react'
import { useState, useEffect } from 'react'
import {
    Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, Container } from 'reactstrap'
import Avater from 'react-avatar'
import { useAlert } from "react-alert"
import { useRouter } from 'next/router'
import { decodeQuery } from '@/src/lib/parseQuery'
import initFirebase from '@/src/lib/initFirebase'

const UserLayout: React.FC<any> = ({user, children}) => {
    const router = useRouter()
    const alert = useAlert()
    const [isOpen, toggle] = useState(false)
    const [messagesLength, setMessagesLength] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        (async() => {
            const { msg } = router.query
            if (msg) alert.success(decodeQuery(msg as string))
            const { firestore } = await initFirebase()
            setMessagesLength((await firestore.collection('messages').where('receivedUser', '==', user.uid).get()).size)
            setIsLoading(false)
        })()
    },[router.query])

    return (
        <>
        <Navbar style={{ backgroundColor: "#A0522D"}} expand="md" dark>
            <NavbarBrand href={user ? '/user' : '/login'}>Ticket-App</NavbarBrand>
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
                <Link href={`/user/messages`}>
                    <div className="mr-2" style={{ borderRadius: '50%', backgroundColor: messagesLength > 0 ? 'red' : 'gray', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                        <div style={{ borderRadius: '50%', backgroundColor: 'white', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ fontWeight: 'bold' }}>{messagesLength}</div>
                        </div>
                    </div>
                </Link>
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
            {!user &&
                <>
                <div style={{ marginLeft: "auto" }} />
                <NavbarToggler onClick={() => toggle(!isOpen)} />
                <Collapse isOpen={isOpen} navbar className="justify-content-end flex-grow-0">
                    <Nav navbar>
                        <NavItem>
                            <NavLink href={`/register`}>新規登録する</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href={`/login`}>ログイン</NavLink>
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