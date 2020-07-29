

export default () => {
    return window.location.pathname === "/" ||
      window.location.pathname === "/login" ||
      window.location.pathname === "/register" ||
      window.location.pathname === "/termsOfUse" ||
      window.location.pathname === "/forgetPassword" ||
      !!window.location.pathname.match(/^\/__\/auth\/action/) ||
      !!window.location.pathname.match(/^\/events\/[^\/]+\/*/);
}
