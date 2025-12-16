import React, { useState, useContext, useMemo, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
// Iconos de Lucide-React
import { Menu, FileText, UploadCloud, Search, CheckCircle, XCircle, Loader2, Plus, X } from 'lucide-react';
import { AuthContext } from '../auth/AuthContext';
import { getClients } from '../api/users';
import { Navbar } from './Navbar.jsx';
import { createDocumento } from '../api/documentos';

const Operacion = () => {
    const { user } = useContext(AuthContext)
    // Estado para la carga y selección
    const [selectedCategory, setSelectedCategory] = useState('informacion impositiva');
    const [selectedClient, setSelectedClient] = useState(null);
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [documentTypes, setDocumentTypes] = useState(['informacion impositiva', 'liquidacion de impuestos']);
    const [showAddTypeModal, setShowAddTypeModal] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');

    // ----------------------------------
    // Fetch clientes desde API
    // ----------------------------------
    useEffect(() => {
        const fetchClients = async () => {
            try {
                setClientsLoading(true);
                const res = await getClients();
                // Expecting paginated response or direct array
                const clientsList = Array.isArray(res?.data?.results) ? res.data.results : Array.isArray(res?.data) ? res.data : [];
                // Map API response to expected structure
                const mappedClients = clientsList.map(client => ({
                    id: client.id,
                    name: client.razon_social ,
                    cuit: client.cuit 
                }));
                setClients(mappedClients);
            } catch (err) {
                console.error('Error fetching clients', err);
                toast.error('Error al cargar los clientes');
                setClients([]);
            } finally {
                setClientsLoading(false);
            }
        };
        fetchClients();
    }, []);

    // ----------------------------------
    // Lógica de Tipos de Documentación
    // ----------------------------------

    const handleAddDocumentType = () => {
        const trimmedName = newTypeName.trim().toLowerCase();
        
        if (!trimmedName) {
            toast.error('El nombre del tipo no puede estar vacío.');
            return;
        }

        if (documentTypes.includes(trimmedName)) {
            toast.error('Este tipo de documentación ya existe.');
            return;
        }

        // Simulación: Agregar nuevo tipo
        setDocumentTypes([...documentTypes, trimmedName]);
        toast.success(`Tipo "${trimmedName}" agregado con éxito.`);
        setNewTypeName('');
        setShowAddTypeModal(false);
        setSelectedCategory(trimmedName); // Seleccionar automáticamente el nuevo tipo
    };

    const handleRemoveDocumentType = (typeToRemove) => {
        if (documentTypes.length <= 1) {
            toast.error('Debe haber al menos un tipo de documentación.');
            return;
        }

        setDocumentTypes(documentTypes.filter(type => type !== typeToRemove));
        
        if (selectedCategory === typeToRemove) {
            setSelectedCategory(documentTypes[0]);
        }
        
        toast.success(`Tipo "${typeToRemove}" eliminado.`);
    };

    // ----------------------------------
    // Lógica de Búsqueda de Clientes
    // ----------------------------------

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return clients.filter(client =>
            (client.name).toLowerCase().includes(lowerCaseSearch) ||
            (client.cuit ).includes(lowerCaseSearch)
        );
    }, [searchTerm, clients]);

    // ----------------------------------
    // Lógica de Carga de Archivo (Drag and Drop)
    // ----------------------------------

    const handleFileChange = (newFile) => {
        if (!newFile) {
            setFile(null);
            return;
        }
        // Validate file type
        if (newFile.type !== 'application/pdf') {
            toast.error('Solo se permiten archivos en formato PDF.');
            setFile(null);
            return;
        }
        // Validate file size (max 5MB)
        const maxSizeMB = 5;
        if (newFile.size > maxSizeMB * 1024 * 1024) {
            toast.error(`El archivo no puede exceder ${maxSizeMB}MB.`);
            setFile(null);
            return;
        }
        setFile(newFile);
        toast.success(`Archivo "${newFile.name}" cargado.`);
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

    const handleGuardar = async () => {
        if (!selectedClient) {
            toast.error('Debe seleccionar un cliente antes de guardar.');
            return;
        }
        if (!file) {
            toast.error('Debe cargar un archivo PDF antes de guardar.');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Guardando archivo...');

        try {
            const formData = new FormData();
            // field names expected by backend: adjust if necessary
            formData.append('file', file);
            formData.append('user', selectedClient.id);
            formData.append('type', selectedCategory);

            const res = await createDocumento(formData);

            // Success: common 2xx
            if (res && res.status >= 200 && res.status < 300) {
                toast.success(`PDF de "${selectedCategory}" guardado con éxito para ${selectedClient.name}.`, { id: toastId });
                setSelectedClient(null);
                setFile(null);
                setSearchTerm('');
            } else {
                // Unexpected but handled
                console.warn('createDocumento returned unexpected status', res);
                toast.error('No se pudo guardar el documento. Intente nuevamente.', { id: toastId });
            }
        } catch (err) {
            console.error('Error al guardar el archivo', err);
            // Try to extract useful message from server
            let message = 'Error al guardar el archivo. Intente nuevamente.';
            
            toast.error(message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = () => {
        setSelectedClient(null);
        setFile(null);
        setSearchTerm('');
    };

    // ----------------------------------
    // Componente principal (App)
    // ----------------------------------

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            

            <Navbar userRole={user?.role} />
            <Toaster position="top-right" />

            {/* 2. Contenido Principal */}
            <main className="flex-grow p-4 md:p-8 lg:p-10">
                
                {/* Contenedor principal de la tarjeta/operación */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                    
                {/* A. Selector de Categoría (Botones Toggle) con Opción de Agregar */}
                <div className="mb-8 border-b pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Tipo de Documentación</h3>
                        <button
                            onClick={() => setShowAddTypeModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Agregar Tipo</span>
                        </button>
                    </div>

                    {/* Grid de botones de categorías */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {documentTypes.map(category => (
                            <div key={category} className="relative group">
                                <button
                                    onClick={() => setSelectedCategory(category)}
                                    className={`w-full flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold tracking-wide ${
                                        selectedCategory === category
                                            ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {selectedCategory === category ? <CheckCircle className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                                    <span className="truncate">{category}</span>
                                </button>
                                
                                {/* Botón de eliminar (solo visible en hover y si hay más de un tipo) */}
                                {documentTypes.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveDocumentType(category)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                        title="Eliminar este tipo"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal para agregar nuevo tipo de documentación */}
                {showAddTypeModal && (
                    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Agregar Tipo de Documentación</h2>
                                <button
                                    onClick={() => {
                                        setShowAddTypeModal(false);
                                        setNewTypeName('');
                                    }}
                                    className="text-gray-500 hover:text-gray-700 transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Tipo
                                </label>
                                <input
                                    type="text"
                                    value={newTypeName}
                                    onChange={(e) => setNewTypeName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddDocumentType();
                                        }
                                    }}
                                    placeholder="Ej: facturas, comprobantes, etc."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    autoFocus
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowAddTypeModal(false);
                                        setNewTypeName('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddDocumentType}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                        {clientsLoading ? (
                            <div className="p-4 text-center text-gray-500">Cargando clientes...</div>
                        ) : filteredClients.length > 0 ? (
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

                    {/* E. Botones de Acción (Estilo Original y Horizontal) */}
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