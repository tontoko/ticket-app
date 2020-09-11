import { dev, prod } from "@/ticket-app";
import admin from "firebase-admin";

const initFirebaseAdmin = async () => {
  const firebase = await import("firebase-admin");
  const params = process.env.ENV === "prod" ? prod : dev;
  let init = true

  if (!firebase.apps.length) {
    init = false
    if (process.env.NODE_ENV === "test") {
      firebase.initializeApp();
    } else {
      firebase.initializeApp({
        credential: admin.credential.cert(
          JSON.parse(
            Buffer.from(
              process.env.GCLOUD_CREDENTIALS || "",
              "base64"
            ).toString()
          )
        ),
      });
    }
  }

  const firestore = firebase.firestore();
  const storage = firebase.storage().bucket(params.storageBucket);
  const messaging = firebase.messaging();
  if (!init && process.env.NODE_ENV === "test")
    firestore.settings({
      host: "localhost:8080",
      ssl: false,
    });

  return { firebase, firestore, storage, messaging };
}

export default initFirebaseAdmin