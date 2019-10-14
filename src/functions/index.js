const functions = require('firebase-functions');
const next = require('next')
const session = require('express-session')
const FirebaseStore = require('connect-session-firebase')(session)
const dev = process.env.NODE_ENV !== 'production'
const admin = require('firebase-admin')
const firebase = admin.initializeApp({
  credential: admin.credential.cert(require('./ticket-app-dev.json')),
  databaseURL: "https://ticket-app-dev-11346.firebaseio.com"
})
let app
if (dev) {
  app = next({
    dev,
    // conf: { distDir: 'next' },
    dir: '../app'
  });
} else {
  app = next({
    dev,
    conf: { distDir: 'next' },
    // dir: '../app'
  });
}

const handle = app.getRequestHandler()
const express = require('express')
const server = express()

app.prepare()
  .then(() => {

    server.use(express.json())
    server.use(express.urlencoded({ extended: true }))
    server
      .use(session({
        store: new FirebaseStore({
          database: firebase.database()
        }),
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true
      }));

    server.use((req, res, next) => {
      req.firebaseServer = firebase
      const token = req.session.decodedToken
      if (!req.url.match(/\/api\/.*/) && !req.url.match(/\/_next\/.*/)) {
        if (token) {
          if (req.url === '/login' || req.url === '/register') {
            return res.redirect(`/users/${token.user_id}`)
          }
        } else {
          if (req.url !== '/login' && req.url !== '/register') {
            return res.redirect(`/login`)
          }
        }
      } 
      next()
    })

    server.post('/api/login', (req, res) => {
      if (!req.body) return res.sendStatus(400)

      const token = req.body.token
      firebase
        .auth()
        .verifyIdToken(token)
        .then(decodedToken => {
          req.session.decodedToken = decodedToken
          return decodedToken
        })
        .then(decodedToken => {
          res.json({ status: true, decodedToken })
        })
        .catch(error => res.json({ error }))
    })

    server.post('/api/logout', (req, res) => {
      req.session.decodedToken = null
      res.json({ status: true })
    })

    server.get('/events/:id/reception', (req, res) => {
      const actualPage = '/events/reception'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/:id/reception/show', (req, res) => {
      const actualPage = '/events/reception/show'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/:id/reception/read', (req, res) => {
      const actualPage = '/events/reception/read'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/reception/:id/edit', (req, res) => {
      const actualPage = '/events/reception/edit'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/:id', (req, res) => {
      const actualPage = '/events/show'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/:id/edit', (req, res) => {
      const actualPage = '/events/edit'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/:id/confirm', (req, res) => {
      const actualPage = '/events/confirm'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/:id/purchase', (req, res) => {
      const actualPage = '/events/purchase'
      const queryParams = { id: req.params.id, familyName: req.query.familyName, firstName: req.query.firstName, email: req.query.email }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/:id/purchase/confirm', (req, res) => {
      const actualPage = '/events/purchase/confirm'
      const queryParams = { id: req.params.id, familyName: req.query.familyName, firstName: req.query.firstName, email: req.query.email }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/:id/purchase/checkout', (req, res) => {
      const actualPage = '/events/purchase/checkout'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/events/:id/report', (req, res) => {
      const actualPage = '/events/report'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/users/:id', (req, res) => {
      const actualPage = '/users/show'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/users/:id/edit', (req, res) => {
      const actualPage = '/users/edit'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/users/:id/edit/confirm', (req, res) => {
      const actualPage = '/users/edit/confirm'
      const queryParams = { id: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/users/:id/myEvents', (req, res) => {
      const actualPage = '/users/show/myEvents'
      const queryParams = {
        id: req.params.id
      }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('/users/:id/myTickets', (req, res) => {
      const actualPage = '/users/show/myTickets'
      const queryParams = {
        id: req.params.id
      }
      app.render(req, res, actualPage, queryParams)
    })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(3000, err => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })
  })

exports.nextApp = functions.https.onRequest(server)