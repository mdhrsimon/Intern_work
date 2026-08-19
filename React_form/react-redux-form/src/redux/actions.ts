export const SET_USER = "SET_USER";
export const CLEAR_USERS = "CLEAR_USERS";

export interface Education {
  degree: string;
  institute: string;
  yearPassed: string;
}

export interface User {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  education: Education[];
}

export const setUser = (user: User) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

export const clearUsers = () => {
  return {
    type: CLEAR_USERS,
  };
};