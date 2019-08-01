import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react'
import Login from './login'
import React from 'react'
import {useRouter} from 'next/router'

export const Index: React.FC = () => {
    const router = useRouter()

    // トップページ作る
    return <Login/>
}

export default Index