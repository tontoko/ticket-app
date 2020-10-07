const checkAllowNoLoginUrlList = () => {
  return (
    window.location.pathname === '/' ||
    window.location.pathname === '/login' ||
    window.location.pathname === '/register' ||
    window.location.pathname === '/termsOfUse' ||
    window.location.pathname === '/forgetPassword' ||
    window.location.pathname === '/contact' ||
    !!window.location.pathname.match(/^\/__\/auth\/action/) ||
    !!window.location.pathname.match(/^\/events\/[^/]+\/*/)
  )
}

export default checkAllowNoLoginUrlList
