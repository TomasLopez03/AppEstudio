import axios from 'axios'

const loginApi = axios.create(
    {
        baseURL : 'http://localhost:8000/api/token/'
    }
)

export const login = (credentials) => loginApi.post('', credentials)

const refreshApi = axios.create(
    {
        baseURL : 'http://localhost:8000/api/token/refresh/'
    }
)

export const refreshToken = (token) => refreshApi.post('', token)