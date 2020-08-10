import storage from '@/src/lib/storage'

const getImg = async (img:string, uid: string, size?: '800' | '360') => {
  
  if (!img) return await (await storage()).ref('event_default_360x360.jpg').getDownloadURL() as string
  
  const ref = (await storage()).ref(`${uid}/events`);
  
  if (size === '360') {

    try {
      const url: string = await ref.child(`${img}_360x360.jpg`).getDownloadURL()
      
      return url
    } catch { }

    try {
      const url: string = await ref.child(`${img}.jpg`).getDownloadURL()
      return url
    } catch {
      return await(await storage())
        .ref("event_default_360x360.jpg")
        .getDownloadURL() as string;
    }

  }

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
    return await(await storage())
      .ref("event_default_800x800.jpg")
      .getDownloadURL() as string;
  }
}

export default getImg