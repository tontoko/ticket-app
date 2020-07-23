import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Form, FormGroup, Button, Input, Container, Row, Col, Label } from 'reactstrap'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'
import { GetServerSideProps } from 'next'
import { event } from 'events'
import isLogin from '@/src/lib/isLogin'
import { useAlert } from 'react-alert'
import { encodeQuery } from '@/src/lib/parseQuery'

// TODO: 確認画面を統合
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
    const setPrice = (price:number) => {
      if (price < 0) return
      const copyCategories = [...categories]
      copyCategories[i] = {...copyCategories[i], price}
      setCategories(copyCategories)
    }
    const setStock = (stock: number) => {
      if (stock < 0) return
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
    const moveArrayElementToPrev = () => {
      const copyCategory = [...categories]
      const reversedCategories = [copyCategory[i], copyCategory[i-1]]
      const beginCategories = i-1 > 0 ? copyCategory.slice(0, i-1) : []
      const endCategories = i < categories.length-1 ? copyCategory.slice(i+1) : []
      setCategories([...beginCategories, ...reversedCategories, ...endCategories])
    }
    const moveArrayElementToNext = () => {
      const copyCategory = [...categories]
      const reversedCategories = [copyCategory[i+1], copyCategory[i]]
      const beginCategories = i !== 0 ? copyCategory.slice(0, i) : []
      const endCategories = i < categories.length-2 ? copyCategory.slice(i+2) : []
      setCategories([...beginCategories, ...reversedCategories, ...endCategories])
    }
    return (
        <FormGroup key={i} style={{ border: "solid 1px gray", borderRadius: '8px', padding: '0.8em' }}>
          <Row form>
            <div style={{ width: '1em' }}>
              <Row form style={{ height: '50%', position: 'relative' }}>
                {i !== 0 &&
                <FontAwesomeIcon icon={faSortUp} style={{ color: "gray", margin: 0, height: '60%', cursor: 'pointer', position: 'absolute', top: '0.1em', left: '0.25em' }} className="fa-2x" onClick={moveArrayElementToPrev} />
                }
              </Row>
              <Row form style={{ height: '50%', position: 'relative' }}>
                {i !== categories.length - 1 && 
                <FontAwesomeIcon icon={faSortDown} style={{ color: "gray", margin: 0, height: '60%', cursor: 'pointer', position: 'absolute', bottom: '0.1em', left: '0.25em' }} className="fa-2x" onClick={moveArrayElementToNext} />
                }
              </Row>
            </div>
            <Col>
              <Row style={{ margin: 0, marginTop: '0.5em' }}>
                  <Col xs="11">
                    <Input value={category.name} onChange={e => setName(e.target.value)} disabled={!category.new} placeholder="チケットカテゴリ名" />
                  </Col>
                  <Col xs="1" style={{ padding: 0, display: 'flex', alignItems: 'center'}}>
                    {category.new && 
                      <FontAwesomeIcon icon={faTimesCircle} style={{ color: "gray", margin: 0, height: '60%', cursor: 'pointer' }} className="fa-2x" onClick={deleteCategory} />
                    }
                  </Col>
              </Row>
              <Row style={{ margin: 0, marginTop: '0.5em' }}>
                <Col sm="12" md='4' lg='3' style={{ display: 'flex', marginTop: '0.5em'}}>
                  <Input type='number' min='0' value={category.price} onChange={e => setPrice(parseInt(e.target.value, 10))} style={{textAlign: 'right'}} disabled={!category.new} />
                  <p style={{margin: 'auto 0', marginLeft: '0.5em'}}> 円</p>
                </Col>
              {!category.new && 
              <Col sm="12" md='4' lg='3' style={{ display: 'flex', marginTop: '0.5em' }}>
                <p style={{ margin: 'auto 0', marginLeft: '0.5em' }}>{category.sold} 枚 (残り {(category.stock - category.sold) ? (category.stock - category.sold) : 0} 枚)</p>
              </Col>
              }
              <Col sm="12" md='4' lg='3' style={{ display: 'flex', marginTop: '0.5em' }}>
                <Input type='number' min='0' value={category.stock} onChange={e => setStock(parseInt((e.target.value ? e.target.value : '0'), 10))} style={{ textAlign: 'right' }} />
                <p style={{ margin: 'auto 0', marginLeft: '0.5em' }}> 枚</p>
              </Col>
              <Col style={{display: "flex",alignItems: "center", marginTop: '0.5em'}}>
                <Label for="public" style={{margin: 0, fontWeight: "bold"}}>公開する</Label>
                <Input type="checkbox" name="public" checked={category.public} onChange={e => setPublic(e.target.checked)} style={{margin: 0, marginLeft: '0.3em', position: "initial"}}/>
              </Col>
              </Row>
            </Col>
          </Row>
        </FormGroup>
      )
    }
  )

  const addCategory = () => {
    const copyCategories = categories ? [...categories] : []
    copyCategories.push({name: '', price: 500, public: false, stock: 1, new: true})
    setCategories(copyCategories)
  }

  const submit = () => {
    try {
      let names = []
      categories.filter(e => {
        if (!e.name) throw new Error('チケット名を入力してください。')
        if (e.price < 500) throw new Error('チケットの価格は500円以上に設定してください。')
        if (e.stock < 1 && e.new) throw new Error('チケットの在庫は1枚以上に設定してください。')
        if (!e.new && e.stock - e.sold < 0) throw new Error('チケットの在庫は売り上げ分を引いて0枚以上に設定してください。')
        if (names.indexOf(e["name"]) === -1) {
          names.push(e["name"])
          return e
        }
        throw new Error('チケット名が重複しています')
      })
      console.log(encodeQuery(JSON.stringify(categories)));
      router.push(`/events/[id]/categories/edit/[confirm]`, `/events/${router.query.id}/categories/edit/${encodeQuery(JSON.stringify(categories))}`)
    } catch(e) {
      alert.error(e.message)
    }
  }

  return (
          <Form style={{ marginTop: '5em' }}>
        <h5 style={{marginBottom: '1em'}}>カテゴリ一覧</h5>
        {renderCategories()}
        <Button onClick={addCategory}>カテゴリ追加</Button>
        <Row className="flex-row-reverse" style={{marginTop: '2em'}}>
          <Button style={{ marginRight: '1em' }} onClick={submit} >確認</Button>
        </Row>
      </Form>
      );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const {query} = ctx
  const { user } = await isLogin(ctx, 'redirect')
  const { firestore } = await initFirebaseAdmin()
  const result = (await firestore.collection('events').doc(query.id as string).get())
  const data = result.data() as event
  const startDate = data.startDate.seconds
  const endDate = data.endDate.seconds
  const event = { ...data, startDate, endDate, id: result.id }
  const categoriesSnapShot = (await firestore.collection('events').doc(query.id as string).collection('categories').orderBy('index').get())
  let categories: FirebaseFirestore.DocumentData[] = []
  categoriesSnapShot.forEach(e => {
    const id = e.id
    const category = e.data()
    categories.push({...category, id})
  })
  return { props: { user, event, beforeCategories: categories }}
}