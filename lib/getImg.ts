import initFirebase from '../initFirebase'

export default async (uid:string, img:string, size?: string) => {
  const firebase = await initFirebase()
  const storage = firebase.storage()
  
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