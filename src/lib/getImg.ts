import initFirebase from '@/src/lib/initFirebase'

export default async (img:string, uid: string, size?: string) => {
  const {firebase, storage} = await initFirebase()
  
  if (!img) return await storage.ref('event_default_360x360.jpg').getDownloadURL() as string
  
  const ref = storage.ref(`${uid}/events`)
  
  if (size !== '800') {

    try {
      const url: string = await ref.child(`${img}_360x360.jpg`).getDownloadURL()
      
      return url
    } catch { }

    try {
      const url: string = await ref.child(`${img}.jpg`).getDownloadURL()
      return url
    } catch {
      return await storage.ref('event_default_360x360.jpg').getDownloadURL() as string
    }

  } else {
    try {
      const url: string = await ref.child(`${img}_800x800.jpg`).getDownloadURL()

      return url
    } catch { }

    try {
      const url: string = await ref.child(`${img}_360x360.jpg`).getDownloadURL()

      return url
    } catch { }

    try {
      const url: string = await ref.child(`${img}.jpg`).getDownloadURL()
      return url
    } catch {
      return await storage.ref('event_default_800x800.jpg').getDownloadURL() as string
    }

  }
}