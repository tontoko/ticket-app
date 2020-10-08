import Link from "next/link"
import { NavbarToggler, Collapse, Nav, NavItem, NavLink } from "reactstrap"

const LogoutMenu = ({ toggle, isOpen }) => {
  return (
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
            <Link href={`/contact`}>
              <NavLink>お問い合わせ</NavLink>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </>
  );
};

export default LogoutMenu