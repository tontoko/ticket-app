import React, { useState, useEffect, Dispatch, ReactElement, SetStateAction } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-datepicker/dist/react-datepicker.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import UserLayouts from './layouts/userLayouts'
import 'firebase/firestore'
import 'firebase/auth'
import { Fuego, FuegoProvider } from '@nandorojo/swr-firestore'
import { useRouter } from 'next/router'
import { AppProps } from 'next/app'
import Head from 'next/head'
import 'nprogress/nprogress.css'
import { Provider, AlertPosition } from 'react-alert'
import AlertTemplate from '@/src/components/alert'
import Modal from '@/src/components/modal'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { encodeQuery } from '@/src/lib/parseQuery'
import {
  checkAllowNoLoginUrlList,
  checkAllowBothLoginStatusUrls,
} from '@/src/lib/checkAllowNoLoginUrlList'
const env = process.env.NEXT_PUBLIC_ENV === 'prod' ? 'prod' : 'dev'
const publishableKey =
  env === 'prod'
    ? 'pk_live_1uhgTSRLmCH7K0aZIfNgfu0c007fLyl8aV'
    : 'pk_test_DzqNDAGEkW8eadwK9qc1NlrW003yS2dW8N'
const stripePromise = loadStripe(publishableKey)
import { dev, prod } from '@/ticket-app'
import analytics from '../lib/analytics'
const firebaseConfig = env === 'prod' ? prod : dev
const fuego = new Fuego(firebaseConfig)
// ローカルのFirestoreエミュレータに接続する設定
// if (location.hostname === "localhost") {
//   fuego.db.settings({
//     host: "localhost:8080",
//     ssl: false,
//   });
// }

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [modalInner, setModalInner]: [
    ReactElement,
    Dispatch<SetStateAction<ReactElement>>,
  ] = useState()
  const [user, setUser] = useState<firebase.User>()

  useEffect(() => {
    ;(async () => {
      await analytics()
      const { firebaseCloudMessaging } = await import('../lib/webPush')
      firebaseCloudMessaging.init(env)
    })()
  }, [])

  useEffect(() => {
    return fuego.auth().onAuthStateChanged(async (currentUser) => {
      setUser(currentUser || null)
      if (currentUser) {
        ;(await analytics()).setUserId(currentUser.uid)
        ;(await analytics()).logEvent('login', { method: currentUser.providerData[0].providerId })
      }
    })
  }, [])

  useEffect(() => {
    if (!router || user === undefined) return
    if (checkAllowBothLoginStatusUrls(router)) return
    if (user) {
      if (
        !user.emailVerified &&
        user.providerData[0].providerId === 'password' &&
        router.pathname !== '/confirmEmail' &&
        !router.pathname.match(/^\/__\/auth\/action/)
      ) {
        router.push('/confirmEmail')
        return
      }
      if (checkAllowNoLoginUrlList(router)) {
        router.push({
          pathname: `/users/${user.uid}`,
          query: { msg: encodeQuery('ログインしました') },
        })
        return
      }
    }
    if (!user) {
      if (!checkAllowNoLoginUrlList(router)) {
        router.push({
          pathname: '/login',
          query: { msg: encodeQuery('ログアウトしました') },
        })
        return
      }
    }
  }, [router?.pathname, user])

  useEffect(() => {
    ;(async () => {
      const NProgress = await import('nprogress')
      router.events.on('routeChangeStart', () => {
        NProgress.start()
      })
      router.events.on('routeChangeComplete', async () => {
        NProgress.done()
        ;(await analytics()).logEvent('page_view', { page_path: router.pathname })
      })
      router.events.on('routeChangeError', () => NProgress.done())
    })()
  }, [])

  const options = {
    timeout: 4000,
    position: 'top left' as AlertPosition,
  }

  return (
    <>
      <Head>
        <meta name="application-name" content="Ticket-App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ticket-App" />
        <meta name="description" content="Ticket-App" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
        />

        <link rel="apple-touch-icon" sizes="48x48" href="/favicon.ico" />
        <link rel="icon" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" sizes="48x48" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/favicon.ico" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
      </Head>
      <FuegoProvider fuego={fuego}>
        <Provider template={AlertTemplate} {...options}>
          <Elements stripe={stripePromise}>
            <Modal
              {...{
                modal,
                setModal,
                modalInner,
              }}
            />
            <UserLayouts
              {...pageProps}
              {...{
                setModal,
                setModalInner,
                Component,
                user,
              }}
            >
              <Component
                {...pageProps}
                {...{
                  setModal,
                  setModalInner,
                  Component,
                  user,
                }}
              />
            </UserLayouts>
          </Elements>
        </Provider>
      </FuegoProvider>
    </>
  )
}

export default App
