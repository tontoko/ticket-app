import { useState, useEffect } from 'react'
import React from 'react'
import { useRouter } from 'next/router'

const Index: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    router && router.replace('/login')
  }, [router])

  // トップページ作る
  return <div>リダイレクトします...</div>
}

export default Index
