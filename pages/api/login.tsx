import initFirebaseAdmin from '@/initFirebaseAdmin'
const micro_session = require('micro-cookie-session')({
    name: 'session',
    keys: ['geheimnis'],
    maxAge: 24 * 60 * 60 * 1000
})

const endpoint = (async (req, res) => {
    if (!req.body) return res.sendStatus(400)
    await micro_session(req, res)
    try {
        let session = req.session
        const {firebase} = await initFirebaseAdmin()
        const decodedToken = await firebase.auth().verifyIdToken(req.body.token)
        session.token = decodedToken
        return res.json({ status: true, decodedToken })
    } catch(error) {
        console.log(error)
        res.json({ error }) 
    }
})

export default endpoint