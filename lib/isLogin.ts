import admin from "firebase-admin"

export default async (ctx) => {
    const { req, res, pathname, query } = ctx
    // SSR
    // Webpackにバンドルされない
    const micro_session = eval("require('micro-cookie-session')")({
      name: 'session',
      keys: ['geheimnis'],
      maxAge: 24 * 60 * 60 * 1000
    })
    const _req = { ...req }
    const _res = { ...res }
    await micro_session(_req, _res)
    const session = _req.session
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