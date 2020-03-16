import { dev, prod } from './ticket-app'

const initFirebaseAdmin = async () => {
    const firebase = await import('firebase-admin')
    if (!firebase.apps.length) {
        firebase.initializeApp()
    }
    const params = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? prod : dev
    const firestore = firebase.firestore()
    const storage = firebase.storage().bucket(params.storageBucket)
    return { firebase, firestore, storage }
}

export default initFirebaseAdmin