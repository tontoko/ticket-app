import getSession from '@/lib/session'

const endpoint = (async (req, res) => {
    // micro_session(req, res)
    let session = await(await getSession())(req, res)
    session.token = null
    res.json({ status: true })
})

export default endpoint