import React from 'react'
import App from 'next/app'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import UserLayouts from './layouts/userLayouts'
import initFirebase from '../initFirebase'
import Router from 'next/router'
import {Spinner} from 'reactstrap'
import NProgress from 'nprogress'
import { positions, Provider } from "react-alert";
import AlertTemplate from '../components/alert'
import Loading from '../components/loading'
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
            currentUser: null,
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
            await micro_session(_req, _res)
            const session = _req.session
            const uid = session.token ? session.token.uid : null
            if (uid && query.id && uid === query.id || uid && !query.id) {
                if (session.token.firebase.sign_in_provider === 'password' && !session.token.email_verified && pathname !== '/confirmEmail') {
                    res.writeHead(302, {
                        Location: '/confirmEmail'
                    })
                    res.end()
                } else if (pathname === '/login' || pathname === '/register' || pathname === '/') {
                    res.writeHead(302, {
                        Location: `/user`
                    })
                    res.end()
                }
                return {
                    pageProps,
                    user: session.token,
                    msg: query?.msg
                }
            } else {
                if (pathname !== '/login' && pathname !== '/register' && pathname.match(/^\/user/)) {
                    res.writeHead(302, {
                        Location: `/login`
                    })
                    res.end()
                }
            }
        } 
        return {
            pageProps,
            user: null,
            msg: null
        }
    }

    componentDidMount() {
        (async() => {
            const firebase = await initFirebase()
            this.unsubscribe = firebase.auth().onAuthStateChanged(async currentUser => {
                if (currentUser && currentUser.uid === this.props.router.query.id || currentUser && !this.props.router.query.id) {
                    const token = await currentUser.getIdToken()
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
                    this.state.loading ? this.setState({loading: false, currentUser}) : this.setState({loading: this.state.loading, currentUser})
                    if (!currentUser.emailVerified && currentUser.providerData[0].providerId === 'password'){
                        Router.push('/confirmEmail')
                        return
                    }
                    if (Router.pathname === '/login' || Router.pathname === '/register') {
                        Router.push(`/user`)
                    }
                } else {
                    await fetch('/api/logout', {
                        method: 'POST',
                        credentials: 'same-origin'
                    })
                    this.state.loading ? this.setState({loading: false, currentUser: null}) : this.setState({loading: this.state.loading, currentUser: null})
                    if (Router.pathname !== '/login' && Router.pathname !== '/register' && Router.pathname !== '/' && Router.pathname.match(/^\/user/)) {
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
        if (this.state.loading && !this.props.user && !this.state.currentUser) {
            return <Loading/>
        } else {
            const options = {
                timeout: 4000,
                position: 'top left'
            }
            let params = {
                email: '',
                sign_in_provider: '',
                picture: ''
            }
            if (this.state.currentUser) {
                const currentUser = this.state.currentUser
                let sign_in_provider 
                sign_in_provider = currentUser.providerData ? currentUser.providerData[0].providerId : 'password'
                params = {
                    email: currentUser.email,
                    sign_in_provider,
                    picture: currentUser.photoURL
                }
            } else if (this.props.user) {
                params = {
                    email: this.props.user.email,
                    sign_in_provider: this.props.user.firebase.sign_in_provider,
                    picture: this.props.user.picture
                }
            }

            return (
                <Provider template={AlertTemplate} {...options}>
                    <UserLayouts user={this.props.user} params={params} />
                    <Component user={this.props.user} params={params} />
                </Provider>
            )
        }
    }
}