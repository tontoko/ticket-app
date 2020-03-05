// todo




import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import {
  Form, FormGroup, Button, Label, Input, Container, Row, Col, Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle,
} from 'reactstrap'
import initFirebase from '../../../../../initFirebase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import Loading from '../../../../../components/loading'

export default props => {
  const router = useRouter();

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const firebase = await initFirebase()
      const firestore = firebase.firestore()
      const event = await firestore.collection('events').doc(router.query.id as string).get()
      setCategories(event.data().categories)
      setLoading(false)
    })()
  }, [])

  const renderCategories = () => categories && categories.map((category: firebase.firestore.DocumentData, i) => {
    const setName = (name:string) => {
      const copyCategories = [...categories]
      copyCategories[i] = { ...copyCategories[i], name }
      setCategories(copyCategories)
    }
    const setPrice = (price:string) => {
      if (Number(price) < 0) return
      const copyCategories = [...categories]
      copyCategories[i] = {...copyCategories[i], price}
      setCategories(copyCategories)
    }
    const deleteCategory = () => {
      const copyCategories = [...categories]
      copyCategories.splice(i,1)
      setCategories(copyCategories)
    }
    return (
        <FormGroup key={i}>
          <Row style={{margin: 0}}>
            <Col>
              <Input value={category.name} onChange={e => setName(e.target.value)} />
            </Col>
            <Col sm='4' md='3' lg='2' style={{display: 'flex'}}>
              <Input type='number' min='0' value={category.price} onChange={e => setPrice(e.target.value)} style={{textAlign: 'right'}} />
              <p style={{margin: 'auto 0', marginLeft: '0.5em'}}> 円</p>
              <p style={{marginLeft: '1em'}} onClick={deleteCategory}><FontAwesomeIcon icon={faTimesCircle} size="sm" style={{ color: "black" }} className="fa-2x" /></p>
            </Col>
          </Row>
        </FormGroup>
      )
    }
  )

  const addCategory = () => {
    const copyCategories = categories ? [...categories] : []
    copyCategories.push({name: '', price: 0})
    setCategories(copyCategories)
  }
  if (loading) return <Loading/>

  return (
    <Container>
      <Form style={{ marginTop: '5em' }}>
        <h5 style={{marginBottom: '1em'}}>カテゴリ一覧</h5>
        {renderCategories()}
        <Button onClick={addCategory}>追加</Button>
        <Row className="flex-row-reverse" style={{marginTop: '2em'}}>
          <Link href={`/events/${router.query.id}/categories/edit/[confirm]`} as={`/events/${router.query.id}/categories/edit/${JSON.stringify(categories)}`}>
            <Button style={{ marginRight: '1em' }}>確認</Button>
          </Link>
        </Row>
      </Form>
    </Container>
  );
}