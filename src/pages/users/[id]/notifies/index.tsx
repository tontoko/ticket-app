import { Row, Col, Card, CardBody } from "reactstrap";
import { useEffect, useState } from "react";
import Loading from '@/src/components/loading'
import { useRouter } from "next/router";
import withAuth from "@/src/lib/withAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { fuego } from "@nandorojo/swr-firestore";

const Notifies = ({user}) => {
  const [notifies, setNotifies] = useState([])
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    (async () => {
      fuego.db
        .collection("users")
        .doc(user.uid)
        .collection("notifies").onSnapshot(async snap => {
          const tmpNotifies = await Promise.all(snap.docs.map(async (doc) => {return {...doc.data(), id: doc.id} }));
          setNotifies(tmpNotifies)
          setLoading(false);
        })
    })()
  }, [])

  const clickLinkWithsaveAsRead = async (id, url) => {
    if (!fuego) return;
    await fuego.db
      .collection("users")
      .doc(user.uid)
      .collection("notifies")
      .doc(id)
      .update({
        read: true,
      });
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

  if (loading) return <Loading />;

  return (
    <>
      <h4 style={{ marginBottom: "1em" }}>通知</h4>
      {renderNotifies()}
    </>
  );
}

export default withAuth(Notifies);