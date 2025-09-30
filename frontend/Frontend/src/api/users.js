import axios from 'axios'

const employeeApi = axios.create(
    {
        baseURL : 'http://localhost:8000/api/employees/'
    }
)

export const getProducts = () => employeeApi.get()
export const getProduct = (id) => employeeApi.get(`${id}`)
export const createProduct = (employee) => employeeApi.post('', employee)
export const updateProduct = (id, employee) => employeeApi.put(`/${id}/`, employee)
export const partialUpdateProduct = (id, employee) => employeeApi.patch(`/${id}/`, employee)
export const deleteProduct = (id) => employeeApi.delete(`/${id}/`)


const clientApi = axios.create(
    {
        baseURL : 'http://localhost:8000/api/clients/'
    }
)

export const getClients = () => clientApi.get()
export const getClient = (id) => clientApi.get(`${id}`)
export const createClient = (client) => clientApi.post('', client)
export const updateClient = (id, client) => clientApi.put(`/${id}/`, client)
export const partialUpdateClient = (id, client) => clientApi.patch(`/${id}/`, client)
export const deleteClient = (id) => clientApi.delete(`/${id}/`)

const profileApi = axios.create(
    {
        baseURL : 'http://localhost:8000/api/profile/'
    }
)

export const getProfile = (id) => profileApi.get(`${id}`)
export const updateProfile = (id, profile) => profileApi.put(`/${id}/`, profile)
export const partialUpdateProfile = (id, profile) => profileApi.patch(`/${id}/`, profile)