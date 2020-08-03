import Link from "next/link";
import React from "react";
import { FormGroup, Label } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckSquare,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { GetStaticPaths, GetStaticProps } from "next";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import withAuth from "@/src/lib/withAuth";
import { stripeAccounts, stripeBalance } from "@/src/lib/stripeRetrieve";

// TODO: 本人確認書類の審査結果用Webhockを作成
const Organizer = ({ user, status, balance }) => {
  return (
    <div style={{ marginTop: "1.5em", marginBottom: "1.5em" }}>
      <h4>イベント主催者用の登録情報</h4>
      <Label>
        イベントを開催するには、ユーザー情報と本人確認書類を登録する必要があります。
      </Label>
      <FormGroup style={{ marginTop: '1.5em', marginBottom: "1em" }}>
        <Link href={`/users/${user.uid}/edit/updateUser`}>
          <a>ユーザー情報を追加・修正する</a>
        </Link>
      </FormGroup>
      <FormGroup>
        {(() => {
          if (status === "unverified")
            return (
              <p>
                本人確認書類:
                <Link href={`/users/${user.uid}/edit/identification`}>
                  <a>
                    <FontAwesomeIcon
                      icon={faExclamationCircle}
                      style={{ color: "red", marginLeft: "0.5em" }}
                    />{" "}
                    提出が必要です
                  </a>
                </Link>
              </p>
            );
          if (status === "pending") 
            return (
                <p>
                本人確認書類:{" "}確認中</p>
            );
          if (status === "verified")
            return (
              <p>
                本人確認書類:{" "}
                <FontAwesomeIcon
                  icon={faCheckSquare}
                  style={{ color: "#00DD00", marginLeft: "0.5em" }}
                />{" "}
                確認済
              </p>
            );
        })()}
      </FormGroup>
      <FormGroup style={{ marginBottom: "1em" }}>
        <Link href={`/users/${user.uid}/bankAccounts`}>
          <a>売上振り込み用 銀行口座を追加・修正する</a>
        </Link>
      </FormGroup>

      <FormGroup style={{ marginBottom: "1.5em" }}>
        <h4>売上と入金</h4>
        <p>
          入金待ち: {balance.available[0].amount} 円<br />
          暫定売上(確認中): {balance.pending[0].amount} 円
        </p>
      </FormGroup>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { firestore } = await initFirebaseAdmin();
  const paths = (await firestore.collection("users").get()).docs.map(
    (doc) => `/users/${doc.id}/edit/organizer`
  );

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params;
  const { individual } = await stripeAccounts(id);
  const verification = individual ? individual.verification : null;
  const status = verification && verification.status;
  const balance = await stripeBalance(id);
  return { props: { status, balance }, revalidate: 1 };
};

export default withAuth(Organizer);
