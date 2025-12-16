import React, { useState, useContext, useMemo, useEffect } from 'react';
// Iconos de Lucide-React
import { Menu, FileText, UploadCloud, Search, CheckCircle, XCircle, Loader2, DollarSign } from 'lucide-react';
import { AuthContext } from '../auth/AuthContext';
import { Navbar } from './Navbar'
import { getClients } from '../api/users.js';
import { createHonorario } from '../api/honorarios.js';
import { toast, Toaster } from 'react-hot-toast';

export const HonorarioCarga = () => {
    const { user } = useContext(AuthContext)
    // Estado para la carga de datos
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [honorarioTitle, setHonorarioTitle] = useState(''); // Título del honorario
    const [honorarioAmount, setHonorarioAmount] = useState(''); // Monto del honorario
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Simulación de sidebar para la navegación
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [submitted, setSubmitted] = useState(false); // Para mostrar errores al intentar guardar
    const [fetchingClients, setFetchingClients] = useState(false);

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return clients.filter(client =>
            (client.razon_social || client.name || '').toLowerCase().includes(lowerCaseSearch) ||
            (client.cuit || '').includes(lowerCaseSearch)
        );
    }, [searchTerm, clients]);

    // Lógica de Carga de Archivo (Drag and Drop)
    const handleFileChange = (newFile) => {
        if (newFile && newFile.type === 'application/pdf') {
            setFile(newFile);
            setStatusMessage({ type: '', text: '' });
        } else {
            setFile(null);
            setStatusMessage({ type: 'error', text: 'Solo se permiten archivos en formato PDF.' });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-orange-500', 'bg-orange-50');
        const droppedFile = e.dataTransfer.files[0];
        handleFileChange(droppedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('border-orange-500', 'bg-orange-50');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-orange-500', 'bg-orange-50');
    };

    const handleGuardar = () => {
        setSubmitted(true);
        const amountValue = parseFloat(honorarioAmount);

        // Validate file is PDF before calling API
        if (!file || (file && file.type !== 'application/pdf' && !file.name?.toLowerCase?.().endsWith('.pdf'))) {
            const msg = 'El archivo debe ser un PDF.';
            setStatusMessage({ type: 'error', text: msg });
            toast.error(msg);
            return;
        }

        // 1. Validación
        if (!selectedClient || !honorarioTitle || !file || isNaN(amountValue) || amountValue <= 0) {
            setStatusMessage({ type: 'error', text: 'Por favor, complete todos los campos requeridos (Título, Cliente, Monto y PDF).' });
            return;
        }

        setLoading(true);
        setStatusMessage({ type: 'info', text: 'Registrando honorario, por favor espere...' });

        (async () => {
            try {
                const form = new FormData();
                // campos: adaptarlos si tu backend espera otros nombres
                form.append('user', selectedClient.id);
                form.append('title', honorarioTitle);
                form.append('amount', String(amountValue));
                form.append('honorario', file);

                const resp = await createHonorario(form);
                toast.success('Honorario creado correctamente');
                // Resetear estado después del guardado
                setSelectedClient(null);
                setFile(null);
                setSearchTerm('');
                setHonorarioTitle('');
                setHonorarioAmount('');
                setSubmitted(false);
                setStatusMessage({ type: 'success', text: 'Honorario creado correctamente.' });
            } catch (err) {
                console.error('Error creando honorario', err);
                const msg = err?.response?.data?.detail || err?.response?.data || err?.message || 'Error al crear honorario.';
                toast.error(String(msg));
                setStatusMessage({ type: 'error', text: String(msg) });
            } finally {
                setLoading(false);
            }
        })();
    };

    const handleCancelar = () => {
        setSelectedClient(null);
        setFile(null);
        setSearchTerm('');
        setHonorarioTitle('');
        setHonorarioAmount('');
        setStatusMessage({ type: '', text: '' });
        setSubmitted(false);
    };

    // Cargar clientes desde API
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setFetchingClients(true);
                const res = await getClients({ page_size: 200 });
                const payload = res?.data ?? {};
                const data = payload.results ?? payload ?? [];
                if (mounted) setClients(data);
            } catch (err) {
                console.error('Error fetching clients', err);
                toast.error('Error al obtener clientes');
            } finally {
                if (mounted) setFetchingClients(false);
            }
        })();
        return () => { mounted = false };
    }, []);

    // Función para aplicar clases de error al input de monto
    const getAmountErrorClass = () => {
        const amountValue = parseFloat(honorarioAmount);
        return submitted && (isNaN(amountValue) || amountValue <= 0)
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-orange-500';
    };

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col font-sans'>
            <Navbar userRole={user?.role} />
            <Toaster position="top-center" />
            {/* Sidebar (Mobile - Opcional, para simular navegación) */}
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden transition duration-300 ease-in-out bg-white w-64 z-20 shadow-xl p-4`}>
                <div className="text-lg font-bold mb-4">Menú</div>
                {/* Aquí irían los enlaces de navegación */}
                <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100">Dashboard</button>
                <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100 text-orange-600 font-semibold">Clientes</button>
                <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100">Reportes</button>
            </div>
            {/* Overlay para cerrar Sidebar */}
            {isSidebarOpen && <div className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* 2. Contenido Principal */}
            <main className="flex-grow p-4 md:p-8 lg:p-10">

                {/* Contenedor principal de la tarjeta/operación */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">

                    {/* A. Ingreso del Título del Honorario */}
                    <div className="mb-8 border-b pb-6">
                        <label htmlFor="titulo" className="block text-lg font-semibold text-gray-700 mb-3">
                            Título del Honorario *
                        </label>
                        <input
                            type="text"
                            id="titulo"
                            placeholder="Ej: Honorario mensual - Servicios legales"
                            value={honorarioTitle}
                            onChange={(e) => setHonorarioTitle(e.target.value)}
                            disabled={loading}
                            className={`w-full py-3 px-4 border rounded-xl text-lg font-semibold transition shadow-sm focus:outline-none focus:ring-2 ${submitted && !honorarioTitle ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
                        />
                        {submitted && !honorarioTitle && (
                            <p className="text-red-500 text-sm mt-2">El título del honorario es obligatorio.</p>
                        )}
                    </div>

                    {/* B. Ingreso del Monto del Honorario */}
                    <div className="mb-8 border-b pb-6">
                        <label htmlFor="honorario" className="block text-lg font-semibold text-gray-700 mb-3">
                            Monto del Honorario a Cargar ($)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="honorario"
                                placeholder="0.00"
                                step="0.01"
                                value={honorarioAmount}
                                onChange={(e) => setHonorarioAmount(e.target.value)}
                                disabled={loading}
                                className={`w-full py-4 pl-12 pr-4 border rounded-xl text-3xl font-extrabold text-orange-600 transition shadow-sm focus:outline-none focus:ring-2 ${getAmountErrorClass()}`}
                            />
                            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        </div>
                        {submitted && (parseFloat(honorarioAmount) <= 0 || isNaN(parseFloat(honorarioAmount))) && (
                            <p className="text-red-500 text-sm mt-2">El monto del honorario es obligatorio y debe ser mayor a cero.</p>
                        )}
                    </div>

                    {/* C. Buscador de Cliente */}
                    <div className="mb-6 relative">
                        <input
                            type="text"
                            placeholder="Buscar cliente (Razón Social o CUIT)"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedClient(null);
                            }}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>

                    {/* D. Lista de Clientes (Selección) - Control de Scroll Interno */}
                    <div className={`max-h-64 overflow-y-auto border rounded-xl shadow-inner divide-y divide-gray-100 mb-8 
                                    ${submitted && !selectedClient ? 'border-red-400' : 'border-gray-200'}`}>
                        {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                                <div
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    className={`p-4 flex justify-between items-center cursor-pointer transition-all duration-200 
                                        ${selectedClient?.id === client.id ? 'bg-orange-100 border-r-4 border-orange-500' : 'hover:bg-gray-50'}`}
                                >
                                    <div>
                                        <div className="font-semibold text-gray-800">{client.razon_social}</div>
                                        <div className="text-sm text-gray-500">CUIT: {client.cuit}</div>
                                    </div>
                                    {selectedClient?.id === client.id && (
                                        <CheckCircle className="w-5 h-5 text-orange-600" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">No se encontraron clientes.</div>
                        )}
                    </div>

                    {/* E. Zona de Carga de Archivo (Drag and Drop) */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 
                            ${file ? 'border-green-500 bg-green-50' : (submitted && !file ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-100 hover:bg-gray-200')}`}
                    >
                        {file ? (
                            <div className="flex items-center justify-center space-x-3 text-green-700">
                                <FileText className="w-6 h-6" />
                                <span className="font-semibold text-lg">{file.name}</span>
                                <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 p-1">
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="w-10 h-10 mx-auto text-gray-500 mb-2" />
                                <p className="text-lg text-gray-700 font-medium mb-1">Arrastra y suelta el PDF de Detalle de Honorario</p>
                                <p className="text-sm text-gray-500 mb-4">o</p>
                                <label className="cursor-pointer inline-block px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                    Cargar PDF
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => handleFileChange(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-gray-400 mt-2">Máx. 5MB. Solo formato PDF.</p>
                            </>
                        )}
                    </div>


                    {/* F. Mensajes de Estado */}
                    {statusMessage.text && (
                        <div className={`mt-6 p-3 rounded-lg flex items-center text-sm transition-all duration-300 ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' :
                                statusMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' :
                                    'bg-blue-100 text-blue-700 border border-blue-400'
                            }`} role="alert">
                            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            {statusMessage.text}
                        </div>
                    )}


                    {/* G. Botones de Acción (Estilo Consistente) */}
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            onClick={handleCancelar}
                            disabled={loading}
                            // Estilo: redondeado, sombra y color gris
                            className={`w-full sm:w-1/2 py-3 rounded-xl text-white font-bold transition duration-200 shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'
                                }`}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardar}
                            disabled={loading}
                            // Estilo: redondeado, sombra y color naranja (para acción principal)
                            className={`w-full sm:w-1/2 py-3 rounded-xl text-white font-bold transition duration-200 shadow-md flex items-center justify-center ${loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                    Guardando...
                                </>
                            ) : (
                                'Registrar Honorario'
                            )}
                        </button>
                    </div>

                </div>
            </main>
        </div>
    )
}
