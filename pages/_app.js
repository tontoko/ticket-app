import React from 'react'
import App from 'next/app'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import UserLayouts from './layouts/userLayouts'
import initFirebase from '../initFirebase'
import Router from 'next/router'
import {Spinner} from 'reactstrap'
import NProgress from 'nprogress'
const micro_session = require('micro-cookie-session')({
    name: 'session',
    keys: ['geheimnis'],
    maxAge: 24 * 60 * 60 * 1000
})
Router.events.on('routeChangeStart', url => {
    require('nprogress/nprogress.css')
    NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

export default class MyApp extends App {
    constructor (props) {
        super(props)
        this.state = {
            loading: true,
            user: null
        }
    }

    static async getInitialProps({ Component, ctx }) {
        let pageProps = {}
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }
        if (ctx.req) {
            const { req, res, pathname, query } = ctx
            // SSR
            const _req = {...req}
            const _res = {...res}
            micro_session(_req, _res)
            const session = _req.session
            const user = session && session.token ? session.token : null
            const uid = user ? session.token.uid : null
            if (uid && query.id && uid === query.id || uid && !query.id) {
                if (pathname === '/login' || pathname === '/register' || pathname === '/') {
                    res.writeHead(302, {
                        Location: `/users/${uid}/show`
                    })
                    res.end()
                }
                return {
                    pageProps,
                    user
                }
            } else {
                if (pathname !== '/login' && pathname !== '/register') {
                    res.writeHead(302, {
                        Location: `/login`
                    })
                    res.end()
                }
                return {
                    pageProps,
                    user: null
                }
            }
        } 
        return {
            pageProps,
            user: null
        }
    }

    componentDidMount() {
        (async() => {
            const firebase = await initFirebase()
            this.unsubscribe = firebase.auth().onAuthStateChanged(async user => {
                if (user && user.uid === this.props.router.query.id || user && !this.props.router.query.id) {
                    const token = await user.getIdToken()
                    await fetch('/api/login', {
                        method: 'POST',
                        headers: new Headers({
                            'Content-Type': 'application/json',
                            'Cache-Control': 'private'
                        }),
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            token
                        })
                    })
                    this.setState({loading: false, user})
                    if (Router.pathname === '/login' || Router.pathname === '/register') {
                        Router.push(`/users/${user.uid}/show`)
                    }
                } else {
                    await fetch('/api/logout', {
                        method: 'POST',
                        credentials: 'same-origin'
                    })
                    this.setState({loading: false, user: null})
                    if (Router.pathname !== '/login' && Router.pathname !== '/register' && Router.pathname !== '/') {
                        Router.push('/login')
                    }
                }
            })
        })()
    }

    componentWillUnmount() {
        this.unsubscribe && this.unsubscribe()
    }
        
    render() {
        const { Component } = this.props
        if (this.state.loading && !this.props.user && !this.state.user) {
            return (
                <div style = {
                    {
                        opacity: "0.5",
                        height: "100%",
                        width: "100%",
                        position: "absolute",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }
                } >
                <Spinner style={
                    {
                        width: '8rem',
                        height: '8rem'
                    }
                }
                color="info" 
                />
                </div>
            )
        } else {
            let user
            user = this.state.user && this.state.user
            user = this.props.user && this.props.user
            
            return (
                <>
                    <UserLayouts user={user} />
                    <Component user={user} />
                </>
            )
        }
    }
}