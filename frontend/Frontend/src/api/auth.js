import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL;

const loginApi = axios.create(
    {
        baseURL : `${API_URL}/api/token/`
    }
)

export const login = (credentials) => loginApi.post('', credentials)

const refreshApi = axios.create(
    {
        baseURL : `${API_URL}/api/token/refresh/`
    }
)

export const refreshToken = (token) => refreshApi.post('', token)