import { fuego } from '@nandorojo/swr-firestore'

const storage = async () => {
  return fuego.storage()
}

export default storage
