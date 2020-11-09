import Loading from '@/src/components/loading'
import { fuego } from '@nandorojo/swr-firestore'
import Router from 'next/router'
import React from 'react'

const withAuth = (Component) => {
  return class withAuthHOC extends React.Component<{ user: firebase.default.User }> {
    constructor(props) {
      super(props)
    }

    componentDidUpdate() {
      if (!this.props.user) return
      if (Router.pathname.match(/^\/users\//) && Router.query.id !== this.props.user.uid)
        fuego.auth().signOut()
    }

    render() {
      if (
        !this.props.user ||
        (Router.pathname.match(/^\/users\//) && Router.query.id !== this.props.user.uid)
      )
        return <Loading />
      return <Component {...this.props} />
    }
  }
}

export default withAuth
