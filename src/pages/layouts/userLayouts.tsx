import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import {
    Navbar, NavbarBrand, Container } from 'reactstrap'
import { useAlert } from "react-alert"
import { useRouter } from 'next/router'
import { decodeQuery } from '@/src/lib/parseQuery'
import dynamic from 'next/dynamic'
const LoginMenu = dynamic(() => import("@/src/components/navLoginMenu"), { ssr: false });
const LogoutMenu = dynamic(() => import("@/src/components/navLogoutMenu"), { ssr: false });

const UserLayout: React.FC<any> = ({ user, tmpUser, children }) => {
  const router = useRouter();
  const alert = useAlert();
  const [isOpen, toggle] = useState(false);

  const avater = useMemo(() => {
    if (user || tmpUser) {
      const providerData = user
        ? user.providerData[0]
        : tmpUser.providerData[0];
      if (providerData.photoURL) return providerData.photoURL;
    }
    return "/icons/person-icon-default.png";
  }, [user, tmpUser]);

  useEffect(() => {
    if (!router) return;
    const { msg } = router.query;
    if (msg) alert.success(decodeQuery(msg as string));
  }, [router, router.query.msg]);

  return (
    <>
      <Navbar style={{ backgroundColor: "#A0522D" }} expand="md" dark>
        <Link href={user ? `/users/${user.uid}` : "/login"}>
          <div>
            <NavbarBrand style={{ cursor: "pointer" }}>Ticket-App</NavbarBrand>
          </div>
        </Link>
        {user || tmpUser ? (
          <LoginMenu {...{ user, tmpUser, avater, toggle, isOpen }} />
        ) : (
          <LogoutMenu {...{ avater, toggle, isOpen }} />
        )}
      </Navbar>
      <Container style={{ marginTop: "2em", marginBottom: "2em" }}>
        {children}
      </Container>
    </>
  );
};

export default UserLayout