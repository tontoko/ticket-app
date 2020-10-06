import { configure } from 'enzyme'
import EnzymeAdapter from 'enzyme-adapter-react-16'
import * as firebase from '@firebase/testing'
import { dev } from '@/ticket-app'
configure({ adapter: new EnzymeAdapter() })
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
firebase.initializeTestApp({ projectId: dev.projectId })
