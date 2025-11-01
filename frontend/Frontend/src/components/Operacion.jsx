import React, { useState, useMemo } from 'react';
// Iconos de Lucide-React
import { Menu, FileText, UploadCloud, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Navbar } from './NavBar'; 

// Datos de clientes simulados
const initialClients = [
    { id: 1, name: 'Tech Solutions S.A.', cuit: '30-71234567-8' },
    { id: 2, name: 'Distribuidora Global SRL', cuit: '20-34567890-1' },
    { id: 3, name: 'Marketing Digital Pro', cuit: '33-89012345-0' },
    { id: 4, name: 'Transportes Rápidos C.A.', cuit: '31-11111111-1' },
    { id: 5, name: 'Consultora Alfa y Omega', cuit: '27-22222222-2' },
    // Añado más clientes para forzar el scroll interno en la lista
    { id: 6, name: 'Inversiones Futuras S.R.L.', cuit: '30-44556677-9' },
    { id: 7, name: 'Innovación Web Ltda.', cuit: '20-88990011-2' },
    { id: 8, name: 'Logística Sur Americana', cuit: '33-12345678-0' },
    { id: 9, name: 'Servicios Integrales 2000', cuit: '27-98765432-1' },
    { id: 10, name: 'Comercializadora del Centro', cuit: '30-55555555-5' },
];

const Operacion = () => {
    // Estado para la carga y selección
    const [selectedCategory, setSelectedCategory] = useState('Informacion Impositiva');
    const [selectedClient, setSelectedClient] = useState(null);
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // ----------------------------------
    // Lógica de Búsqueda de Clientes
    // ----------------------------------

    const filteredClients = useMemo(() => {
        if (!searchTerm) return initialClients;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return initialClients.filter(client =>
            client.name.toLowerCase().includes(lowerCaseSearch) ||
            client.cuit.includes(lowerCaseSearch)
        );
    }, [searchTerm]);

    // ----------------------------------
    // Lógica de Carga de Archivo (Drag and Drop)
    // ----------------------------------

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

    // ----------------------------------
    // Lógica de Guardado (Simulado)
    // ----------------------------------

    const handleGuardar = () => {
        if (!selectedClient) {
            setStatusMessage({ type: 'error', text: 'Debe seleccionar un cliente antes de guardar.' });
            return;
        }
        if (!file) {
            setStatusMessage({ type: 'error', text: 'Debe cargar un archivo PDF antes de guardar.' });
            return;
        }

        setLoading(true);
        setStatusMessage({ type: 'info', text: 'Guardando archivo, por favor espere...' });

        // Simulación de subida a la API (2 segundos)
        setTimeout(() => {
            setLoading(false);
            setStatusMessage({
                type: 'success',
                text: `PDF de "${selectedCategory}" guardado con éxito para ${selectedClient.name}.`,
            });
            // Resetear estado después del guardado
            setSelectedClient(null);
            setFile(null);
            setSearchTerm('');
        }, 2000);
    };

    const handleCancelar = () => {
        setSelectedClient(null);
        setFile(null);
        setSearchTerm('');
        setStatusMessage({ type: '', text: '' });
    };

    // ----------------------------------
    // Componente principal (App)
    // ----------------------------------

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            
            {/* 1. Header Fijo (Operaciones) */}
            {/* <header className="sticky top-0 z-10 bg-white shadow-md p-4 flex items-center justify-between lg:justify-start lg:space-x-4">
                <Menu className="w-6 h-6 text-gray-600 lg:hidden" />
                <h1 className="text-2xl font-semibold text-gray-800">Operaciones</h1>
            </header> */}
            <Navbar userRole={'admin'} />

            {/* 2. Contenido Principal */}
            <main className="flex-grow p-4 md:p-8 lg:p-10">
                
                {/* Contenedor principal de la tarjeta/operación */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                    
                    {/* A. Selector de Categoría (Botones Toggle) */}
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 border-b pb-6">
                        {['Informacion Impositiva', 'Liquidacion Impuestos'].map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`w-full sm:w-1/2 flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold tracking-wide ${
                                    selectedCategory === category
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {selectedCategory === category ? <CheckCircle className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* B. Zona de Carga de Archivo (Drag and Drop) */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 
                            ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-100 hover:bg-gray-200'}`}
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
                                <p className="text-lg text-gray-700 font-medium mb-1">Arrastra y suelta tu PDF aquí</p>
                                <p className="text-sm text-gray-500 mb-4">o</p>
                                <label className="cursor-pointer inline-block px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                    Cargar archivo
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

                    {/* C. Buscador de Cliente */}
                    <div className="mt-8 mb-6 relative">
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
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl shadow-inner divide-y divide-gray-100">
                        {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                                <div
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    className={`p-4 flex justify-between items-center cursor-pointer transition-all duration-200 
                                        ${selectedClient?.id === client.id ? 'bg-orange-100 border-r-4 border-orange-500' : 'hover:bg-gray-50'}`}
                                >
                                    <div>
                                        {/* CORRECCIÓN: Usamos los datos reales del cliente */}
                                        <div className="font-semibold text-gray-800">{client.name}</div>
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
                    
                    {/* E. Mensajes de Estado */}
                    {statusMessage.text && (
                        <div className={`mt-6 p-3 rounded-lg flex items-center text-sm transition-all duration-300 ${
                            statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' :
                            statusMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' :
                            'bg-blue-100 text-blue-700 border border-blue-400'
                        }`} role="alert">
                            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            {statusMessage.text}
                        </div>
                    )}


                    {/* F. Botones de Acción (Estilo Original y Horizontal) */}
                    <div className="mt-8 flex justify-center space-x-4"> 
                        <button
                            onClick={handleCancelar}
                            disabled={loading}
                            // Estilo original: redondeado, sombra y color gris
                            className={`w-full sm:w-1/2 py-3 rounded-xl text-white font-bold transition duration-200 shadow-md ${
                                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardar}
                            disabled={loading}
                            // Estilo original: redondeado, sombra y color naranja
                            className={`w-full sm:w-1/2 py-3 rounded-xl text-white font-bold transition duration-200 shadow-md flex items-center justify-center ${
                                loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar'
                            )}
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Operacion;