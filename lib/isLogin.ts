import admin from "firebase-admin"
import getSession from '@/lib/session'

export default async (ctx) => {
  const { req, res, pathname, query } = ctx

  const session = await (await getSession())(req, res)

  const uid: string|null = session.token ? session.token.uid : null
  let user: null|admin.auth.DecodedIdToken = null
  let msg: null|string = null
  if (uid) {
    if (session.token.firebase.sign_in_provider === 'password' && !session.token.email_verified && pathname !== '/confirmEmail') {
      res.writeHead(302, {
        Location: '/confirmEmail'
      })
      res.end()
    } else if (pathname === '/login' || pathname === '/register' || pathname === '/') {
      res.writeHead(302, {
        Location: `/user`
      })
      res.end()
    }
    user = session.token,
    msg = query?.msg
  } else {
      if (pathname !== '/login' && pathname !== '/register' && pathname !== '/' && pathname !== '/__/auth/action') {
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
    pathname,
    query
  }
}