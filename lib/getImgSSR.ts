import initFirebaseAdmin from '@/initFirebaseAdmin'

export default async (img:string, uid:string, size?: string) => {
  const { storage } = await initFirebaseAdmin()
  const date = new Date
  
  const ref = `${uid}/events`
  const filepath = `${ref}/${img}`
  const defaultPath = `event_default`

  if (!img) return (await storage.file(`${defaultPath}_360x360.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours()+1) }))[0] as string
  
  if (size !== '800x800') {

    try {
      return (await storage.file(`${filepath}_360x360.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
    } catch { }

    try {
      return (await storage.file(`${filepath}.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
    } catch {
      return (await storage.file(`${defaultPath}_360x360.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
    }

  } else {
    try {
      return (await storage.file(`${filepath}_800x800.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
    } catch { }

    try {
      return (await storage.file(`${filepath}_360x360.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
    } catch { }

    try {
      return (await storage.file(`${filepath}.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
    } catch {
      return (await storage.file(`${defaultPath}_800x800.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
    }

  }
}