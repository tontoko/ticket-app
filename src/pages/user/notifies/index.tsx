import { GetServerSideProps } from "next"
import isLogin from "@/src/lib/isLogin"
import initFirebase from "@/src/lib/initFirebase"
import { Row, Col, Button, Card, CardBody } from "reactstrap";
import { useEffect, useState } from "react";
import Loading from '@/src/components/loading'
import { useRouter } from "next/router";

let firestore: undefined | firebase.firestore.Firestore;

const Notifies = ({user}) => {
  const [notifies, setNotifies] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    let cancelListner: () => void;

    (async () => {
      firestore = (await initFirebase()).firestore
      cancelListner = firestore
        .collection("users")
        .doc(user.uid)
        .collection('notifies')
        .onSnapshot(async (snapshot) => {
          let tmpNotifies: firebase.firestore.DocumentData[] = [];
          await Promise.all(snapshot.docs.map(async (doc) => tmpNotifies.push({...doc.data(), id: doc.id})));
          setNotifies(tmpNotifies)
          setIsLoading(false);
        });
    })()

    return () => {
      cancelListner();
    }
  }, [])

  const clickLinkWithsaveAsRead = async (id, url) => {
    if (!firestore) return
    await firestore
      .collection("users")
      .doc(user.uid)
      .collection("notifies")
      .doc(id)
      .update({
        read: true
      })
    router.push(url)
  }

  const renderNotifies = () => {
    if (!notifies.length) return <p>表示される通知はありません。</p>;

    return notifies.map((notify, i) => {
      return (
        <Row
          onClick={() => clickLinkWithsaveAsRead(notify.id, notify.url)}
          key={i}
        >
          <Col xs="12" style={{ padding: "0", cursor: "pointer" }}>
            <Card style={{ height: "100%", width: "100%" }}>
              <CardBody>{notify.text}</CardBody>
            </Card>
          </Col>
        </Row>
      );
    });
  }

  if (isLoading) return <Loading />

  return (
    <>
      <h4 style={{ marginBottom: "1em" }}>通知</h4>
      {renderNotifies()}
    </>
  );
}

export default Notifies;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx)
  return { props: { user } }
}