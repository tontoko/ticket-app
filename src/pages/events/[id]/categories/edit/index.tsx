import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Form, FormGroup, Button, Input, Container, Row, Col, Label } from 'reactstrap'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { GetServerSideProps } from 'next'
import { event } from 'events'
import isLogin from '@/src/lib/isLogin'
import { useAlert } from 'react-alert'

export default ({event, beforeCategories}) => {
  const router = useRouter()
  const alert = useAlert()

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
    const setStock = (stock: string) => {
      if (Number(stock) < 0) return
      const copyCategories = [...categories]
      copyCategories[i] = { ...copyCategories[i], stock }
      setCategories(copyCategories)
    }
    const setPublic = (value: boolean) => {
      const copyCategories = [...categories]
      copyCategories[i] = { ...copyCategories[i], public: value }
      setCategories(copyCategories)
    }
    const deleteCategory = () => {
      const copyCategories = [...categories]
      copyCategories.splice(i,1)
      setCategories(copyCategories)
    }
    return (
        <FormGroup key={i} style={{ border: "solid 1px gray", padding: '0.5em'}}>
          <Row style={{ margin: 0, marginTop: '0.5em' }}>
            <Col xs="11">
              <Input value={category.name} onChange={e => setName(e.target.value)} disabled={!category.new} placeholder="チケットカテゴリ名" />
            </Col>
            <Col xs="1" style={{ padding: 0, display: 'flex', alignItems: 'center'}}>
              {category.new && 
                <div style={{ margin: 0, opacity: '0.6', display: 'flex', alignItems: 'center' }} onClick={deleteCategory}>
                  <FontAwesomeIcon icon={faTimesCircle} size="sm" style={{ color: "black" }} className="fa-2x" />
                </div>
              }
            </Col>
          </Row>
          <Row style={{ margin: 0, marginTop: '0.5em' }}>
            <Col sm="12" md='4' lg='3' style={{ display: 'flex', marginTop: '0.5em'}}>
              <Input type='number' min='0' value={category.price} onChange={e => setPrice(e.target.value)} style={{textAlign: 'right'}} disabled={!category.new} />
              <p style={{margin: 'auto 0', marginLeft: '0.5em'}}> 円</p>
            </Col>
          <Col sm="12" md='4' lg='3' style={{ display: 'flex', marginTop: '0.5em' }}>
            <Input type='number' min='0' value={category.stock} onChange={e => setStock(e.target.value)} style={{ textAlign: 'right' }} disabled={!category.new} />
            <p style={{ margin: 'auto 0', marginLeft: '0.5em' }}> 枚</p>
          </Col>
          <Col style={{display: "flex",alignItems: "center", marginTop: '0.5em'}}>
            <Label for="public" style={{margin: 0, fontWeight: "bold"}}>公開する</Label>
            <Input type="checkbox" name="public" checked={category.public} onChange={e => setPublic(e.target.checked)} style={{margin: 0, marginLeft: '0.3em', position: "initial"}}/>
          </Col>
          </Row>
        </FormGroup>
      )
    }
  )

  const addCategory = () => {
    const copyCategories = categories ? [...categories] : []
    copyCategories.push({name: '', price: 0, public: false, stock: 0, new: true})
    setCategories(copyCategories)
  }

  const submit = () => {
    let names = []
    let valid = true
    categories.filter(e => {
      if (names.indexOf(e["name"]) === -1) {
        names.push(e["name"])
        return e
      }
      valid = false
    })
    if (!valid) return alert.error('チケット名が重複しています')
    router.push(`/events/${router.query.id}/categories/edit/[confirm]`, `/events/${router.query.id}/categories/edit/${JSON.stringify(categories)}`)
  }
  
  return (
    <Container>
      <Form style={{ marginTop: '5em' }}>
        <h5 style={{marginBottom: '1em'}}>カテゴリ一覧</h5>
        {renderCategories()}
        <Button onClick={addCategory}>追加</Button>
        <Row className="flex-row-reverse" style={{marginTop: '2em'}}>
          <Button style={{ marginRight: '1em' }} onClick={submit} >確認</Button>
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
  const endDate = data.endDate.seconds
  const event = { ...data, createdAt, updatedAt, startDate, endDate, id: result.id }
  const categoriesSnapShot = (await firestore.collection('events').doc(query.id as string).collection('categories').get())
  let categories: FirebaseFirestore.DocumentData[] = []
  categoriesSnapShot.forEach(e => {
    const id = e.id
    const category = e.data()
    categories.push({...category, id})
  })
  return { props: { event, beforeCategories: categories }}
}