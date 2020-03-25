import initFirebaseAdmin from '@/initFirebaseAdmin'

export default async() => {
  const session = (await import('micro-session')).default
  const FirestoreStore = (await import('firestore-store')).default(session)
  const { firestore } = await initFirebaseAdmin()

  return session({
    store: new FirestoreStore({
      database: firestore
    }),
    secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : 'dev secret',
    resave: true,
    saveUninitialized: true
  })
}