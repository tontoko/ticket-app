import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import getSession from '@/src/lib/session'
import { NextApiHandler } from 'next'

const endpoint: NextApiHandler = (async (req, res) => {
    if (!req.body) return res.status(400).send({ body: 'body was empty' })
    let session = await (await getSession())(req, res)
    try {
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