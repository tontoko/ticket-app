import initFirebase from '../initFirebase'

export default async (img:string, size?: string) => {
  const {firebase, storage} = await initFirebase()
  
  if (!img) return storage.ref('event_default_360x360.jpg').getDownloadURL()
  
  const ref = storage.ref(`${firebase.auth().currentUser.uid}/events`)
  
  if (size !== '800x800') {

    try {
      const url = await ref.child(`${img}_360x360.jpg`).getDownloadURL()
      
      return url
    } catch { }

    try {
      const url = await ref.child(`${img}.jpg`).getDownloadURL()
      return url
    } catch {
      return storage.ref('event_default_360x360.jpg').getDownloadURL()
    }

  } else {
    try {
      const url = await ref.child(`${img}_800x800.jpg`).getDownloadURL()

      return url
    } catch { }

    try {
      const url = await ref.child(`${img}_360x360.jpg`).getDownloadURL()

      return url
    } catch { }

    try {
      const url = await ref.child(`${img}.jpg`).getDownloadURL()
      return url
    } catch {
      return storage.ref('event_default_800x800.jpg').getDownloadURL()
    }

  }
}