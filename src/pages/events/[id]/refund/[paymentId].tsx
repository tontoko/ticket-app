import React, { useState, useEffect } from 'react';
import {
  Button, Container, Col, Row, Form, Input, FormGroup, Label, InputGroup
} from 'reactstrap';
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import isLogin from '@/src/lib/isLogin'
import { useAlert } from 'react-alert';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import initFirebase from '@/src/lib/initFirebase';
import { encodeQuery } from '@/src/lib/parseQuery';

export default ({ user, createdUser }) => {
  const router = useRouter();
  const alert = useAlert();
  type select = "" | "mistake" | "fraud" | "other";
  type problem = "" | "event" | "payment" | "system";
  type sentTo = "" | "user" | "system";
  const [select, setSelect] = useState("" as select);
  const [problem, setProblem] = useState("" as problem);
  const [detailText, setDetailText] = useState("");
  const [sentTo, setSentTo] = useState("" as sentTo);

  const sentMessage = async () => {
    console.log(detailText);
    const { firestore } = await initFirebase();
    const receivedUser = sentTo === 'user' ? createdUser : 'admin';
    try {
      await firestore.collection("messages").add({
        sendUser: user.uid,
        receivedUser,
        text: detailText,
      });
      router.push({ pathname: `/user/myTickets`, query: { msg: encodeQuery('問い合わせを行いました。三日以内に対応されない場合は自動的に返金されます。') } });
    } catch(e) {
      alert.error('エラーが発生しました。しばらくしてお試しください。')
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!sentTo) return;
    switch (select) {
      case "mistake":
        alert.error(
          "購入したチケットは販売者に責任がある場合を除き返金できません。詳しくは利用規約をご確認ください。"
        );
        break;
      case "fraud":
        if (!detailText) return alert.error("詳細を記入してください");
        sentMessage();
        break;
      case "other":
        if (!problem) return alert.error("選択肢から選択してください");
        if (!detailText) return alert.error("詳細を記入してください");
        sentMessage();
        break;
      default:
        alert.error("返金理由を選択してください");
        break;
    }
  };

  useEffect(() => {
    if (select === "other") {
      switch (problem) {
        case "event":
          return setSentTo("user");
        case "payment":
          return setSentTo("system");
        case "system":
          return setSentTo("system");
      }
    }
    switch (select) {
      case "mistake":
        return setSentTo("");
      case "fraud":
        return setSentTo("user");
      default:
        return setSentTo("");
    }
  }, [select, problem]);

  return (
    <Form style={{ marginTop: "2em" }} onSubmit={submit}>
      <FormGroup>
        <h4>返金申請</h4>
        <p>返金理由を選択してください</p>
        <Input
          type="select"
          value={select}
          onChange={(e) => setSelect(e.target.value as select)}
        >
          <option value="">選択してください</option>
          <option value="mistake">間違ったチケットを購入してしまった</option>
          <option value="fraud">
            実際のイベント内容が記載内容と大きく異なった
          </option>
          <option value="other">その他</option>
        </Input>
      </FormGroup>
      {select === "fraud" && (
        <FormGroup>
          <Input
            type="textarea"
            placeholder="詳細を記入してください"
            value={detailText}
            onChange={(e) => setDetailText(e.target.value)}
          />
        </FormGroup>
      )}
      {select === "other" && (
        <>
          <FormGroup>
            <Label>問題はどこで発生していますか？</Label>
            <Input
              type="select"
              value={problem}
              onChange={(e) => setProblem(e.target.value as problem)}
            >
              <option value="">選択してください</option>
              <option value="event">このイベントについて</option>
              <option value="payment">決済について</option>
              <option value="system">不具合・その他</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Input
              type="textarea"
              placeholder="詳細を記入してください"
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
            />
          </FormGroup>
        </>
      )}
      <Row form>
        <Button className="ml-auto">
          {(() => {
            switch (sentTo) {
              case "user":
                return "主催者に問い合わせる";
              case "system":
                return "調査を依頼する";
              default:
                return "送信";
            }
          })()}
        </Button>
      </Row>
    </Form>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user, query, res } = await isLogin(ctx, 'redirect')
  const { firestore } = await initFirebaseAdmin()
  const eventData = (await firestore.collection("events").doc(query.id as string).get()).data()
  if (user && user.uid === eventData.createdUser) {
    res.writeHead(302, {
      Location: "/",
    });
    res.end();
  }
  return { props: { user, query, createdUser: eventData.createdUser } };
}