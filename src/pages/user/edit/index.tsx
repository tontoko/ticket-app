import Link from 'next/link'
import React, { useState } from 'react'
import { FormGroup, Button, Label, Input, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import stripe from '@/src/lib/stripe'
import initFirebase from '@/src/lib/initFirebase'

const UserShow = ({ user, verification, balance }) => {
    const [loading, setLoading] = useState(false)
    const status = !verification ? null : verification.status

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
        {user.firebase.sign_in_provider !== "password" && (
          <FormGroup style={{ marginTop: "1em" }}>
            <Label>連携済みサービス</Label>
            <Row style={{ margin: 0 }}>
              <Col style={{ display: "flex", padding: 0 }}>
                {user.firebase.sign_in_provider === "facebook.com" && (
                  <p>
                    <FontAwesomeIcon
                      icon={faFacebook}
                      size="lg"
                      style={{ color: "#4267b2" }}
                      className="fa-2x"
                    />
                  </p>
                )}
                {user.firebase.sign_in_provider === "google.com" && (
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
        {user.firebase.sign_in_provider === "password" && (
          <>
            <FormGroup style={{ marginTop: "2em" }}>
              <Link href={`/user/edit/updateEmail`}>
                <a>メールアドレスを変更する</a>
              </Link>
            </FormGroup>
            <FormGroup>
              <Link href={`/user/edit/updatePassword`}>
                <a>パスワードを変更する</a>
              </Link>
            </FormGroup>
          </>
        )}

        <div style={{ marginBottom: "1.5em" }}>
          <h4>イベント主催者用の登録情報</h4>
          <Label>
            イベントを開催するには、ユーザー情報と本人確認書類を登録する必要があります。
          </Label>
          <FormGroup style={{ marginBottom: "1em" }}>
            <Link href={`/user/edit/updateUser`}>
              <a>ユーザー情報を追加・修正する</a>
            </Link>
          </FormGroup>
          <FormGroup>
            {(() => {
              if (status === "unverified")
                return (
                  <Link href={`/user/edit/identification`}>
                    <a>本人確認書類をアップロードする</a>
                  </Link>
                );
              if (status === "pending")
                return (
                  <>
                    <p>本人確認書類: </p>
                    <Link href={`/user/edit/identification`}>
                      <a>
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          style={{ color: "red", marginLeft: "0.5em" }}
                        />{" "}
                        提出済み (再提出が必要です)
                      </a>
                    </Link>
                  </>
                );
              if (status === "verified")
                return (
                  <p>
                    本人確認書類:{" "}
                    <FontAwesomeIcon
                      icon={faCheckSquare}
                      style={{ color: "#00DD00", marginLeft: "0.5em" }}
                    />{" "}
                    提出済み (確認済)
                  </p>
                );
            })()}
          </FormGroup>
          <FormGroup style={{ marginBottom: "1em" }}>
            <Link href={`/user/bankAccounts`}>
              <a>売上振り込み用 銀行口座を追加・修正する</a>
            </Link>
          </FormGroup>
        </div>

        <FormGroup style={{ marginBottom: "1.5em" }}>
          <h4>売上と入金</h4>
          <p>入金待ち: {balance.available[0].amount} 円<br/>
          暫定売上(確認中): {balance.pending[0].amount} 円</p>
        </FormGroup>

        <FormGroup style={{ marginBottom: "1em" }}>
          <Link href={`/user/edit/leave`}>
            <a>退会する</a>
          </Link>
        </FormGroup>

        <Row form style={{ marginBottom: "1em" }}>
          <Link href={`/user/payments`}>
            <Button className="ml-auto">購入履歴</Button>
          </Link>
        </Row>

        <Row form style={{ marginBottom: "2em" }}>
          <Button
            className="ml-auto"
            disabled={loading}
            onClick={async () => {
              const { firebase } = await initFirebase();
              setLoading(true);
              await firebase.auth().signOut();
            }}
          >
            ログアウト
          </Button>
        </Row>
      </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { user } = await isLogin(ctx, 'redirect')
    const { firestore } = await initFirebaseAdmin()
    const { stripeId } = (await firestore.collection('users').doc(user.uid).get()).data()
    const { individual } = await stripe.accounts.retrieve(stripeId)
    const verification = individual ? individual.verification : null
    const balance = await stripe.balance.retrieve({ stripeAccount: stripeId });
    return { props: { user, verification, balance } }
}

export default UserShow