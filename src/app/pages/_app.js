import React from 'react'
import App from 'next/app'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import UserLayouts from './layouts/userLayouts'
import initFirebase from '../initFirebase'
import Router from 'next/router'

export default class MyApp extends App {
    constructor (props) {
        super(props)
        this.state = {user: null}
    }


    static async getInitialProps({ Component, router, ctx }) {
        const user = ctx.req && ctx.req.session ? ctx.req.session.decodedToken : null
        let pageProps = {}
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }
        return { pageProps, user }
    }

    componentDidMount() {
        initFirebase().then(firebase => firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({ user: user })
                user
                    .getIdToken()
                    .then(token => {
                        // eslint-disable-next-line no-undef
                        return fetch('/api/login', {
                            method: 'POST',
                            // eslint-disable-next-line no-undef
                            headers: new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'private' }),
                            credentials: 'same-origin',
                            body: JSON.stringify({ token })
                        })
                    })
                    .then(() => {
                        if (Router.pathname === '/login' || Router.pathname === '/register') {
                            Router.push(`/users/${firebase.auth().currentUser.uid}`)
                        }
                    })
            } else {
                this.setState({ user: null })
                // eslint-disable-next-line no-undef
                fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'same-origin'
                })
                .then(() => {
                    if (Router.pathname !== '/login' || Router.pathname !== '/register' || Router.pathname !== '/') {
                        Router.push(`/login`)
                    }
                })
            }
        }))
    }
    
    render() {
        const { Component, pageProps } = this.props
        
        return (
            <>
                <UserLayouts />
                <Component {...pageProps} />
            </>
        )
    }
}