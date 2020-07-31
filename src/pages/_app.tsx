import {useState, useEffect, Dispatch, ReactElement, SetStateAction} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import "react-datepicker/dist/react-datepicker.css"
import '@fortawesome/fontawesome-svg-core/styles.css'
import UserLayouts from './layouts/userLayouts'
import { auth, firestore } from '@/src/lib/initFirebase'
import { useAuthState } from "react-firebase-hooks/auth";
import {useRouter} from 'next/router'
import { AppProps, AppContext } from 'next/app'
import Head from "next/head";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Provider, AlertPosition } from "react-alert";
import AlertTemplate from '@/src/components/alert'
import Modal from '@/src/components/modal'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { encodeQuery } from '../lib/parseQuery'
import checkAllowNoLoginUrlList from '../lib/checkAllowNoLoginUrlList'
import { setCookie, destroyCookie, parseCookies } from 'nookies'
const env = process.env.ENV === 'prod' ? 'prod' : 'dev'
const publishableKey = env === 'prod' ? 'test' : 'pk_test_DzqNDAGEkW8eadwK9qc1NlrW003yS2dW8N'
const stripePromise = loadStripe(publishableKey)

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [modalInner, setModalInner]: [ReactElement, Dispatch<SetStateAction<ReactElement>>] = useState()
  const [user, userLoading, userError] = useAuthState(auth);
  const cookies = parseCookies()
  const [tmpUser, setTmpUser] = useState(cookies.tmpUser);

  useEffect(() => {
    if (userLoading) return;
    if (userError) auth.signOut();
    (async () => {
      if (user) {

        setCookie(null, "tmpUser", JSON.stringify({
          photoURL: user.photoURL,
          providerData: user.providerData,
          uid: user.uid
        }), {
          maxAge: 60,
          path: "/",
          domain: document.domain,
          secure: document.domain !== 'localhost',
        });
        if (
          !user.emailVerified &&
          user.providerData[0].providerId === "password" &&
          !window.location.href.match(/^\/__\/auth\/action/)
        ) {
          router.push("/confirmEmail");
        } else if (
          window.location.pathname === "/login" ||
          window.location.pathname === "/register" ||
          window.location.pathname === "/forgetPassword"
        ) {
          router.push({
            pathname: `/users/${user.uid}`,
            query: { msg: encodeQuery("ログインしました") },
          });
        }
      }
      if (!user) {
        destroyCookie(null, 'photoUrl')
        setTmpUser(null)
        if (!checkAllowNoLoginUrlList()) {
          await router.push({
            pathname: "/login",
            query: { msg: encodeQuery("ログアウトしました") },
          });
        }
      }
    })();
  }, [user, userLoading, router.pathname]);

  useEffect(() => {
    router.events.on("routeChangeStart", (url) => {
      NProgress.start();
    });
    router.events.on("routeChangeComplete", () => NProgress.done());
    router.events.on("routeChangeError", () => NProgress.done());
  }, []);

  const options = {
    timeout: 4000,
    position: "top left" as AlertPosition,
  };

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
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />

        <link rel="apple-touch-icon" sizes="48x48" href="/favicon.ico" />
        <link rel="icon" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" sizes="48x48" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/favicon.ico" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
        />
      </Head>
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
              tmpUser,
              setModal,
              setModalInner,
              Component,
              user,
              userLoading,
            }}
          >
            <Component
              {...pageProps}
              {...{
                setModal,
                setModalInner,
                Component,
                user,
                userLoading,
              }}
            />
          </UserLayouts>
        </Elements>
      </Provider>
    </>
  );
}
              
export default App;
