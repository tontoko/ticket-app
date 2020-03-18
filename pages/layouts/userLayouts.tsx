import Link from 'next/link'
import React from 'react'
import { useState, useEffect } from 'react'
import {
    Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem } from 'reactstrap'
import Avater from 'react-avatar'
import { useAlert } from "react-alert"
import { useRouter } from 'next/router'
import {GetServerSideProps} from 'next'
import isLogin from '@/lib/isLogin'

const UserLayout: React.FC<any> = ({user, children}) => {
    const router = useRouter()
    const alert = useAlert()
    const [isOpen, toggle] = useState(false)

    useEffect(() => {
        const {msg} = router.query
        if (msg) alert.success(msg)
    },[router.query])

    return (
        <>
        <div>
            <Navbar style={{ backgroundColor: "#A0522D"}} expand="md" dark>
                <NavbarBrand href="/">ユーザーレイアウト</NavbarBrand>
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
        </div>
        {children}
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx)
    return { props: { user } }
}

export default UserLayout