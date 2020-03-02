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

export default props => {
  const router = useRouter();

  const [categories, setCategories] = useState([])

  useEffect(() => {
    (async () => {
      const firebase = await initFirebase()
      const firestore = firebase.firestore()
      const categoryResult = await firestore.collection('events').doc(router.query.id as string).collection('categories').get()
      const EventResult = await firestore.collection('events').doc(router.query.id as string).get()
      const { createdUser } = EventResult.data()
      if (createdUser !== props.user.uid) router.push('/user')
      setCategories(categoryResult.docs.map(v => v.data()))
    })()
  }, [])

  const submit = () => {
    
  }

  const renderCategories = () => categories.map((category: firebase.firestore.DocumentData, i) => {
    const setPrice = (i, price) => {
      const copyCategories = [...categories]
      copyCategories[i] = {...copyCategories[i], price}
      setCategories(copyCategories)
    }
    return (
        <FormGroup key={i}>
          <Row style={{margin: 0}}>
            <Col>
              <Input value={category.name} />
            </Col>
            <Col sm='4' md='3' lg='2' style={{display: 'flex'}}>
                <Input type='number' value={category.price} onChange={e => setPrice(i, e.target.value)} style={{textAlign: 'right'}} />
                <p style={{margin: 'auto 0', marginLeft: '0.5em'}}> 円</p>
            </Col>
          </Row>
        </FormGroup>
      )
    }
  )

  return (
    <Container>
      <Form style={{ marginTop: '5em' }}>
        <h5 style={{marginBottom: '1em'}}>カテゴリ一覧</h5>
        {renderCategories()}
        <Row className="flex-row-reverse" style={{marginTop: '2em'}}>
          <Button style={{ marginRight: '1em' }} onClick={() => submit()}>確認</Button>
        </Row>
      </Form>
    </Container>
  );
}