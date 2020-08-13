import "firebase/messaging";
import localforage from "localforage";
import { fuego } from "@nandorojo/swr-firestore";

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseCloudMessaging = {
  tokenInlocalforage: async () => {
    return localforage.getItem("fcm_token");
  },

  init: async function (env) {
    try {
      const messaging = fuego.db.app.messaging();

      if ((await this.tokenInlocalforage()) !== null) {
        return
      }

      const registration = await navigator.serviceWorker.register(
        `/firebase-messaging-${env}-sw.js`
      );
      messaging.useServiceWorker(registration);

      await messaging.requestPermission();
      const token = await messaging.getToken();

      await localforage.setItem("fcm_token", token);
    } catch (error) {
      console.error(error);
    }
  },
};

export { firebaseCloudMessaging };
