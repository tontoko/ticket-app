const micro_session = require('micro-cookie-session')({
    name: 'session',
    keys: ['geheimnis'],
    maxAge: 24 * 60 * 60 * 1000
})
const endpoint = ((req, res) => {
    micro_session(req, res)
    req.session = null
    res.json({ status: true })
})

export default endpoint