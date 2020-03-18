import {useState, useEffect, Dispatch} from 'react'
import '@/node_modules/bootstrap/dist/css/bootstrap.min.css'
import UserLayouts from './layouts/userLayouts'
import initFirebase from '@/initFirebase'
import Router, {useRouter} from 'next/router'
import { AppProps } from 'next/app'
import NProgress from 'nprogress'
import { Provider, AlertPosition } from "react-alert";
import AlertTemplate from '@/components/alert'

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const [CSRUser, setCSRUser]: [null | firebase.User, Dispatch<firebase.User>] = useState(null)

  router.events.on('routeChangeStart', url => {
    require('nprogress/nprogress.css')
    NProgress.start()
  })
  router.events.on('routeChangeComplete', () => NProgress.done())
  router.events.on('routeChangeError', () => NProgress.done())

  useEffect(() => {
    let unsubscribe:firebase.Unsubscribe = () => void
    (async () => {
      const { firebase } = await initFirebase()
      unsubscribe = firebase.auth().onAuthStateChanged(async currentUser => {
        if (currentUser) {
          const token = await currentUser.getIdToken()
          setCSRUser(currentUser)
          await fetch('/api/login', {
            method: 'POST',
            headers: new Headers({
              'Content-Type': 'application/json'
            }),
            credentials: 'same-origin',
            body: JSON.stringify({
              token
            })
          })
          if (!currentUser.emailVerified && currentUser.providerData[0].providerId === 'password' && 
              !router.pathname.match(/^\/__\/auth\/action/)) {
            console.log('test3')
            router.push('/confirmEmail')
            return
          }
          if (router.pathname === '/' || router.pathname === '/login' || router.pathname === '/register') {
            console.log('test1')
            router.push({ pathname: '/user', query: { msg: 'ログインしました' } }, '/user')
          }
        } else {
          setCSRUser(currentUser)
          await fetch('/api/logout', {
            method: 'POST',
            credentials: 'same-origin'
          })
          if (router.pathname !== '/' && router.pathname !== '/login' && router.pathname !== '/register' &&
            !router.pathname.match(/^\/__\/auth\/action/) ) {
            console.log('test2')
            router.push({ pathname: '/login', query: { msg: 'ログアウトしました' } }, '/login')
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
      <UserLayouts {...pageProps} CSRUser={CSRUser} >
        <Component {...pageProps} CSRUser={CSRUser} />
      </UserLayouts>
    </Provider>
  )
}

export default App