import { dev, prod } from "@/ticket-app";
import admin from "firebase-admin";

const initFirebaseAdmin = async () => {
    const firebase = await import('firebase-admin')

    if (!firebase.apps.length) {
        firebase.initializeApp({
          credential: admin.credential.cert(JSON.parse(
            Buffer.from(
              process.env.GCLOUD_CREDENTIALS || "",
              "base64"
            ).toString()
          ),
        )});
        const params = process.env.ENV === 'prod' ? prod : dev
        const firestore = firebase.firestore();
        const storage = firebase.storage().bucket(params.storageBucket);
        if (process.env.ENV === "local") {
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