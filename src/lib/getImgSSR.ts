import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'

export default async (img:string, uid:string, size?: '360'|'800') => {
  const { storage } = await initFirebaseAdmin()
  const date = new Date
  
  const ref = `${uid}/events`
  const filepath = `${ref}/${img}`
  const defaultPath = `event_default`
  const sizeSuffix = size ? `_${size}x${size}.jpg` : '_360x360.jpg'
  const anotherSuffix = size ? '_360x360.jpg' : `_800x800.jpg`

  let result:boolean
  if (!img) return (await storage.file(`${defaultPath}${sizeSuffix}`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours()+1) }))[0] as string

  [result] = await storage.file(`${filepath}${sizeSuffix}`).exists()
  if (result) {
    return (await storage.file(`${filepath}${sizeSuffix}`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
  }

  [result] = await storage.file(`${filepath}${anotherSuffix}`).exists()
  if (result) {
    return (await storage.file(`${filepath}${anotherSuffix}`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
  }
  
  [result] = await storage.file(`${filepath}.jpg`).exists()
  if (result) {
    return (await storage.file(`${filepath}.jpg`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string
  }

  return (await storage.file(`${defaultPath}${sizeSuffix}`).getSignedUrl({ action: 'read', expires: date.setHours(date.getHours() + 1) }))[0] as string

}