// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object

const dev = {
    apiKey: "AIzaSyAAM6WwY6Qf2bq1ozs0TPnQf-IVYhE-kDA",
    authDomain: "ticket-app-dev-11346.firebaseapp.com",
    databaseURL: "https://ticket-app-dev-11346.firebaseio.com",
    projectId: "ticket-app-dev-11346",
    storageBucket: "ticket-app-dev-11346.appspot.com",
    messagingSenderId: "281761028501",
    appId: "1:281761028501:web:66932763c4183de80e3e9c",
    measurementId: "G-XQZKF98653"
};

firebase.initializeApp(dev);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});