import React from 'react'
import App from 'next/app'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import UserLayouts from './layouts/userLayouts'
import initFirebase from '../initFirebase'
import Router from 'next/router'
import cookies from 'next-cookies'
import {Spinner} from 'reactstrap'

export default class MyApp extends App {
    constructor (props) {
        super(props)
        this.state = {
            loading: true,
            uid: null
        }
    }

    static async getInitialProps({ Component, ctx }) {
        let pageProps = {}
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }
        if (ctx.req) {
            // SSR
            const { uid } = cookies(ctx)
            if (uid && ctx.query.id && uid === ctx.query.id || uid && !ctx.query.id) {
                if (ctx.pathname === '/login' || ctx.pathname === '/register' || ctx.pathname === '/') {
                    ctx.res.writeHead(302, {
                        Location: `/users/${uid}/show`
                    })
                    ctx.res.end()
                }
                return {
                    pageProps,
                    uid: uid
                }
            } else {
                if (ctx.pathname !== '/login' && ctx.pathname !== '/register') {
                    ctx.res.writeHead(302, {
                        Location: `/login`
                    })
                    ctx.res.end()
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
            firebase.auth().onAuthStateChanged(async user => {
                if (user && user.uid === this.props.router.query.id || user && !this.props.router.query.id) {
                    this.setState({uid:user.uid})
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
                    this.setState({loading: false})
                    if (Router.pathname === '/login' || Router.pathname === '/register') {
                        Router.push(`/users/${user.uid}/show`)
                    }
                } else {
                    await fetch('/api/logout', {
                        method: 'POST',
                        credentials: 'same-origin'
                    })
                    this.setState({loading: false})
                    if (Router.pathname !== '/login' || Router.pathname !== '/register' || Router.pathname !== '/') {
                        Router.push(`/login`)
                    }
                }
            })
        })()
    }
        
    render() {
        const { Component } = this.props
        if (this.state.loading && !this.props.uid) {
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