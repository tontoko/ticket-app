import Link from 'next/link'
import React from 'react'
import {Dispatch, SetStateAction} from 'react'

interface CustomInputProps {
    setIsLogin: Dispatch<SetStateAction<boolean>>; 
}

export const Login: React.FC<CustomInputProps> = (props) => {

    return (
        <>
            <p>login</p>
            <Link href="/register"><a>register</a></Link>
            <button onClick={() => props.setIsLogin(true)}>ログイン</button>
        </>
    );
}

export default Login