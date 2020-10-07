import storage from '@/src/lib/storage'

const getImg = async (img: string, uid: string, size?: '800' | '360') => {
  if (!img) return '/images/event_default_360x360.jpg'

  const ref = (await storage()).ref(`${uid}/events`)

  if (size === '360') {
    try {
      const url: string = await ref.child(`${img}_360x360.jpg`).getDownloadURL()

      return url
    } catch {
      console.warn(`${img}_360x360.jpg not found`)
    }

    try {
      const url: string = await ref.child(`${img}.jpg`).getDownloadURL()
      return url
    } catch {
      return (await (await storage()).ref('event_default_360x360.jpg').getDownloadURL()) as string
    }
  }

  try {
    const url: string = await ref.child(`${img}_800x800.jpg`).getDownloadURL()

    return url
  } catch {
    console.warn(`${img}_800x800.jpg not found`)
  }

  try {
    const url: string = await ref.child(`${img}_360x360.jpg`).getDownloadURL()

    return url
  } catch {
    console.warn(`${img}_800x800.jpg not found`)
  }

  try {
    const url: string = await ref.child(`${img}.jpg`).getDownloadURL()
    return url
  } catch {
    return '/images/event_default_360x360.jpg'
  }
}

export default getImg
