import React from 'react'
import App, { Container } from 'next/app'
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import UserLayouts from './layouts/userLayouts'
import Router from 'next/router'

export default class MyApp extends App {
    static async getInitialProps({ Component, router, ctx }) {
        let pageProps = {}

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }

        return { pageProps }
    }
    
    render() {
        const { Component, pageProps } = this.props
        
        return (
            <Container>
                <UserLayouts />
                <Component {...pageProps} />
            </Container>
        )
    }
}