// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object

const prod = {
    apiKey: "AIzaSyBmnjqVpEucx3x-J--A9Os1OwHQ0jRe8xY",
    authDomain: "ticket-app-d3f5a.firebaseapp.com",
    databaseURL: "https://ticket-app-d3f5a.firebaseio.com",
    projectId: "ticket-app-d3f5a",
    storageBucket: "ticket-app-d3f5a.appspot.com",
    messagingSenderId: "177666146990",
    appId: "1:177666146990:web:d01b84e183097974",
    measurementId: "G-3BFJ314324"
}


firebase.initializeApp(firebaseconfig);

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