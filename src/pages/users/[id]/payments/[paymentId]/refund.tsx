import React, { useState, useEffect } from 'react';
import {
  Button, Row, Form, Input, FormGroup, Label} from 'reactstrap';
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, GetServerSideProps } from 'next'
import { useAlert } from 'react-alert';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import { fuego } from '@nandorojo/swr-firestore';
import { encodeQuery } from '@/src/lib/parseQuery';
import Loading from '@/src/components/loading';
import withAuth from '@/src/lib/withAuth';
import { payment, event } from 'app';

const Refund = ({
  user,
  createdUser,
  payment,
}) => {
  const router = useRouter();
  const alert = useAlert();
  type select = "" | "mistake" | "fraud" | "other";
  type problem = "" | "event" | "payment" | "system";
  type sentTo = "" | "user" | "system";
  const [select, setSelect] = useState("" as select);
  const [problem, setProblem] = useState("" as problem);
  const [detailText, setDetailText] = useState("");
  const [sentTo, setSentTo] = useState("" as sentTo);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return;
    if (user.uid === createdUser) {
      (async () => fuego.auth().signOut())();
      return;
    }
    setLoading(false);
  }, [user]);

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

  // TODO: 返金失敗時のWebhock用API作成
  const createRefund = async (reason: select | problem) => {
    setLoading(true);

    try {
      let reasonText = "";
      switch (reason) {
        case "fraud":
          reasonText = "詐欺・事実と異なるイベント内容";
          break;
        case "event":
          reasonText = "その他イベントについて";
          break;
        case "payment":
          reasonText = "決済処理について";
          break;
        case "system":
          reasonText = "その他システム関連";
          break;
        default:
          throw new Error();
      }

      const res = await fetch("/api/sendRefundRequest", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          reason,
          reasonText,
          detailText,
          seller: payment.seller,
          buyer: payment.buyer,
          paymentId: router.query.paymentId,
        }),
      });
      if (res.status !== 200) throw new Error()
      router.push({
        pathname: `/users/${user.uid}/myTickets`,
        query: {
          msg: encodeQuery(
            "問い合わせを行いました。三日以内に対応されない場合は再度申請を行うことで返金処理が行われます。"
          ),
        },
      });
    } catch (e) {
      console.error(e.message);
      alert.error("エラーが発生しました。しばらくしてお試しください。");
      setLoading(false);
    }
  };

  const contactAdmin = async (reason: select | problem) => {
    setLoading(true);
    
    try {
      await fuego.db.collection("contact").add({
        category: "refund",
        text: detailText,
        info: {
          paymentId: router.query.paymentId,
          reason,
        },
      });
      router.push({
        pathname: `/users/${user.uid}/myTickets`,
        query: {
          msg: encodeQuery(
            "システム管理者に調査を依頼しました。"
          ),
        },
      });
    } catch(e) {
      console.error(e.message);
      alert.error("エラーが発生しました。しばらくしてお試しください。");
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    let reason: select | problem;
    switch (select) {
      case "mistake":
        return alert.error(
          "購入したチケットは販売者に責任がある場合を除き返金できません。詳しくは利用規約をご確認ください。"
        );
      case "fraud":
        if (!detailText) return alert.error("詳細を記入してください");
        reason = select;
        break;
      case "other":
        if (!problem) return alert.error("選択肢から選択してください");
        if (!detailText) return alert.error("詳細を記入してください");
        reason = problem;
        break;
      default:
        return alert.error("返金理由を選択してください");
    }
    if (sentTo === 'user') return createRefund(reason);
    contactAdmin(reason);
  };

  if (loading) return <Loading />

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
          <option value="fraud">詐欺・事実と異なるイベント内容</option>
          <option value="other">その他</option>
        </Input>
      </FormGroup>
      {select === "other" && (
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
      )}
      {(select === "fraud" || select === "other") && (
        <FormGroup>
          <Input
            type="textarea"
            placeholder="詳細を記入してください"
            value={detailText}
            onChange={(e) => setDetailText(e.target.value)}
          />
        </FormGroup>
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

// export const getStaticPaths: GetStaticPaths = async () => {
//   const { firestore } = await initFirebaseAdmin();
//   let paths = []
//   await Promise.all(
//     (await firestore.collection("events").get()).docs.map(async(event) =>
//       (await firestore.collection("payments").get()).docs.map(
//         (payment) => {
//           return paths.push({ params: { eventId: event.id, paymentId: payment.id }})
//         }
//       )
//     )
//   )
//   return { paths, fallback: true };
// };

export const getServerSideProps: GetServerSideProps = async ({query}) => {
  const { paymentId } = query;
  const { firestore } = await initFirebaseAdmin()
  const payment = (await firestore.collection("payments").doc(paymentId as string).get()).data()
  const event = (
    await firestore
      .collection("events")
      .doc(payment.event)
      .get()
  ).data();
  return {
    props: { createdUser: event.createdUser, payment },
  };
}

export default withAuth(Refund)