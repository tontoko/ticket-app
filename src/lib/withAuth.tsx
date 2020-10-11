import Loading from '@/src/components/loading'
import React from 'react'

const withAuth = (Component) => {
  return class withAuthHOC extends React.Component<{ user: string }> {
    constructor(props) {
      super(props)
    }

    render() {
      if (!this.props.user) return <Loading />
      return <Component {...this.props} />
    }
  }
}

export default withAuth
