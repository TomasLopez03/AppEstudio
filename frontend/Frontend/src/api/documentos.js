import axios from 'axios';
import attachAuthInterceptors from './attachAuthInterceptors';

const API_URL = import.meta.env.VITE_API_URL;
const documentosApi = axios.create({ baseURL: `${API_URL}/api/v1/documentos/` });
attachAuthInterceptors(documentosApi);

export const getDocumentos = (params) => documentosApi.get('', { params });
export const getDocumento = (id) => documentosApi.get(`${id}`);
export const createDocumento = (documento) => documentosApi.post('', documento);
export const updateDocumento = (id, documento) => documentosApi.put(`/${id}/`, documento);
export const partialUpdateDocumento = (id, documento) => documentosApi.patch(`/${id}/`, documento);
export const deleteDocumento = (id) => documentosApi.delete(`/${id}/`);

