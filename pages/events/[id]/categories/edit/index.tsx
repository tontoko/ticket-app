import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Form, FormGroup, Button, Input, Container, Row, Col } from 'reactstrap'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { GetServerSideProps } from 'next'
import { event } from 'events'
import isLogin from '@/lib/isLogin'

export default ({event, beforeCategories}) => {
  const router = useRouter();

  const [categories, setCategories] = useState(beforeCategories)

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
            <Col style={{marginTop: '0.5em'}}>
              <Input value={category.name} onChange={e => setName(e.target.value)} />
            </Col>
            <Col sm="12" md='4' lg='3' style={{ display: 'flex', marginTop: '0.5em'}}>
              <Input type='number' min='0' value={category.price} onChange={e => setPrice(e.target.value)} style={{textAlign: 'right'}} />
              <p style={{margin: 'auto 0', marginLeft: '0.5em'}}> 円</p>
            <p style={{ margin: 'auto', marginLeft: '0.5em', opacity: '0.6' }} onClick={deleteCategory}><FontAwesomeIcon icon={faTimesCircle} size="sm" style={{ color: "black" }} className="fa-2x" /></p>
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const {query} = ctx
  const { user } = await isLogin(ctx)
  const { firestore } = await initFirebaseAdmin()
  const result = (await firestore.collection('events').doc(query.id as string).get())
  const data = result.data() as event
  const createdAt = data.createdAt.seconds
  const updatedAt = data.updatedAt.seconds
  const startDate = data.startDate.seconds
  const event = { ...data, createdAt, updatedAt, startDate, id: result.id }
  const {categories} = event
  return { props: { event, beforeCategories: categories }}
}