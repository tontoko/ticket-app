import {useState, useEffect, Dispatch} from 'react'
import '@/node_modules/bootstrap/dist/css/bootstrap.min.css'
import "react-datepicker/dist/react-datepicker.css"
import UserLayouts from './layouts/userLayouts'
import initFirebase from '@/src/lib/initFirebase'
import {useRouter} from 'next/router'
import { AppProps } from 'next/app'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Provider, AlertPosition } from "react-alert";
import AlertTemplate from '@/src/components/alert'

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const [CSRUser, setCSRUser]: [null | firebase.User, Dispatch<firebase.User>] = useState(null)

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
          if (window.location.pathname === '/' || window.location.pathname === '/login' || window.location.pathname === '/register') {
            router.push({ pathname: '/user', query: { msg: 'ログインしました' } }, '/user')
          }
        } else {
          setCSRUser(currentUser)
          await fetch('/api/logout', {
            method: 'POST',
            credentials: 'same-origin'
          })
          if (window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register' &&
            !window.location.pathname.match(/^\/__\/auth\/action/) ) {
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