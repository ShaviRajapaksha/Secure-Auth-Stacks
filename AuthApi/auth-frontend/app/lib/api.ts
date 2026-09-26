import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5122/api",
    withCredentials: true,
});

export default api;