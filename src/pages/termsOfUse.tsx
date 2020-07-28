import { useState, useEffect } from 'react'
import React from 'react'
import {useRouter} from 'next/router'
import Text from '@/termsOfUse.mdx'
import { GetServerSideProps } from 'next'
import isLogin from '../lib/isLogin'

const TermsOfUse: React.FC = () => <Text />

export default TermsOfUse

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { user } = await isLogin(ctx);
  return { props: { user } };
};