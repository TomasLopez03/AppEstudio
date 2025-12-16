import { useState, useEffect, useContext } from 'react'
import {
    DollarSign, Filter, Calendar, Search, X,
    ChevronLeft, ChevronRight, CheckCircle,
    AlertTriangle, Banknote, Eye, Download
} from 'lucide-react';
import { AuthContext } from '../../auth/AuthContext.jsx';
import Navbar from '../../components/Navbar';
import { getPayments } from '../../api/honorarios.js';

const ITEMS_PER_PAGE = 8; // Constante para la paginación

export const PaymentList = () => {
    const { user } = useContext(AuthContext);
    // 1. Estados de Filtros y Paginación
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [razonSocial, setRazonSocial] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Fetch payments al montar el componente y cuando cambien los filtros
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                setError(null);

                // Construir parámetros
                const params = {
                    page: currentPage,
                    page_size: ITEMS_PER_PAGE,
                };

                // Si el usuario es client, filtrar por su propio ID
                if (user?.role === 'client' && user?.id) {
                    params.user = user.id;
                }

                // Agregar filtros opcionales
                if (razonSocial) {
                    params.user__razon_social = razonSocial;
                }
                if (paymentDate) {
                    params.payment_date = paymentDate;
                }
                if (paymentMethod) {
                    params.payment_method = paymentMethod;
                }

                const response = await getPayments(params);
                
                if (response.data.results) {
                    // Si la API retorna resultados paginados
                    setPayments(response.data.results);
                    setTotalItems(response.data.count || 0);
                } else if (Array.isArray(response.data)) {
                    // Si la API retorna un array directamente
                    setPayments(response.data);
                    setTotalItems(response.data.length);
                }
            } catch (err) {
                console.error('Error fetching payments:', err);
                setError('Error al cargar los pagos. Intente de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [user, razonSocial, paymentDate, paymentMethod, currentPage]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Manejador de cambio de página
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Función para limpiar todos los filtros
    const clearFilters = () => {
        setRazonSocial('');
        setPaymentDate('');
        setPaymentMethod('');
        setCurrentPage(1);
    };

    // Función para visualizar el PDF
    const handleViewPdf = (pdfUrl) => {
        window.open(pdfUrl, '_blank');
    };

    // Función para descargar el PDF (solo si el método es transferencia)
    const handleDownloadPdf = (pdfUrl, paymentId) => {
        (async () => {
            try {
                const token = (() => {
                    try { return localStorage.getItem('accessToken') } catch (e) { return null }
                })();

                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(pdfUrl, { headers });
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

                const blob = await res.blob();

                // Try to extract filename from content-disposition
                let filename = null;
                const cd = res.headers.get('content-disposition');
                if (cd) {
                    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/.exec(cd);
                    if (match) filename = decodeURIComponent(match[1] || match[2]);
                }

                if (!filename) {
                    filename = `comprobante-pago-${paymentId}.pdf`;
                }

                const link = document.createElement('a');
                const blobUrl = window.URL.createObjectURL(blob);
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(blobUrl);
            } catch (err) {
                console.error('Error descargando PDF', err);
                alert('Error al descargar el PDF');
            }
        })();
    };

    const PaymentCard = ({ payment }) => (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
                <span className="text-lg font-semibold text-gray-800">{payment.razon_social}</span>
                <span className="text-xl font-bold text-green-600">${payment.payment_amount}</span>
            </div>
            <div className="text-sm text-gray-600 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Fecha: {payment.payment_date}</span>
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Banknote className="w-4 h-4 text-orange-500" />
                    <span>Método: {payment.payment_method}</span>
                </div>
            </div>
            {/* Botones de PDF */}
            <div className="flex gap-2 pt-2 border-t">
                {payment.ticket_pdf && (
                    <>
                        <button
                            onClick={() => handleViewPdf(payment.ticket_pdf)}
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Eye className="w-4 h-4" />
                            Ver PDF
                        </button>
                        {payment.payment_method === 'transferencia' && (
                            <button
                                onClick={() => handleDownloadPdf(payment.ticket_pdf, payment.id)}
                                className="flex-1 px-3 py-2 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Descargar
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Navbar userRole={user?.role} />
            <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
                <div className="max-w-6xl mx-auto">
                    {/* Área de Filtros */}
                    <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl mb-8 border border-green-200">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-orange-600" />
                            <span>Opciones de Filtrado</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {/* Filtro de Razón Social */}
                            <div className="flex flex-col">
                                <label htmlFor="razonSocial" className="text-sm font-medium text-gray-700 mb-1">Razón Social (Cliente)</label>
                                <input
                                    id="razonSocial"
                                    type="text"
                                    placeholder="Buscar por razón social..."
                                    value={razonSocial}
                                    onChange={(e) => {
                                        setRazonSocial(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>

                            {/* Filtro de Fecha */}
                            <div className="flex flex-col">
                                <label htmlFor="paymentDate" className="text-sm font-medium text-gray-700 mb-1">Fecha de Pago</label>
                                <input
                                    id="paymentDate"
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => {
                                        setPaymentDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>

                            {/* Filtro de Método de Pago */}
                            <div className="flex flex-col">
                                <label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                <select
                                    id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => {
                                        setPaymentMethod(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                >
                                    <option value="">Todos los métodos</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                            </div>
                        </div>

                        {/* Botón para limpiar filtros */}
                        {(razonSocial || paymentDate || paymentMethod) && (
                            <div className="pt-2">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors flex items-center space-x-2 text-sm"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Limpiar Filtros</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Resultados */}
                    {loading ? (
                        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-3"></div>
                            <p className="text-lg text-gray-600">Cargando pagos...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                            <AlertTriangle className="w-10 h-10 mx-auto text-red-500 mb-3" />
                            <p className="text-lg text-red-600">{error}</p>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                            <AlertTriangle className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                            <p className="text-lg text-gray-600">No se encontraron pagos que coincidan con los filtros.</p>
                        </div>
                    ) : (
                        <>
                            {/* Vista de Escritorio (Tabla) */}
                            <div className="hidden md:block bg-white rounded-2xl shadow-xl overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['ID', 'Cliente', 'Monto', 'Fecha', 'Método', 'Acciones'].map((header) => (
                                                <th
                                                    key={header}
                                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-green-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.razon_social}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-green-600">${payment.payment_amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.payment_date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <span className="flex items-center space-x-1">
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                        <span>{payment.payment_method}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex">
                                                    {payment.ticket_pdf && (
                                                        <>
                                                            <button
                                                                onClick={() => handleViewPdf(payment.ticket_pdf)}
                                                                className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                Ver
                                                            </button>
                                                            {payment.payment_method === 'transferencia' && (
                                                                <button
                                                                    onClick={() => handleDownloadPdf(payment.ticket_pdf, payment.id)}
                                                                    className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded hover:bg-green-200 transition-colors flex items-center gap-1"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    Descargar
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Vista Móvil (Lista de Tarjetas) */}
                            <div className="md:hidden space-y-4">
                                {payments.map((payment) => (
                                    <PaymentCard key={payment.id} payment={payment} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Componente de Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 space-x-3">
                            {/* Botón Anterior */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-3 rounded-full transition-colors ${currentPage === 1
                                    ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                    : 'text-orange-600 bg-orange-100 hover:bg-orange-200'
                                    }`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Indicador de Página */}
                            <span className="text-sm font-semibold text-gray-700">
                                Página {currentPage} de {totalPages}
                            </span>

                            {/* Botón Siguiente */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-3 rounded-full transition-colors ${currentPage === totalPages
                                    ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                    : 'text-orange-600 bg-green-100 hover:bg-green-200'
                                    }`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}
