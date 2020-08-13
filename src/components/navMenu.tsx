import Link from "next/link"
import { NavbarToggler, Collapse, Nav, NavItem, NavLink } from "reactstrap"
import { useCollection } from "@nandorojo/swr-firestore";

export const LoginMenu = ({user, tmpUser, avater, toggle, isOpen}) => {
    const { data: notifies } = useCollection(
      user && `users/${user.uid}/notifies`,
      {
        where: ["read", "==", false],
        listen: true,
      }
    );

    return (
          <>
            <Link href={`/users/${user ? user.uid : tmpUser.uid}/edit`}>
              <div className="ml-auto">
                <img
                  src={avater}
                  style={{
                    borderRadius: "50%",
                    height: "40px",
                    width: "40px",
                    cursor: "pointer",
                  }}
                />
              </div>
            </Link>
            <Link href={`/users/${user ? user.uid : tmpUser.uid}/notifies`}>
              <div
                className="ml-2 mr-2"
                style={{
                  border: "solid 1px gray",
                  borderRadius: "50%",
                  backgroundColor: notifies?.length > 0 ? "orange" : "gray",
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
                  <div style={{ fontWeight: "bold" }}>{notifies?.length}</div>
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
                  <Link
                    href={`/users/${user ? user.uid : tmpUser.uid}/myEvents`}
                  >
                    <NavLink style={{ color: "white" }}>
                      主催するイベント
                    </NavLink>
                  </Link>
                </NavItem>
                <NavItem style={{ cursor: "pointer" }}>
                  <Link
                    href={`/users/${user ? user.uid : tmpUser.uid}/myTickets`}
                  >
                    <NavLink style={{ color: "white" }}>
                      購入済みチケット
                    </NavLink>
                  </Link>
                </NavItem>
                <NavItem style={{ cursor: "pointer" }}>
                  <Link href={`/termsOfUse`}>
                    <NavLink style={{ color: "white" }}>利用規約</NavLink>
                  </Link>
                </NavItem>
              </Nav>
            </Collapse>
          </>
        
    )
}

    

export const LogoutMenu = ({ toggle, isOpen }) => {
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
            <Link href={`/termsOfUse`}>
              <NavLink>利用規約</NavLink>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </>
  );
};