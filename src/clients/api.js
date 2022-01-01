import axios from "axios";

const settings = {
    baseURL: 'http://localhost:8080'
}

const API = axios.create(settings);

export default API;
