import { NextRouter } from 'next/router'

const checkAllowNoLoginUrlList = (router: NextRouter) => {
  return (
    router.pathname === '/' ||
    router.pathname === '/login' ||
    router.pathname === '/register' ||
    router.pathname === '/termsOfUse' ||
    router.pathname === '/forgetPassword' ||
    router.pathname === '/contact' ||
    !!router.pathname.match(/^\/__\/auth\/action/) ||
    !!router.pathname.match(/^\/events\/[^/]+\/*/)
  )
}

export default checkAllowNoLoginUrlList
