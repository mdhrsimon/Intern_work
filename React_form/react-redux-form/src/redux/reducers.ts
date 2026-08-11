import { SET_USER } from "./actions";

interface User {
  name: string;
  email: string;
  education: string;
  dateOfBirth: string;
}

interface State {
  user: User | null;
}

const initialState: State = {
  user: null,
};

const userReducer = (
  state = initialState,
  action: any
): State => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

export default userReducer;