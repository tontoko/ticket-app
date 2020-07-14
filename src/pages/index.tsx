import { useState, useEffect } from 'react'
import Login from './login'
import React from 'react'
import {useRouter} from 'next/router'

export const Index: React.FC = () => {
    const router = useRouter()

    useEffect(() => {
        location.replace('/login')
    }, [])

    // トップページ作る
    return <div>リダイレクトします...</div>
}

export default Index