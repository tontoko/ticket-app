import { dev, prod } from '@/ticket-app'
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/functions";

const params = process.env.ENV === 'prod' ? prod : dev

if (!firebase.apps.length) {
    firebase.initializeApp(params);
}

export { firebase }
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const functions = firebase.functions();
