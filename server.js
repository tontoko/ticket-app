const next = require('next')
const express = require('express')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app
    .prepare()
    .then(() => {
        const server = express()

        server.get('/users/:id', (req, res) => {
            const actualPage = '/users/show'
            const queryParams = { id: req.params.id }
            app.render(req, res, actualPage, queryParams)
        })

        server.get('/events/:id', (req, res) => {
            const actualPage = '/events/show'
            const queryParams = { id: req.params.id }
            app.render(req, res, actualPage, queryParams)
        })

        server.get('/events/:id/purchase/', (req, res) => {
            const actualPage = '/events/purchase'
            const queryParams = { id: req.params.id }
            app.render(req, res, actualPage, queryParams)
        })

        server.get('/events/:id/purchase/confirmation', (req, res) => {
            const actualPage = '/events/purchase/confirmation'
            const queryParams = { id: req.params.id, familyName: req.query.familyName, firstName: req.query.firstName, email: req.query.email }
            app.render(req, res, actualPage, queryParams)
        })

        server.get('/events/:id/purchase/checkout', (req, res) => {
            const actualPage = '/events/purchase/checkout'
            const queryParams = { id: req.params.id }
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
    .catch(ex => {
        console.error(ex.stack)
        process.exit(1)
    })
