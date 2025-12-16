import axios from 'axios'
import attachAuthInterceptors from './attachAuthInterceptors'

const API_URL = import.meta.env.VITE_API_URL;

// Create instances and attach interceptors so they automatically include
// Authorization from localStorage and try refreshing on 401.
const employeeApi = axios.create({ baseURL: `${API_URL}/api/v1/employees/` });
attachAuthInterceptors(employeeApi);

export const getEmployees = () => employeeApi.get()
export const getEmployee = (id) => employeeApi.get(`${id}`)
export const createEmployees = (employee) => employeeApi.post('', employee)
export const updateEmployees = (id, employee) => employeeApi.put(`/${id}/`, employee)
export const partialUpdateEmployees = (id, employee) => employeeApi.patch(`/${id}/`, employee)
export const deleteEmployees = (id) => employeeApi.delete(`/${id}/`)

export const getEmployeesByUrl = (url, token) => {
    const config = {};
    const tokenToUse = token ?? (() => {
        try { return localStorage.getItem('accessToken') } catch (e) { return null }
    })();
    if (tokenToUse) config.headers = { Authorization: `Bearer ${tokenToUse}` };
    // If the URL is relative, axios will resolve it against the current origin. For absolute URLs use axios directly.
    return axios.get(url, config);
}

const clientApi = axios.create({ baseURL: `${API_URL}/api/v1/clients/` });
attachAuthInterceptors(clientApi);

// Keep previous signatures but we rely on interceptors for Authorization.
export const getClients = (params) => clientApi.get('', { params })
// Fetch a full url (useful for paginated `next`/`previous` which may be absolute URLs)
export const getClientsByUrl = (url, token) => {
    const config = {};
    const tokenToUse = token ?? (() => {
        try { return localStorage.getItem('accessToken') } catch (e) { return null }
    })();
    if (tokenToUse) config.headers = { Authorization: `Bearer ${tokenToUse}` };
    // If the URL is relative, axios will resolve it against the current origin. For absolute URLs use axios directly.
    return axios.get(url, config);
}
export const getClient = (id) => clientApi.get(`${id}`)
export const createClient = (client) => clientApi.post('', client)
export const updateClient = (id, client) => clientApi.put(`/${id}/`, client)
export const partialUpdateClient = (id, client) => clientApi.patch(`/${id}/`, client)
export const deleteClient = (id) => clientApi.delete(`/${id}/`)

const profileApi = axios.create(
    {
        baseURL : `${API_URL}/api/profile/`
    }
)
// Ensure profileApi includes auth interceptors so Authorization is automatic
attachAuthInterceptors(profileApi);
export const getProfile = () => profileApi.get('')
export const updateProfile = (profile) => profileApi.put('', profile)
export const partialUpdateProfile = (profile) => profileApi.patch('', profile)