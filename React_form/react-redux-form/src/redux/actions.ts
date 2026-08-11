export const SET_USER = "SET_USER";

export const setUser = (user: {
  name: string;
  email: string;
  education: string;
  dateOfBirth: string;
}) => {
  return {
    type: SET_USER,
    payload: user,
  };
};