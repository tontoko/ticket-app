import Link from 'next/link'
import React from 'react'
import { useState, useEffect } from 'react'
import {
    Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Nav, NavItem, Container } from 'reactstrap'
import Avater from 'react-avatar'
import { useAlert } from "react-alert"
import { useRouter } from 'next/router'
import { decodeQuery } from '@/src/lib/parseQuery'
import { firestore } from '@/src/lib/initFirebase'

const UserLayout: React.FC<any> = ({ user, tmpUser, userLoading, children }) => {
  const router = useRouter()
  const alert = useAlert()
  const [isOpen, toggle] = useState(false)
  const [notifiesLength, setNotifiesLength] = useState(0)
  let facebookUid = null
  let googleUid = null
  if (user || tmpUser) {
    const providerData = user ? user.providerData[0] : tmpUser.providerData[0]
    if (providerData.providerId === 'facebook.com') {
      facebookUid = providerData.uid
    }
    if (providerData.providerId === 'google.com') {
      googleUid = providerData.uid
    }
  }

  useEffect(() => {
    if (!user || userLoading) return
    const listner = firestore
      .collection("users")
      .doc(user.uid)
      .collection("notifies")
      .where("read", "==", false).onSnapshot(snap => {
        setNotifiesLength(snap ? snap.size : 0);
      })
    return listner
  }, [user, userLoading]);

  useEffect(() => {
    if (!router) return
    const { msg } = router.query;
    if (msg) alert.success(decodeQuery(msg as string));
  }, [!!router, router.query.msg])

  return (
    <>
      <Navbar style={{ backgroundColor: "#A0522D" }} expand="md" dark>
        <Link href={user ? `/users/${user.uid}` : "/login"}>
          <div>
            <NavbarBrand style={{ cursor: "pointer" }}>Ticket-App</NavbarBrand>
          </div>
        </Link>
        {(user || tmpUser) && (
          <>
            <Link href={`/users/${user ? user.uid : tmpUser.uid}/edit`}>
              <Avater
                size="40"
                round
                className="ml-auto mr-2"
                style={{
                  cursor: "pointer",
                  backgroundColor: "lightgray",
                  marginLeft: "auto",
                }}
                facebookId={facebookUid}
                googleId={googleUid}
                src="/icons/person-icon-default.png"
              />
            </Link>
            <Link href={`/users/${user ? user.uid : tmpUser.uid}/notifies`}>
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
                <NavItem style={{ cursor: "pointer" }}>
                  <Link href={`/users/${user ? user.uid : tmpUser.uid}/myEvents`}>
                    <NavLink>主催するイベント</NavLink>
                  </Link>
                </NavItem>
                <NavItem style={{ cursor: "pointer" }}>
                  <Link href={`/users/${user ? user.uid : tmpUser.uid}/myTickets`}>
                    <NavLink>購入済みチケット</NavLink>
                  </Link>
                </NavItem>
                <NavItem style={{ cursor: "pointer" }}>
                  <Link href={`/termsOfUse`}>
                    <NavLink>利用規約</NavLink>
                  </Link>
                </NavItem>
              </Nav>
            </Collapse>
          </>
        )}
        {!user && !tmpUser &&
          !userLoading && (
            <>
              <div style={{ marginLeft: "auto" }} />
              <NavbarToggler onClick={() => toggle(!isOpen)} />
              <Collapse
                isOpen={isOpen}
                navbar
                className="justify-content-end flex-grow-0"
              >
                <Nav navbar>
                  <NavItem style={{ cursor: "pointer" }}>
                    <Link href={`/register`}>
                      <NavLink>新規登録する</NavLink>
                    </Link>
                  </NavItem>
                  <NavItem style={{ cursor: "pointer" }}>
                    <Link href={`/login`}>
                      <NavLink>ログイン</NavLink>
                    </Link>
                  </NavItem>
                  <NavItem style={{ cursor: "pointer" }}>
                    <Link href={`/termsOfUse`}>
                      <NavLink>利用規約</NavLink>
                    </Link>
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