import { configure } from "enzyme";
import EnzymeAdapter from "enzyme-adapter-react-16";
configure({ adapter: new EnzymeAdapter() });
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'