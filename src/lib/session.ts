import initFirebaseAdmin from '@/initFirebaseAdmin'

export default async() => {
  const session = (await import('micro-session')).default
  const FirestoreStore = (await import('firestore-store')).default(session)
  const { firestore } = await initFirebaseAdmin()
  const store = new FirestoreStore({
    database: firestore
  })

  return session({
    store,
    secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : 'dev secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: 'Lax',
      secure: true
    } as any
  })
}