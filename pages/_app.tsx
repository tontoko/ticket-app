import {useState, useEffect, Dispatch} from 'react'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import UserLayouts from './layouts/userLayouts'
import initFirebase from '@/initFirebase'
import Router from 'next/router'
import { AppProps } from 'next/app'
import {Spinner} from 'reactstrap'
import NProgress from 'nprogress'
import { positions, Provider } from "react-alert";
import AlertTemplate from '@/components/alert'
import Loading from '@/components/loading'
Router.events.on('routeChangeStart', url => {
  require('nprogress/nprogress.css')
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const App = ({ Component, pageProps }: AppProps) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser]: [null | firebase.User, Dispatch<firebase.User>] = useState(null)

  let unsubscribe = () => void

  useEffect(() => {
    (async () => {
      const { firebase } = await initFirebase()
      unsubscribe = firebase.auth().onAuthStateChanged(async currentUser => {
        if (currentUser) {
          const token = await currentUser.getIdToken()
          await fetch('/api/login', {
            method: 'POST',
            headers: new Headers({
              'Content-Type': 'application/json',
              'Cache-Control': 'private'
            }),
            credentials: 'same-origin',
            body: JSON.stringify({
              token
            })
          })
          setLoading(false)
          setUser(currentUser)
          loading ? this.setState({ loading: false, currentUser }) : this.setState({ loading: this.state.loading, currentUser })
          if (!currentUser.emailVerified && currentUser.providerData[0].providerId === 'password') {
            Router.push('/confirmEmail')
            return
          }
          if (Router.pathname === '/' || Router.pathname === '/login' || Router.pathname === '/register') {
            Router.push(`/user`)
          }
        } else {
          await fetch('/api/logout', {
            method: 'POST',
            credentials: 'same-origin'
          })
          this.state.loading ? this.setState({ loading: false, currentUser: null }) : this.setState({ loading: this.state.loading, currentUser: null })
          if (Router.pathname !== '/login' && Router.pathname !== '/register' && Router.pathname !== '/' && Router.pathname.match(/^\/user/)) {
            Router.push('/login')
          }
        }
      })
    })()
    return unsubscribe()
  }, [])
  const position: 'top left' = 'top left'
  const options = {
    timeout: 4000,
    position
  }

  let params = {}
  if (user) {
    const sign_in_provider = user.providerData ? user.providerData[0].providerId : 'password'
    params = {
      uid: user.uid,
      email: user.email,
      sign_in_provider,
      picture: user.photoURL
    }
  }

  return (
    <Provider template={AlertTemplate} {...options}>
      <UserLayouts user={user} params={params} />
      <Component {...pageProps} user={user} params={params} />
    </Provider>
  )
}

export default App