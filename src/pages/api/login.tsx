import initFirebaseAdmin from '@/initFirebaseAdmin'
import getSession from '@/src/lib/session'

const endpoint = (async (req, res) => {
    if (!req.body) return res.sendStatus(400)
    // await micro_session(req, res)
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