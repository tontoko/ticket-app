import initFirebaseAdmin from '@/initFirebaseAdmin'

export default async (img:string, uid:string, size?: string) => {
  const { storage } = await initFirebaseAdmin()
  const date = new Date
  
  const ref = `${uid}/events`
  const filepath = `${ref}/${img}`
  const defaultPath = `event_default`
  const sizeSuffix = size ? `_${size}x${size}.jpg` : '_360x360.jpg'
  const anotherSuffix = size ? '_360x360.jpg' : `_800x800.jpg`

  if (!img) return (await storage.file(`${defaultPath}${sizeSuffix}`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours()+1) }))[0] as string
  
  if (await storage.file(`${filepath}${sizeSuffix}`).exists()) {
    return (await storage.file(`${filepath}${sizeSuffix}`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
  }
  if (await storage.file(`${filepath}${anotherSuffix}`).exists()) {
    return (await storage.file(`${filepath}${anotherSuffix}`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
  }
  if (await storage.file(`${filepath}.jpg`).exists()) {
    return (await storage.file(`${filepath}.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
  }

  return (await storage.file(`${defaultPath}${sizeSuffix}`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string

}