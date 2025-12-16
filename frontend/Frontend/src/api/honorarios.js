import axios from "axios";
import attachAuthInterceptors from './attachAuthInterceptors'

const API_URL = import.meta.env.VITE_API_URL;
const honorariosApi = axios.create({ baseURL: `${API_URL}/api/v1/honorario/` });
attachAuthInterceptors(honorariosApi);

// Allow passing query params (status, user, page, page_size, search, etc.)
export const getHonorarios = (params) => honorariosApi.get('', { params })
export const getHonorario = (id) => honorariosApi.get(`${id}`)
// createHonorario expects either an object or FormData; when sending FormData axios will set multipart headers
export const createHonorario = (honorario) => honorariosApi.post('', honorario)
export const updateHonorario = (id, honorario) => honorariosApi.put(`/${id}/`, honorario)
export const partialUpdateHonorario = (id, honorario) => honorariosApi.patch(`/${id}/`, honorario)
export const deleteHonorario = (id) => honorariosApi.delete(`/${id}/`)


const paymentApi = axios.create({ baseURL: `${API_URL}/api/v1/payment/` });
attachAuthInterceptors(paymentApi);

export const getPayments = (params) => paymentApi.get('', { params })
export const getPayment = (id) => paymentApi.get(`${id}`)
export const createPayment = (payment) => paymentApi.post('', payment)
export const updatePayment = (id, payment) => paymentApi.put(`/${id}/`, payment)
export const partialUpdatePayment = (id, payment) => paymentApi.patch(`/${id}/`, payment)