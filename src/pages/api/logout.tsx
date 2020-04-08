import getSession from '@/src/lib/session'
import { NextApiHandler } from 'next'
import fs from 'fs'

const endpoint: NextApiHandler = (async (req, res) => {
    // テスト
    console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    const file = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    console.log(file.toString())



    let session = await(await getSession())(req, res)
    session.token = null
    res.json({ status: true })
})

export default endpoint