import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState, useRef, useMemo } from 'react'
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
  FormFeedback,
  Spinner,
} from 'reactstrap'
import { useAlert } from 'react-alert'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { decodeQuery } from '@/src/lib/parseQuery'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons'
import { category, event } from 'app'
import withAuth from '@/src/lib/withAuth'
import { fuego, useDocument } from '@nandorojo/swr-firestore'
import Loading from '@/src/components/loading'
import analytics from '@/src/lib/analytics'

const Confirmation = ({ user }: { user: firebase.default.User }) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const alert = useAlert()
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [complete, setComplete] = useState(false)
  const [redirectTimer, setRedirectTimer] = useState(5)
  const timerRef = useRef(redirectTimer)

  const eventId = useMemo(() => router?.query?.id, [router?.query])
  const [paymentState, setPaymentState] = useState<{
    familyName: string
    firstName: string
    email: string
    clientSecret: string
    photoUrls: string[]
    event: event
    selectedCategory: string
  }>()

  const { data: category } = useDocument<category>(
    paymentState && `events/${router.query.id}/categories/${paymentState.selectedCategory}`,
  )

  useEffect(() => {
    if (!user || !router) return
    ;(async () => {
      try {
        const { familyName, firstName, email, selectedCategory, uid } = JSON.parse(
          decodeQuery(router.query.query as string),
        )
        const token = await user.getIdToken()
        if (user.uid !== uid) return
        const res = await fetch('/api/createPaymentIntent', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ eventId: router.query.id, categoryId: selectedCategory, token }),
        })
        const { clientSecret, photoUrls, event } = (await res.json()) as {
          clientSecret: string
          photoUrls: string[]
          event: event
        }
        setPaymentState({
          familyName,
          firstName,
          email,
          clientSecret,
          photoUrls,
          event,
          selectedCategory,
        })
        setLoading(false)
        ;(await analytics()).logEvent('begin_checkout', {
          items: [
            {
              id: category.id,
              price: category.price,
              name: category.name,
            },
          ],
        })
      } catch (e) {
        ;(await analytics()).logEvent('exception', { description: e.message })
        console.error(e)
        await fuego.auth().signOut()
      }
    })()
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || loading) return
    if (!agree) return alert.error('同意します が選択されていません')
    setProcessing(true)
    if (category?.stock - category?.sold < 1 || !category?.public) {
      const msg =
        category?.stock - category?.sold < 1
          ? '在庫がありませんでした。リダイレクトします。'
          : '対象のチケットは主催者によって非公開に設定されました。リダイレクトします。'
      alert.error(msg)
      setTimeout(() => {
        router.push(`/events/${eventId}`)
      }, 3000)
      return
    }
    ;(await analytics()).logEvent('checkout_progress', {
      checkout_option: 'card',
      items: [
        {
          id: category.id,
          price: category.price,
          name: category.name,
        },
      ],
    })
    const res = await stripe.confirmCardPayment(paymentState.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${paymentState.familyName} ${paymentState.firstName}`,
          email: paymentState.email,
        },
      },
    })
    if (res.error) {
      alert.error('エラーが発生しました。入力情報をご確認いただくか、他のカードをお試しください。')
      return setProcessing(false)
    }
    paymentComplete()
  }

  const paymentComplete = () => {
    setComplete(true)
    let timer = timerRef.current
    const count = setInterval(() => {
      if (timer <= 1) {
        clearInterval(count)
        router.push(`/users/${user.uid}/myTickets`)
      }
      setRedirectTimer(timer--)
    }, 1000)
  }

  if (complete)
    return (
      <>
        <h4>
          <FontAwesomeIcon icon={faCheckSquare} style={{ color: '#00DD00' }} />
          ご購入ありがとうございました。
        </h4>
        <h4>購入処理が完了すると、購入済みチケット に表示されます。</h4>
        <p>{redirectTimer} 秒後にリダイレクトします...</p>
      </>
    )

  if (loading) return <Loading />

  return (
    <Form style={{ marginBottom: '2em' }} onSubmit={handleSubmit}>
      <FormGroup>
        <Label>お名前</Label>
        <FormGroup>
          <Label style={{ marginRight: '1em' }}>{paymentState.familyName}</Label>
          <Label>{paymentState.firstName}</Label>
        </FormGroup>
      </FormGroup>
      <FormGroup>
        <Label>メールアドレス</Label>
        <FormGroup>
          <Label>{paymentState.email}</Label>
        </FormGroup>
      </FormGroup>
      <FormGroup style={{ marginBottom: '1.5em' }}>
        <Label>イベント情報</Label>
        <Card>
          <CardBody>
            <Row>
              <Col sm="2" xs="3">
                <img width="100%" src={paymentState.photoUrls[0]} alt="image" />
              </Col>
              <Col xs="auto">
                <CardTitle>{paymentState.event.name}</CardTitle>
                <CardSubtitle>{paymentState.event.placeName}</CardSubtitle>
              </Col>
            </Row>
            <Row className="flex-row-reverse">
              <h4 style={{ marginTop: '1em', marginRight: '1em' }}>{category?.price} 円</h4>
              <h4 style={{ marginTop: '1em', marginRight: '1em' }}>{category?.name}</h4>
            </Row>
          </CardBody>
        </Card>
      </FormGroup>
      <FormGroup style={{ marginBottom: '2em' }}>
        <Row form className="flex-row-reverse">
          <Col sm="6">
            <Card>
              <CardBody>
                <Label>クレジットカード情報を入力</Label>
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </FormGroup>
      <Row className="flex-row-reverse">
        <FormGroup check style={{ marginRight: '1em' }}>
          <Label>
            <Link href="/termsOfUse">
              <a>利用規約及び特定商取引法に基づく表示</a>
            </Link>
            を確認の上、同意します。
          </Label>
        </FormGroup>
      </Row>
      <Row className="flex-row-reverse">
        <FormGroup check style={{ marginRight: '1em' }}>
          <Label check>
            <Input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              invalid={!agree}
            />{' '}
            同意します
            <FormFeedback>必須項目です</FormFeedback>
          </Label>
        </FormGroup>
      </Row>
      <Row className="flex-row-reverse" style={{ marginRight: '1em', marginTop: '0.5em' }}>
        <Button disabled={!stripe || !elements || loading}>
          {processing ? <Spinner /> : '購入'}
        </Button>
      </Row>
    </Form>
  )
}

export default withAuth(Confirmation)
