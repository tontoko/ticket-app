import { serialize } from 'cookie'

export default ((req, res) => {
    if ((req.cookies) && req.cookies.uid) res.setHeader('Set-Cookie', serialize('uid', '', { path: '/' }))
    res.json({ status: true })
})