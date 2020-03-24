import initFirebaseAdmin from '@/initFirebaseAdmin'

export default async() => {
  const session = (await import('micro-session')).default

  const FirestoreStore = require('firestore-store')(session)
  const { firestore } = await initFirebaseAdmin()

  return session({
    store: new FirestoreStore({
      database: firestore
    }),
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  })
}