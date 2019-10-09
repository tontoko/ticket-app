const initFirebase = async () => {
    const firebase = await import('firebase/app')
    await import('firebase/auth')
    await import('firebase/firestore')
    if (!firebase.apps.length) {
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_APIKEY_DEV,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN_DEV,
            databaseURL: process.env.FIREBASE_DATABASE_URL_DEV,
            projectId: process.env.FIREBASE_PROJECT_ID_DEV,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET_DEV,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID_DEV,
            appId: process.env.FIREBASE_APP_ID_DEV
        }
        firebase.initializeApp(firebaseConfig)
    }
    return firebase
}

export default initFirebase