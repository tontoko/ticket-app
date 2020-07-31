import { GetStaticPaths } from "next"
import { Row, Col, Card, CardBody } from "reactstrap";
import { useEffect, useState } from "react";
import Loading from '@/src/components/loading'
import { useRouter } from "next/router";
import initFirebaseAdmin from "@/src/lib/initFirebaseAdmin";
import { useCollection } from "react-firebase-hooks/firestore";
import { firestore } from "@/src/lib/initFirebase";
import withAuth from "@/src/lib/withAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const Notifies = ({user}) => {
  const [notifies, setNotifies] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()
  const [snapshot, loading] = useCollection(
    firestore.collection("users").doc(user.uid).collection("notifies"));

  useEffect(() => {
    (async () => {
      if (loading || !snapshot) return
      let tmpNotifies: firebase.firestore.DocumentData[] = [];
      await Promise.all(snapshot.docs.map(async (doc) => tmpNotifies.push({...doc.data(), id: doc.id})));
      setNotifies(tmpNotifies)
      setIsLoading(false);
    })()
  }, [loading, snapshot])

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
            <Card
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: notify.read ? "gainsboro" : null,
              }}
            >
              <CardBody>
                <FontAwesomeIcon
                icon={notify.read ? faCheckCircle : faExclamationCircle}
                  style={{ color: notify.read ? "#00DD00": 'orange' }}
                />{' '}
                {notify.text}
              </CardBody>
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

export default withAuth(Notifies);