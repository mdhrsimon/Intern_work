import axios from "axios";

const API_URL = "https://localhost:7028/api/users";

export const createUser = (user: any) => {
    return axios.post(API_URL, user);
};

export const getUsers = () => {
    return axios.get(API_URL);
};

export const clearUsers = () => {
    return axios.delete(API_URL);
};