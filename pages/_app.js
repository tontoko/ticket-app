import React from 'react'
import App from 'next/app'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import UserLayouts from './layouts/userLayouts'
import initFirebase from '../initFirebase'
import Router from 'next/router'
import {Spinner} from 'reactstrap'

export default class MyApp extends App {
    constructor (props) {
        super(props)
        this.state = {
            loading: true,
            uid: ''
        }
    }

    static async getInitialProps({ Component, ctx }) {
        let pageProps = {}
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }
        if (ctx.req) {
            const { req, res, pathname, query } = ctx
            if (pathname.match(/api/) || pathname.match(/_next/)) {
                return {
                    pageProps,
                    uid: ''
                }
            }
            // SSR
            const { useSession } = require('next-session')
            const _req = {...req}
            const _res = {...res}
            await useSession(_req, _res);
            const session = _req.session
            const uid = session && session.token ? session.token.uid : null
            if (uid && query.id && uid === query.id || uid && !query.id) {
                if (pathname === '/login' || pathname === '/register' || pathname === '/') {
                    res.writeHead(302, {
                        Location: `/users/${uid}/show`
                    })
                    res.end()
                }
                return {
                    pageProps,
                    uid: uid
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
                    uid: ''
                }
            }
        } 
        return {
            pageProps,
            uid: ''
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
                    this.setState({loading: false, uid:user.uid})
                    if ((Router.pathname === '/login' || Router.pathname === '/register') && user.uid) {
                        Router.push(`/users/${user.uid}/show`)
                    }
                } else {
                    await fetch('/api/logout', {
                        method: 'POST',
                        credentials: 'same-origin'
                    })
                    this.setState({loading: false, uid: ''})
                    if (Router.pathname !== '/login' || Router.pathname !== '/register' || Router.pathname !== '/') {
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
        if (this.state.loading && !this.props.uid && !this.state.uid) {
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
                color="info" />
                    </div>
                )
        } else {
            return (
                <>
                    <UserLayouts {...this.props} {...this.state} />
                    <Component {...this.props} {...this.state} />
                </>
            )
        }
    }
}