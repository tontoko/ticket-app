const next = require('next')
const express = require('express')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ 
    dev,
    dir: './src/app'
})
const handle = app.getRequestHandler()

app
    .prepare()
    .then(() => {
        const server = express()

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
    .catch(ex => {
        console.error(ex.stack)
        process.exit(1)
    })
