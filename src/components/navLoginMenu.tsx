import Link from 'next/link'
import { NavbarToggler, Collapse, Nav, NavItem, NavLink } from 'reactstrap'
import { useCollection } from '@nandorojo/swr-firestore'

const LoginMenu = ({ user, avater, toggle, isOpen }) => {
  const { data: notifies } = useCollection(user && `users/${user.uid}/notifies`, {
    where: ['read', '==', false],
    listen: true,
  })

  return (
    <>
      <Link href={`/users/${user.uid}/edit`}>
        <div className="ml-auto">
          <img
            src={avater}
            style={{
              borderRadius: '50%',
              height: '40px',
              width: '40px',
              cursor: 'pointer',
              backgroundColor: 'white',
            }}
          />
        </div>
      </Link>
      <Link href={`/users/${user.uid}/notifies`}>
        <div
          className="ml-2 mr-2"
          style={{
            border: 'solid 1px gray',
            borderRadius: '50%',
            backgroundColor: notifies?.length > 0 ? 'orange' : 'gray',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              borderRadius: '50%',
              backgroundColor: 'white',
              width: '32px',
              height: '32px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{notifies ? notifies.length : 0}</div>
          </div>
        </div>
      </Link>
      <NavbarToggler onClick={() => toggle(!isOpen)} />
      <Collapse isOpen={isOpen} navbar className="justify-content-end flex-grow-0">
        <Nav navbar>
          <NavItem style={{ cursor: 'pointer' }}>
            <Link href={`/users/${user.uid}/myEvents`}>
              <NavLink>主催するイベント</NavLink>
            </Link>
          </NavItem>
          <NavItem style={{ cursor: 'pointer' }}>
            <Link href={`/users/${user.uid}/myTickets`}>
              <NavLink>購入済みチケット</NavLink>
            </Link>
          </NavItem>
          <NavItem style={{ cursor: 'pointer' }}>
            <Link href={`/contact`}>
              <NavLink>お問い合わせ</NavLink>
            </Link>
          </NavItem>
          <NavItem style={{ cursor: 'pointer' }}>
            <Link href={`/termsOfUse`}>
              <NavLink>利用規約</NavLink>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </>
  )
}

export default LoginMenu
