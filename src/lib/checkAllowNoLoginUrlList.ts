import { NextRouter } from 'next/router'

export const checkAllowNoLoginUrlList = (router: NextRouter) => {
  return (
    router.pathname === '/login' ||
    router.pathname === '/register' ||
    router.pathname === '/forgetPassword' ||
    router.pathname === '/contact' ||
    !!router.pathname.match(/^\/__\/auth\/action/) ||
    !!router.pathname.match(/^\/events\/[^/]+\/.+/)
  )
}

export const checkAllowBothLoginStatusUrls = (router: NextRouter) => {
  return (
    router.pathname === '/' ||
    router.pathname === '/termsOfUse' ||
    !!router.pathname.match(/^\/events\/[^/]+\/*/) ||
    !!router.pathname.match(/^\/events\/[^/]+\/[^?]+?.+/)
  )
}
