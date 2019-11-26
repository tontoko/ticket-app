

export default ((req, res) => {
    if (req.session && req.session.decodedToken) req.session.decodedToken = null
    res.json({ status: true })
})