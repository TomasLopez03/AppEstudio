import { useState, useMemo, useContext, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { FileText, Download, Filter, Eye, Calendar, Hash, Zap, ChevronLeft, ChevronRight, Menu, Search, Plus } from 'lucide-react';
import { AuthContext } from '../auth/AuthContext';
import { getDocumentos } from '../api/documentos';
import Navbar from './Navbar';

// Definimos los tipos de documentos con etiquetas y valores
const documentTypes = [
    { value: '', label: 'Todos' },
    { value: 'informacion impositiva', label: 'Info. Impositiva' },
    { value: 'liquidacion de impuestos', label: 'Liquidación Imp.' },
];

// Removed: mockDocuments now fetched from API

export const ListDocuments = () => {
    const { user } = useContext(AuthContext);
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [documents, setDocuments] = useState([]);
    const [docsLoading, setDocsLoading] = useState(true);
    const [docsError, setDocsError] = useState(null);

    // Fetch documents from API filtered by logged-in user
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setDocsLoading(true);
                setDocsError(null);
                const params = { user: user?.id }; // Filter by logged-in user
                const res = await getDocumentos(params);
                
                // Handle paginated or direct array response
                const docsList = Array.isArray(res?.data?.results) ? res.data.results : Array.isArray(res?.data) ? res.data : [];
                
                // Debug: log actual types from API
                if (docsList.length > 0) {
                    console.log('Sample document types from API:', docsList.map(d => d.type));
                }
                
                setDocuments(docsList);
            } catch (err) {
                console.error('Error fetching documentos', err);
                toast.error('Error al cargar los documentos');
                setDocsError(err.message);
                setDocuments([]);
            } finally {
                setDocsLoading(false);
            }
        };
        
        if (user?.id) fetchDocuments();
    }, [user?.id]);

    //  Filtrado y Paginación de Datos (Memoizado para rendimiento)
    const filteredAndPaginatedDocuments = useMemo(() => {
        let filteredDocs = [...documents];

        // Filtrar por tipo (case-insensitive y normalizado)
        if (filterType) {
            filteredDocs = filteredDocs.filter(doc => {
                const docTypeNormalized = String(doc.type || '').toLowerCase().trim();
                const filterTypeNormalized = filterType.toLowerCase().trim();
                return docTypeNormalized === filterTypeNormalized;
            });
        }

        // Ordenar por fecha (más reciente primero)
        filteredDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calcular paginación
        const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return {
            documents: filteredDocs.slice(startIndex, endIndex),
            totalPages,
            totalItems: filteredDocs.length,
        };
    }, [filterType, currentPage, documents]); // Se recalcula si cambian el filtro o la página

    // Manejadores de Paginación
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= filteredAndPaginatedDocuments.totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Visualizar PDF en nueva pestaña
    const handleViewPDF = async (fileUrl, docId) => {
        if (!fileUrl) {
            toast.error('No hay archivo para visualizar.');
            return;
        }
        try {
            window.open(fileUrl, '_blank');
        } catch (err) {
            console.error('Error viewing PDF', err);
            toast.error('Error al abrir el PDF');
        }
    };

    // Descargar PDF usando fetch con Authorization
    const handleDownloadPDF = async (fileUrl, docId) => {
        if (!fileUrl) {
            toast.error('No hay archivo para descargar.');
            return;
        }

        const toastId = toast.loading('Descargando...');
        try {
            const token = (() => {
                try { return localStorage.getItem('accessToken') } catch (e) { return null }
            })();

            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(fileUrl, { headers });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

            const blob = await res.blob();

            // Try to extract filename from content-disposition
            let filename = null;
            const cd = res.headers.get('content-disposition');
            if (cd) {
                const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/.exec(cd);
                if (match) filename = decodeURIComponent(match[1] || match[2]);
            }

            if (!filename) {
                try {
                    const urlObj = new URL(fileUrl);
                    filename = urlObj.pathname.split('/').pop() || `documento_${Date.now()}.pdf`;
                } catch (e) {
                    filename = `documento_${Date.now()}.pdf`;
                }
            }

            const link = document.createElement('a');
            const blobUrl = window.URL.createObjectURL(blob);
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);

            toast.success('PDF descargado', { id: toastId });
        } catch (err) {
            console.error('Error descargando PDF', err);
            toast.error('Error al descargar el PDF', { id: toastId });
        }
    };

    // 4. Componente de Fila para la lista (Móvil)
    const DocumentListItem = ({ doc }) => (
        // Estilo de tarjeta simple, similar a la lista de la imagen, pero adaptada a documentos
        <div className="bg-white rounded-xl shadow-md border-b border-gray-200">
            {/* Cabecera de la Tarjeta (similar al Nombre en la imagen) */}
            <div className="flex justify-between items-center p-4">
                <div className="flex flex-col">
                    <span className="text-base font-semibold text-gray-800">
                        {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {doc.date}
                    </span>
                </div>
                {/* Botón de acordeón (usado solo para simular la estética de la imagen) */}
                <ChevronLeft className="w-5 h-5 text-orange-500 rotate-90" />
            </div>

            {/* Acciones en móvil: Usamos el mismo diseño de botones solicitados */}
                            <div className="bg-gray-50 p-4 flex justify-end space-x-2 border-t border-gray-100">
                                <button
                                    onClick={() => handleViewPDF(doc.file, doc.id)}
                                    className="p-2 rounded-full text-gray-500 hover:text-orange-600 hover:bg-orange-100 transition-colors"
                                    title="Visualizar PDF"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDownloadPDF(doc.file, doc.id)}
                                    className="p-2 rounded-full text-orange-600 hover:text-orange-800 hover:bg-orange-100 transition-colors"
                                    title="Descargar PDF"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
        </div>
    );

    const { totalPages, totalItems } = filteredAndPaginatedDocuments;
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar userRole={user?.role} />
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto p-4 md:p-8">

                {/* Controles de Filtro (Botones Naranjas, uno al lado del otro) */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row items-start md:items-center justify-between">

                    <div className="flex items-center space-x-2 mb-3 md:mb-0">
                        <Filter className="w-5 h-5 text-orange-500" />
                        <span className="text-base font-medium text-gray-700">
                            Filtrar por Tipo:
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {documentTypes.map(type => (
                            <button
                                key={type.value}
                                onClick={() => {
                                    setFilterType(type.value);
                                    setCurrentPage(1); // Resetear a la primera página
                                }}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 ${filterType === type.value || (filterType === '' && type.value === '')
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Visualización de Documentos */}

                {docsLoading ? (
                    <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                        <Zap className="w-10 h-10 mx-auto text-gray-400 mb-3 animate-pulse" />
                        <p className="text-lg text-gray-600">Cargando documentos...</p>
                    </div>
                ) : docsError ? (
                    <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                        <Zap className="w-10 h-10 mx-auto text-red-400 mb-3" />
                        <p className="text-lg text-red-600">Error al cargar los documentos.</p>
                    </div>
                ) : totalItems === 0 ? (
                    <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                        <Zap className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        <p className="text-lg text-gray-600">No se encontraron documentos que coincidan con el filtro.</p>
                        <button
                            onClick={() => setFilterType('')}
                            className="mt-4 text-orange-600 hover:text-orange-800 font-medium text-sm"
                        >
                            Ver Todos los Documentos
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Vista de Escritorio (Tabla simplificada) */}
                        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* Columnas solicitadas: Fecha, Tipo y Acciones */}
                                        {['Fecha', 'Tipo', 'Acciones'].map((header) => (
                                            <th
                                                key={header}
                                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header === 'Acciones' ? 'text-right' : ''}`}
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAndPaginatedDocuments.documents.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-orange-50 transition-colors">
                                            {/* Datos de la fila */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.type === 'liquidacion de impuesto' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
                                                </span>
                                            </td>
                                            {/* Columna de Acciones (Visualizar y Descargar) */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleViewPDF(doc.file, doc.id)}
                                                    className="inline-flex items-center space-x-1 text-gray-500 hover:text-orange-600 transition-colors p-2 rounded-full hover:bg-gray-200"
                                                    title="Visualizar PDF"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPDF(doc.file, doc.id)}
                                                    className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-800 transition-colors p-2 rounded-full hover:bg-orange-100"
                                                    title="Descargar PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Vista Móvil (Lista de Tarjetas con estilo de la imagen) */}
                        <div className="md:hidden space-y-2">
                            {filteredAndPaginatedDocuments.documents.map((doc) => (
                                <DocumentListItem key={doc.id} doc={doc} />
                            ))}
                        </div>
                    </>
                )}


                {/* Paginación (Estilo de la imagen con flechas naranja) */}
                {totalItems > itemsPerPage && (
                    <div className="flex justify-center items-center mt-6">

                        <div className="flex space-x-3">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-3 rounded-full transition-colors ${currentPage === 1
                                    ? 'text-gray-400 bg-gray-200'
                                    : 'text-orange-600 bg-orange-100 hover:bg-orange-200'
                                    }`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Opcional: indicador de página. Lo mantengo simple/oculto como en el diseño de la imagen */}
                            {/* <span className="text-sm text-gray-600 hidden sm:inline">Página {currentPage} de {totalPages}</span> */}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-3 rounded-full transition-colors ${currentPage === totalPages
                                    ? 'text-gray-400 bg-gray-200'
                                    : 'text-orange-600 bg-orange-100 hover:bg-orange-200'
                                    }`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
