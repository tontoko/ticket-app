import getSession from '@/src/lib/session'
import { NextApiHandler } from 'next'
import initFirebaseAdmin from '@/initFirebaseAdmin'
import { Client } from "@googlemaps/google-maps-services-js"
const env = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? 'prod' : 'dev'
const gMapKey = env === 'prod' ? process.env.GOOGLE_MAP_SERVER_KEY_PROD : process.env.GOOGLE_MAP_SERVER_KEY_DEV

const endpoint: NextApiHandler = (async (req, res) => {
  try {
    const { token, zip } = req.body
    const { firebase } = await initFirebaseAdmin()
    await firebase.auth().verifyIdToken(token)
    
    const client = new Client({})

    const result = await client.geocode({params: {
      address: zip,
      key: gMapKey,
      language: 'ja'
    }})

    console.log(result.data)

    res.status(200).json({ address: result.data.results[0].address_components })
  } catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }
})

export default endpoint