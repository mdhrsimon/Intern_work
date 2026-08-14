import { SET_USER, CLEAR_USERS, type User } from "./actions";

interface State {
  users: User[];
}

const initialState: State = {
  users: [],
};

const userReducer = (
  state = initialState,
  action: any
): State => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        users: [...state.users, action.payload],
      };

    case CLEAR_USERS:
      return {
        ...state,
        users: [],
      };

    default:
      return state;
  }
};

export default userReducer;