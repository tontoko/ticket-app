import { GetServerSideProps } from "next"
import isLogin from "@/src/lib/isLogin"

const messages = () => {
  return (
    <>
      <div/>
    </>
  )
}

export default messages

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user } = await isLogin(ctx)
  return { props: { user } }
}