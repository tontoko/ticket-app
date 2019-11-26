import admin from '../../initFirebaseAdmin'
import { serialize } from 'cookie'

export default (async (req, res) => {
    if (!req.body) return res.sendStatus(400)

    const token = req.body.token
    const firebase = await admin()
    firebase
        .auth()
        .verifyIdToken(token)
        .then(decodedToken => {
            res.setHeader('Set-Cookie', serialize('uid', decodedToken.uid, { path: '/' }))
            return decodedToken
        })
        .then(decodedToken => {
            res.json({ status: true, decodedToken })
        })
        .catch(error => res.json({ error }))
})