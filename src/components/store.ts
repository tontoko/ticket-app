import { createStore, AnyAction } from "redux";
import { MakeStore, createWrapper, Context, HYDRATE } from "next-redux-wrapper";

export interface State {
  user: firebase.User;
}

const initialState: State = { user: null }

// create your reducer
const reducer = (state: State = initialState, action: AnyAction) => {
  switch (action.type) {
    case HYDRATE:
      return { ...state, ...action.payload };
    case "LOGIN_STATE":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

// create a makeStore function
const makeStore: MakeStore<State> = (context: Context) => createStore(reducer);

// export an assembled wrapper
export const wrapper = createWrapper<State>(makeStore, { debug: process.env.NODE_ENV === 'development' });
