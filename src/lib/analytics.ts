import { fuego } from '@nandorojo/swr-firestore'

const analytics = async () => {
  await import('firebase/analytics')
  return fuego.db.app.analytics()
}

export default analytics
