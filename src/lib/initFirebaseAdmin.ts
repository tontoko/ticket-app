import { dev, prod } from "@/ticket-app";

const initFirebaseAdmin = async () => {
    const firebase = await import('firebase-admin')
    let initialized = false
    if (!firebase.apps.length) {
        firebase.initializeApp()
        initialized = true
    }
    const params = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? prod : dev
    const firestore = firebase.firestore()
    const storage = firebase.storage().bucket(params.storageBucket)
    if (process.env.NODE_ENV === "development" && initialized) {
      firestore.settings({
        host: "localhost:8080",
        ssl: false,
      });
    }
    return { firebase, firestore, storage }
}

export default initFirebaseAdmin