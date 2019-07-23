import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert } from 'reactstrap';
import { useState, useEffect } from 'react'
import Login from './login'
import React from 'react'
import Router from 'next/router'



export const Index: React.FC = () => {
    const [isLogin, setIsLogin] = useState<boolean>(false)

    useEffect(() => {
        if (isLogin) {
            Router.push('/users/1')
        }
    })

    return <Login setIsLogin={setIsLogin}/>
}

export default Index