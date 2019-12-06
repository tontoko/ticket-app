import admin from '../../initFirebaseAdmin'
import withMiddleware from './middleware'

const endpoint = (async (req, res) => {
    if (!req.body) return res.sendStatus(400)

    try {
        let session = req.session
        const firebase = await admin()
        const decodedToken = await firebase.auth().verifyIdToken(req.body.token)
        session.token = decodedToken
        return res.json({ status: true, decodedToken })
    } catch(error) {
        res.json({ error }) 
    }
})

export default withMiddleware(endpoint)