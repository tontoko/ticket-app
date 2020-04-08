import getSession from '@/src/lib/session'
import { NextApiHandler } from 'next'

const endpoint: NextApiHandler = (async (req, res) => {¥
    let session = await(await getSession())(req, res)
    session.token = null
    res.json({ status: true })
})

export default endpoint