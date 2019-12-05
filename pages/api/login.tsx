import admin from '../../initFirebaseAdmin'
import { serialize } from 'cookie'
import Cors from 'micro-cors'

const endpoint = (async (req, res) => {
    if (!req.body) return res.sendStatus(400)

    try {
        const token = req.body.token
        const firebase = await admin()
        const decodedToken = await firebase.auth().verifyIdToken(token)
        res.setHeader('Set-Cookie', serialize('uid', decodedToken.uid, { path: '/' }))
        res.json({ status: true, decodedToken })
    } catch(error) {
        res.json({ error }) 
    }
})

const cors = Cors({
    allowMethods: ['POST'],
})

export default cors(endpoint)