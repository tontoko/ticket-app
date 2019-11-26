import React from 'react'
import App from 'next/app'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import UserLayouts from './layouts/userLayouts'
import initFirebase from '../initFirebase'
import Router from 'next/router'
import cookies from 'next-cookies'

export default class MyApp extends App {
    constructor (props) {
        super(props)
        this.state = {user: null}
    }

    static async getInitialProps({ Component, ctx, req, res }) {
        let pageProps = {}
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }
        if (ctx.req) {
            // SSR
            if (!ctx.pathname.match(/\/api\/.*/) && !ctx.pathname.match(/\/_next\/.*/)) {
                const { uid } = cookies(ctx)
                console.log(uid)
                if (uid) {
                    if (ctx.pathname === '/login' || ctx.pathname === '/register' || ctx.pathname === '/') {
                        ctx.res.writeHead(302, {
                            Location: `/users/${uid}`
                        })
                        ctx.res.end()
                        return {
                            pageProps,
                            uid
                        }
                    }
                } else {
                    if (ctx.pathname !== '/login' && ctx.pathname !== '/register') {
                        ctx.res.writeHead(302, {
                            Location: `/login`
                        })
                        ctx.res.end()
                        return {
                            pageProps,
                            uid
                        }
                    }
                }
            }
        } 
        return {
            pageProps
        }
    }

    componentDidMount() {
        (async() => {
            console.log(Router.pathname)
            const firebase = await initFirebase()
            firebase.auth().onAuthStateChanged(async user => {
                if (user) {
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
                    if (Router.pathname === '/login' || Router.pathname === '/register') {
                        // Router.push(`/users/${user.uid}`)
                        Router.push(`/users/show`)
                    }
                } else {
                    await fetch('/api/logout', {
                        method: 'POST',
                        credentials: 'same-origin'
                    })
                    if (Router.pathname !== '/login' || Router.pathname !== '/register' || Router.pathname !== '/') {
                        Router.push(`/login`)
                    }
                }
            })
        })()
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