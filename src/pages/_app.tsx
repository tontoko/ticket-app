import {useState, useEffect, Dispatch, ReactElement, SetStateAction} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import "react-datepicker/dist/react-datepicker.css"
import '@fortawesome/fontawesome-svg-core/styles.css'
import UserLayouts from './layouts/userLayouts'
import initFirebase from '@/src/lib/initFirebase'
import {useRouter} from 'next/router'
import { AppProps } from 'next/app'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Provider, AlertPosition } from "react-alert";
import AlertTemplate from '@/src/components/alert'
import Modal from '@/src/components/modal'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { encodeQuery } from '../lib/parseQuery'
const env = process.env.ENV === 'prod' ? 'prod' : 'dev'
const publishableKey = env === 'prod' ? 'test' : 'pk_test_DzqNDAGEkW8eadwK9qc1NlrW003yS2dW8N'
const stripePromise = loadStripe(publishableKey)

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const [CSRUser, setCSRUser]: [null | firebase.User, Dispatch<firebase.User>] = useState(null)
  const [modal, setModal] = useState(false)
  const [modalInner, setModalInner]: [ReactElement, Dispatch<SetStateAction<ReactElement>>] = useState()

  useEffect(() => {
    let unsubscribe:firebase.Unsubscribe = () => void
    (async () => {
      router.events.on('routeChangeStart', url => {
        NProgress.start()
      })
      router.events.on('routeChangeComplete', () => NProgress.done())
      router.events.on('routeChangeError', () => NProgress.done())
      const { firebase } = await initFirebase()
      unsubscribe = firebase.auth().onAuthStateChanged(async currentUser => {
        if (currentUser) {
          const token = await currentUser.getIdToken()
          setCSRUser(currentUser)
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: new Headers({
              'Content-Type': 'application/json'
            }),
            credentials: 'same-origin',
            body: JSON.stringify({
              token
            })
          })
          if(res.status !== 200) return firebase.auth().signOut()
          if (!currentUser.emailVerified && currentUser.providerData[0].providerId === 'password' && 
              !window.location.href.match(/^\/__\/auth\/action/)) {
            router.push('/confirmEmail')
            return
          }
          if (window.location.pathname === '/login' || window.location.pathname === '/register') {
            router.push({ pathname: '/user', query: { msg: encodeQuery('ログインしました') } }, '/user')
          }
        } else {
          setCSRUser(currentUser)
          await fetch('/api/logout', {
            method: 'POST',
            credentials: 'same-origin'
          })
          if (
            window.location.pathname !== "/" &&
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/register" &&
            window.location.pathname !== "/termsOfUse" &&
            window.location.pathname !== "/forgetPassword" &&
            !window.location.pathname.match(/^\/__\/auth\/action/) &&
            !window.location.pathname.match(/^\/events\/[^\/]+\/*/)
          ) {
            router.push(
              {
                pathname: "/login",
                query: { msg: encodeQuery("ログアウトしました") },
              },
              "/login"
            );
          }
        }
      })
    })()
    return unsubscribe()
  }, [])

  const position:AlertPosition = 'top left'
  const options = {
    timeout: 4000,
    position
  }

  return (
    <Provider template={AlertTemplate} {...options}>
      <Elements stripe={stripePromise}>
        <UserLayouts {...pageProps} CSRUser={CSRUser} >
          <Modal modal={modal} setModal={setModal} modalInner={modalInner} />
          <Component {...pageProps} CSRUser={CSRUser} setModal={setModal} setModalInner={setModalInner} />
        </UserLayouts>
      </Elements>
    </Provider>
  )
}

export default App