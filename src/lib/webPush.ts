import "firebase/messaging";
import { fuego } from "@nandorojo/swr-firestore";

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseCloudMessaging = {
  init: async function (user, env) {
    try {
      const messaging = fuego.db.app.messaging();

      const registration = await navigator.serviceWorker.register(`/firebase-messaging-${env}-sw.js`)
      messaging.useServiceWorker(registration);

      await messaging.requestPermission();
      const token = await messaging.getToken();

      user &&
        fuego.db.collection("users").doc(user.uid).update({
          fcmToken: token,
        });
    } catch (error) {
      console.error(error);
    }
  },
};

export { firebaseCloudMessaging };
