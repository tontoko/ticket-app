import withMiddleware from './middleware'

const endpoint = ((req, res) => {
    // if ((req.cookies) && req.cookies.uid) res.setHeader('Set-Cookie', serialize('uid', '', { path: '/' }))
    req.session.destroy()
    res.json({ status: true })
})

export default withMiddleware(endpoint)