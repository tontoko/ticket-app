import { GetServerSideProps } from "next"
import isLogin from "@/src/lib/isLogin"
import initFirebase from "@/src/lib/initFirebase"
import { Row, Col, Button } from "reactstrap";
import { useEffect, useState } from "react";
import Loading from '@/src/components/loading'

const messages = ({user}) => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelListner: () => void;

    (async () => {
      const { firestore } = await initFirebase()
      cancelListner = firestore
        .collection("messages")
        .where("relatedUsers", "array-contains", user.uid)
        .onSnapshot(async (snapshot) => {
          let tmpMessages: firebase.firestore.DocumentData[];
          await Promise.all(snapshot.docs.map(async (doc) => tmpMessages.push(doc.data())));
          setMessages;(tmpMessages)
          setIsLoading(false);
        });
    })()

    return () => {
      cancelListner();
    }
  }, [])

  if (isLoading) return <Loading />

  return (
    <>
      <Row>
        <Col sm="3" style={{ border: 'solid 1px gray', borderRadius: '5px' }}>
          <Button></Button>
        </Col>
        <Col sm="9" style={{ border: 'solid 1px gray', borderRadius: '5px' }}>
        </Col>
      </Row>
    </>
  );
}

export default messages

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx)
  return { props: { user } }
}