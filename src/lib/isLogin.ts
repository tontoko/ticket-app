import admin from "firebase-admin"
import getSession from '@/src/lib/session'

export default async (ctx) => {
  const { req, res, query } = ctx

  const session = await (await getSession())(req, res)

  const uid: string | null = session.token ? session.token.uid : null
  let user: null | admin.auth.DecodedIdToken = null
  let msg: undefined | string = query.msg
  const {url} = req
  if (uid) {
    if (session.token.firebase.sign_in_provider === 'password' && !session.token.email_verified && url !== '/confirmEmail') {
      res.writeHead(302, {
        Location: '/confirmEmail'
      })
      res.end()
    } else if (url === '/login' || url === '/register' || url === '/') {
      res.writeHead(302, {
        Location: `/user`
      })
      res.end()
    }
    user = session.token
  } else {
      if (url !== '/login' && url !== '/register' && url !== '/' && url !== '/__/auth/action') {
        res.writeHead(302, {
          Location: `/login`
        })
        res.end()
      }
  }
  return {
    user,
    msg,
    req,
    res,
    url,
    query
  }
}