import admin from "firebase-admin"
import getSession from '@/src/lib/session'
import { GetServerSidePropsContext } from "next"

type mode = 'redirect'

export default async (ctx: GetServerSidePropsContext, mode?: mode) => {
  const { req, res, query } = ctx

  const session = await (await getSession())(req, res)

  const uid: string | null = session.token ? session.token.uid : null
  const user: null | admin.auth.DecodedIdToken = session.token
  const msg = query.msg
  const { url } = req
  const params = {
    user,
    msg,
    req,
    res,
    url,
    query
  }

  if (mode !== 'redirect') return params
  
  if (uid) {
    if (session.token.firebase.sign_in_provider === 'password' && !session.token.email_verified && url !== '/confirmEmail') {
      res.writeHead(302, {
        Location: '/confirmEmail'
      })
      res.end()
    } else if (url === '/login' || url === '/register' || url === '/forgetPassword') {
      res.writeHead(302, {
        Location: `/user`
      })
      res.end()
    }
    return params
  }

  if (url !== '/login' && url !== '/register' && url !== '/' && url !== '/__/auth/action') {
    res.writeHead(302, {
      Location: `/login`
    })
    res.end()
    return params
  }
}