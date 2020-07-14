import { dev, prod } from "@/ticket-app";

const initFirebaseAdmin = async () => {
    const firebase = await import('firebase-admin')

    if (!firebase.apps.length) {
        firebase.initializeApp();
        const params = process.env.VERCEL_GITHUB_COMMIT_REF === 'master' ? prod : dev
        const firestore = firebase.firestore();
        const storage = firebase.storage().bucket(params.storageBucket);
        if (process.env.NODE_ENV === "development") {
          firestore.settings({
            host: "localhost:8080",
            ssl: false,
          });
        }
        return { firebase, firestore, storage }
    }

    return { firebase, firestore: firebase.firestore(), storage: firebase.storage().bucket() };
    
}

export default initFirebaseAdmin