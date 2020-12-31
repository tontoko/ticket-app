import Link from 'next/link'
import { useState, useEffect, useMemo, ReactNode } from 'react'
import { Navbar, NavbarBrand, Container } from 'reactstrap'
import { useAlert } from 'react-alert'
import { useRouter } from 'next/router'
import { decodeQuery } from '@/src/lib/parseQuery'
import dynamic from 'next/dynamic'
import { NextPage } from 'next'
const LoginMenu = dynamic(() => import('@/src/components/navLoginMenu'), { ssr: false })
const LogoutMenu = dynamic(() => import('@/src/components/navLogoutMenu'), { ssr: false })

const UserLayout: NextPage<{ user: firebase.default.User; children: ReactNode }> = ({
  user,
  children,
}) => {
  const router = useRouter()
  const alert = useAlert()
  const [isOpen, toggle] = useState(false)

  const avater = useMemo(() => {
    if (user) {
      const photoURL = user.providerData[0].photoURL
      if (photoURL) return photoURL
    }
    return '/icons/person-icon-default.png'
  }, [user])

  useEffect(() => {
    if (!router) return
    const { msg } = router.query
    if (msg) alert.success(decodeQuery(msg as string))
  }, [alert, router])

  return (
    <>
      <Navbar style={{ backgroundColor: '#A0522D' }} expand="md" dark>
        <Link href={user ? `/users/${user.uid}` : '/login'}>
          <div>
            <NavbarBrand style={{ cursor: 'pointer' }}>Ticket-App(α)</NavbarBrand>
          </div>
        </Link>
        {user ? (
          <LoginMenu {...{ user, avater, toggle, isOpen }} />
        ) : (
          <LogoutMenu {...{ toggle, isOpen }} />
        )}
      </Navbar>
      <Container style={{ marginTop: '2em', marginBottom: '2em' }}>{children}</Container>
    </>
  )
}

export default UserLayout
