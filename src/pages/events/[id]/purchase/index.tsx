import { useRouter } from 'next/router'
import React, { useState, useRef, useEffect } from 'react'
import {
  Form,
  FormGroup,
  Button,
  Label,
  Input,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
} from 'reactstrap'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import getImg from '@/src/lib/getImgSSR'
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'
import { event, category } from 'app'
import { encodeQuery } from '@/src/lib/parseQuery'
import withAuth from '@/src/lib/withAuth'

export const Purchase = ({ user, event, categories, photoUrls }) => {
  const router = useRouter()
  const familyNameRef = useRef(null)
  const firstNameRef = useRef(null)
  const emailRef = useRef(null)
  const [invalidEmail, setInvalidEmail] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id)

  useEffect(() => {
    if (!router) return
    if (categories.length === 0)
      router.push({
        pathname: `/events/${router.query.id}`,
        query: { msg: encodeQuery('チケットは全て売り切れです。') },
      })
  }, [router])

  const validationEmail = () => {
    setInvalidEmail(
      !emailRef.current.value.match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      ),
    )
  }

  const submit = (e) => {
    e.preventDefault()
    if (categories.length === 0) return
    if (
      !emailRef.current.value.match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      ) ||
      !firstNameRef.current.value ||
      !familyNameRef.current.value
    )
      return
    const pathname = `/events/${router.query.id}/purchase/confirm`
    // クエリーをまるごとbase64化
    router.push({
      pathname,
      query: {
        query: encodeQuery(
          JSON.stringify({
            familyName: familyNameRef.current.value,
            firstName: firstNameRef.current.value,
            email: emailRef.current.value,
            selectedCategory,
            uid: user.uid,
          }),
        ),
      },
    })
  }

  return (
    <Form style={{ marginTop: '5em' }} onSubmit={submit}>
      <FormGroup>
        <Label>お名前</Label>
        <Row>
          <Col xs="6">
            <Input
              type="text"
              name="familyName"
              placeholder="性"
              innerRef={familyNameRef}
              invalid={!familyNameRef.current?.value}
            />
          </Col>
          <Col xs="6">
            <Input
              type="text"
              name="firstName"
              placeholder="名"
              innerRef={firstNameRef}
              invalid={!firstNameRef.current?.value}
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Label>メールアドレス</Label>
        <Input
          type="email"
          name="email"
          placeholder="メールアドレス"
          defaultValue={user.email}
          innerRef={emailRef}
          onBlur={validationEmail}
          invalid={invalidEmail}
        />
      </FormGroup>
      <FormGroup>
        <Label>イベント情報</Label>
        <Card>
          <CardBody>
            <Row>
              <Col sm="2" xs="3">
                <img width="100%" src={photoUrls[0]} alt="image" />
              </Col>
              <Col xs="auto">
                <CardTitle>{event.name}</CardTitle>
                <CardSubtitle>開催地: {event.placeName}</CardSubtitle>
              </Col>
            </Row>
            <Row style={{ marginTop: '0.5em' }}>
              <Col>
                <Label>チケットカテゴリ</Label>
                <Input
                  type="select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Input>
              </Col>
            </Row>
            <Row className="flex-row-reverse">
              <h4 style={{ marginTop: '1em', marginRight: '1em' }}>
                {categories.filter((category) => category.id === selectedCategory)[0]?.price} 円
              </h4>
            </Row>
          </CardBody>
        </Card>
      </FormGroup>
      <Row className="flex-row-reverse">
        <Button style={{ marginRight: '1em' }}>購入手続きへ</Button>
      </Row>
    </Form>
  )
}

// export const getStaticPaths: GetStaticPaths = async () => {
//     const { firestore } = await initFirebaseAdmin()
//     const paths = await Promise.all((await firestore.collection('events').get()).docs.map(doc => `/events/${doc.id}/purchase`))
//     return { paths, fallback: true }
// }

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query
  const { firestore } = await initFirebaseAdmin()
  const data = (
    await firestore
      .collection('events')
      .doc(id as string)
      .get()
  ).data() as event
  const photos: undefined | string[] = data.photos
  const photoUrls = photos.length
    ? await Promise.all(photos.map(async (photo) => getImg(photo, data.createdUser)))
    : ['/images/event_default_360x360.jpg']
  const startDate = data.startDate.seconds
  const endDate = data.endDate.seconds
  const event = { ...data, startDate, endDate }
  const categoriesSnapShot = await firestore
    .collection('events')
    .doc(id as string)
    .collection('categories')
    .orderBy('index')
    .get()
  const categories: FirebaseFirestore.DocumentData[] = []
  categoriesSnapShot.forEach((e) => {
    const id = e.id
    const category = e.data() as category
    category.public && category.stock - category.sold > 0 && categories.push({ ...category, id })
  })
  return { props: { event, categories, photoUrls } }
}

export default withAuth(Purchase)
