import Link from 'next/link'
import React, { useState } from 'react'
import { FormGroup, Button, Label, Input, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { GetStaticPaths, GetStaticProps } from 'next'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { auth } from '@/src/lib/initFirebase'
import withAuth from '@/src/lib/withAuth'
import { stripeAccounts, stripeBalance } from '@/src/lib/stripeRetrieve'

const UserShow = ({ user }) => {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ marginTop: "1.5em", marginBottom: "1.5em" }}>
      <h4>登録情報の変更</h4>
      <FormGroup style={{ marginTop: "2em" }}>
        <Label for="email">メールアドレス</Label>
        <Input
          disabled
          type="email"
          name="email"
          id="email"
          value={user.email}
        />
      </FormGroup>
      {user.providerData[0].providerId !== "password" && (
        <FormGroup style={{ marginTop: "1em" }}>
          <Label>連携済みサービス</Label>
          <Row style={{ margin: 0 }}>
            <Col style={{ display: "flex", padding: 0 }}>
              {user.providerData[0].providerId === "facebook.com" && (
                <p>
                  <FontAwesomeIcon
                    icon={faFacebook}
                    size="lg"
                    style={{ color: "#4267b2" }}
                    className="fa-2x"
                  />
                </p>
              )}
              {user.providerData[0].providerId === "google.com" && (
                <p>
                  <FontAwesomeIcon
                    icon={faGoogle}
                    size="lg"
                    style={{ color: "#DB4437" }}
                    className="fa-2x"
                  />
                </p>
              )}
            </Col>
          </Row>
        </FormGroup>
      )}
      {user.providerData[0].providerId === "password" && (
        <>
          <FormGroup style={{ marginTop: "2em" }}>
            <Link href={`/users/${user.uid}/edit/updateEmail`}>
              <a>メールアドレスを変更する</a>
            </Link>
          </FormGroup>
          <FormGroup>
            <Link href={`/users/${user.uid}/edit/updatePassword`}>
              <a>パスワードを変更する</a>
            </Link>
          </FormGroup>
        </>
      )}

      <FormGroup style={{ marginBottom: "1em" }}>
        <Link href={`/users/${user.uid}/edit/leave`}>
          <a>退会する</a>
        </Link>
      </FormGroup>

      <Row form style={{ marginBottom: "1em" }}>
        <Link href={`/users/${user.uid}/edit/organizer`}>
          <Button className="ml-auto">主催者用登録情報</Button>
        </Link>
      </Row>

      <Row form style={{ marginBottom: "1em" }}>
        <Link href={`/users/${user.uid}/payments`}>
          <Button className="ml-auto">購入履歴</Button>
        </Link>
      </Row>

      <Row form style={{ marginBottom: "2em" }}>
        <Button
          className="ml-auto"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await auth.signOut();
          }}
        >
          ログアウト
        </Button>
      </Row>
    </div>
  );
};

export default withAuth(UserShow);