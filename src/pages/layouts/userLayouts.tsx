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

const UserLayout: React.FC<any> = ({user, children, CSRUser}) => {
    const router = useRouter()
    const alert = useAlert()
    const [isOpen, toggle] = useState(false)
    const [notifiesLength, setNotifiesLength] = useState(0)

    useEffect(() => {
        let cancelListner = () => {}
        (async() => {
            const { msg } = router.query
            if (msg) alert.success(decodeQuery(msg as string))
            if (!user) return
            const { firestore } = await initFirebase()
            cancelListner = firestore
              .collection("users")
              .doc(user.uid)
              .collection("notifies")
              .where("read", "==", false)
              .onSnapshot((notifies) => {
                setNotifiesLength(notifies.size);
              });
        })()
        return cancelListner();
    },[])

    return (
      <>
        <Navbar style={{ backgroundColor: "#A0522D" }} expand="md" dark>
          <NavbarBrand href={user ? "/user" : "/login"}>Ticket-App</NavbarBrand>
          {user && user.email && (
            <>
              <div style={{ marginLeft: "auto" }}>
                <Link href={`/user/edit`}>
                  <div className="ml-auto mr-2">
                    <Avater
                      size="40"
                      round
                      style={{ cursor: "pointer", backgroundColor: 'lightgray' }}
                      src={
                        user.picture
                          ? user.picture
                          : "/icons/person-icon-default.png"
                      }
                    />
                  </div>
                </Link>
              </div>
              <Link href={`/user/notifies`}>
                <div
                  className="mr-2"
                  style={{
                    border: "solid 1px gray",
                    borderRadius: "50%",
                    backgroundColor: notifiesLength > 0 ? "orange" : "gray",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      borderRadius: "50%",
                      backgroundColor: "white",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{notifiesLength}</div>
                  </div>
                </div>
              </Link>
              <NavbarToggler onClick={() => toggle(!isOpen)} />
              <Collapse
                isOpen={isOpen}
                navbar
                className="justify-content-end flex-grow-0"
              >
                <Nav navbar>
                  <NavItem>
                    <NavLink href={`/user/myEvents`}>主催するイベント</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href={`/user/myTickets`}>購入済みチケット</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href={`/termsOfUse`}>利用規約</NavLink>
                  </NavItem>
                </Nav>
              </Collapse>
            </>
          )}
          {!user && (
            <>
              <div style={{ marginLeft: "auto" }} />
              <NavbarToggler onClick={() => toggle(!isOpen)} />
              <Collapse
                isOpen={isOpen}
                navbar
                className="justify-content-end flex-grow-0"
              >
                <Nav navbar>
                  <NavItem>
                    <NavLink href={`/register`}>新規登録する</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href={`/login`}>ログイン</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href={`/termsOfUse`}>利用規約</NavLink>
                  </NavItem>
                </Nav>
              </Collapse>
            </>
          )}
        </Navbar>
        <Container style={{ marginTop: "2em", marginBottom: "2em" }}>
          {children}
        </Container>
      </>
    );
}

export default UserLayout