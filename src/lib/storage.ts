import { fuego } from '@nandorojo/swr-firestore'

const storage = async () => {
  console.log(fuego)
  return fuego.storage()
}

export default storage
