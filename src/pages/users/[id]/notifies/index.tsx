import { Row, Col, Card, CardBody } from 'reactstrap'

import Loading from '@/src/components/loading'
import { useRouter } from 'next/router'
import withAuth from '@/src/lib/withAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { fuego, useCollection } from '@nandorojo/swr-firestore'
import { notify } from 'app'

const Notifies = ({ user }) => {
  const router = useRouter()
  const { data: notifies, loading } = useCollection<notify>(user && `users/${user.uid}/notifies`, {
    orderBy: ['createdAt', 'desc'],
    listen: true,
  })

  const clickLinkWithsaveAsRead = async (id, url) => {
    if (!fuego) return
    await fuego.db.collection('users').doc(user.uid).collection('notifies').doc(id).update({
      read: true,
    })
    router.push(url)
  }

  const renderNotifies = () => {
    if (!notifies.length) return <p>表示される通知はありません。</p>

    return notifies.map((notify, i) => {
      return (
        <Row onClick={() => clickLinkWithsaveAsRead(notify.id, notify.url)} key={i}>
          <Col xs="12" style={{ padding: '0', cursor: 'pointer' }}>
            <Card
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: notify.read ? 'gainsboro' : null,
              }}
            >
              <CardBody>
                <FontAwesomeIcon
                  icon={notify.read ? faCheckCircle : faExclamationCircle}
                  style={{ color: notify.read ? '#00DD00' : 'orange' }}
                />{' '}
                {notify.text}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )
    })
  }

  if (loading) return <Loading />

  return (
    <>
      <h4 style={{ marginBottom: '1em' }}>通知</h4>
      {renderNotifies()}
    </>
  )
}

export default withAuth(Notifies)
