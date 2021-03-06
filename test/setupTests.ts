import { configure } from 'enzyme'
import firebase from 'firebase-admin'
import EnzymeAdapter from 'enzyme-adapter-react-16'
import { dev } from '@/ticket-app'
configure({ adapter: new EnzymeAdapter() })
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
jest.setTimeout(100000)
jest.retryTimes(3)
firebase.initializeApp(dev)
