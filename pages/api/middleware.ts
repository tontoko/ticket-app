import { withSession } from 'next-session'

const withMiddleware = handler => withSession(handler, { ...options })

const options = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000
    }
}

export default withMiddleware