import withMiddleware from './middleware'

const endpoint = ((req, res) => {
    req.session.destroy()
    res.json({ status: true })
})

export default withMiddleware(endpoint)