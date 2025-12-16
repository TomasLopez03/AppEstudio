import { useContext, useState, useEffect } from 'react';
import { FileText, Download, Eye, DollarSign, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../../auth/AuthContext';
import { getHonorarios, createPayment, partialUpdateHonorario } from '../../api/honorarios';
import { Navbar } from '../../components/Navbar';
import { PaymentForm } from '../Payments/PaymentForm';
import toast from 'react-hot-toast';



// We'll load honorarios from the API. No local initial data.

// Componente de Etiqueta de Estado
const EstadoBadge = ({ estado }) => {
    let classes = '';
    let icon = null;

    switch (estado) {
        case 'Pagado':
            classes = 'bg-green-100 text-green-700 border-green-400';
            icon = <CheckCircle className="w-4 h-4 mr-1" />;
            break;
        case 'Pendiente':
            classes = 'bg-blue-100 text-blue-700 border-blue-400';
            icon = <Clock className="w-4 h-4 mr-1" />;
            break;
        case 'Vencido':
            classes = 'bg-red-100 text-red-700 border-red-400';
            icon = <XCircle className="w-4 h-4 mr-1" />;
            break;
        default:
            classes = 'bg-gray-100 text-gray-700 border-gray-400';
            icon = <Clock className="w-4 h-4 mr-1" />;
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${classes}`}>
            {icon}
            {estado}
        </span>
    );
};

export const HonorariosList = () => {
    const { user } = useContext(AuthContext);
    const [honorarios, setHonorarios] = useState([]);
    const [filter, setFilter] = useState('Todos'); // 'Todos', 'Pagado', 'Pendiente', 'Vencido'
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const [totalCount, setTotalCount] = useState(null);
    const [nextUrl, setNextUrl] = useState(null);
    const [prevUrl, setPrevUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // For admin/employee: search client by id (simple search input)
    const [clientQuery, setClientQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    // We rely on server-side filtering/pagination, so honorarios is already filtered.
    const filteredHonorarios = honorarios;

    // Payment modal state
    const [paymentHonorarioId, setPaymentHonorarioId] = useState(null);
    const [paymentMontoPendiente, setPaymentMontoPendiente] = useState(0);

    const statusMap = {
        'Pendiente': 'pendiente',
        'Pagado': 'pagado',
        'Vencido': 'vencido'
    };

    const statusDisplay = (s) => {
        if (!s) return s;
        const map = { 'pendiente': 'Pendiente', 'pagado': 'Pagado', 'vencido': 'Vencido' };
        return map[s] || s;
    };

    // Fetch honorarios (extracted so it can be reused after payments)
    const fetchHonorarios = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: page,
                page_size: pageSize,
            };

            if (filter && filter !== 'Todos') {
                params.status = statusMap[filter] || filter.toLowerCase();
            }

            // If user is client, always filter by their id
            if (user?.role === 'client') {
                if (user?.id) params.user = user.id;
            } else {
                // If admin/employee and a client is selected, filter by razon_social
                if (selectedClient) params['user__razon_social'] = selectedClient;
            }

            const res = await getHonorarios(params);

            // Expecting paginated response like { results: [...], count, next, previous }
            if (res?.data?.results && Array.isArray(res.data.results)) {
                const items = res.data.results.map(item => ({
                    id: item.id,
                    fecha: item.date ,
                    monto: item.amount,
                    estado: statusDisplay(item.status),
                    pdfUrl: item.honorario ,
                    razon: item.razon_social,
                    userId: item.user,
                    pagado: item.paid_amount,
                    titulo: item.title
                }));
                setHonorarios(items);
                setTotalCount(res.data.count ?? null);
                setNextUrl(res.data.next ?? null);
                setPrevUrl(res.data.previous ?? null);
            } else {
                // Fallback: single object
                setHonorarios([]);
                setTotalCount(0);
                setNextUrl(null);
                setPrevUrl(null);
            }
        } catch (err) {
            console.error('Error fetching honorarios', err);
            setError('No se pudieron cargar los honorarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHonorarios();
    }, [filter, page, selectedClient, user]);

    // Simula la apertura del PDF en una nueva pestaña (en un entorno real usaría la URL)
    const handleVerPDF = (url) => {

        window.open(url, '_blank'); // Abre una URL de ejemplo
    };

    // Simula la descarga del PDF
    const handleDescargarPDF = (url) => {
        if (!url) {
            alert('No hay archivo para descargar.');
            return;
        }

        (async () => {
            try {
                const token = (() => {
                    try { return localStorage.getItem('accessToken') } catch (e) { return null }
                })();

                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(url, { headers });
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
                    try {
                        const urlObj = new URL(url);
                        filename = urlObj.pathname.split('/').pop() || `honorario_${Date.now()}.pdf`;
                    } catch (e) {
                        filename = `honorario_${Date.now()}.pdf`;
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
            } catch (err) {
                console.error('Error descargando PDF', err);
                alert('Error al descargar el PDF');
            }
        })();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar userRole={user?.role} />
            {/* <Toaster position="top-right" /> */}

            {/* 2. Contenido Principal */}
            <main className="flex-grow p-4 md:p-8 lg:p-10">

                {/* Contenedor principal de la tarjeta/operación */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">

                    {/* A. Filtros (Toggle) */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-wrap gap-2 justify-start items-center">
                            {['Todos', 'Pendiente', 'Pagado', 'Vencido'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setFilter(f); setPage(1); }}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 
                                        ${f === filter
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Client search for admin/employee */}
                        {(user?.role === 'admin' || user?.role === 'employee') && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Buscar cliente por razón social"
                                    value={clientQuery}
                                    onChange={(e) => setClientQuery(e.target.value)}
                                    className="px-3 py-2 border rounded-lg text-sm w-full sm:w-64"
                                />
                                <div className="flex flex-col sm:flex-row sm:space-x-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => { setSelectedClient(clientQuery); setPage(1); }}
                                        className="w-full sm:w-auto px-4 py-2 bg-orange-500 font-medium text-white rounded-lg text-sm"
                                    >Buscar</button>
                                    <button
                                        onClick={() => { setClientQuery(''); setSelectedClient(null); setPage(1); }}
                                        className="w-full sm:w-auto px-3 py-2 bg-gray-100 font-medium rounded-lg text-sm"
                                    >Limpiar</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* B. Contenedor de la Lista de Honorarios (Vista de Tarjetas) */}
                    <div className="space-y-4">
                        {loading && (
                            <div className="text-center p-6 text-gray-500">Cargando honorarios...</div>
                        )}

                        {error && (
                            <div className="text-center p-6 text-red-500">{error}</div>
                        )}

                        {!loading && !error && filteredHonorarios.length === 0 && (
                            <div className="text-center p-10 text-gray-500 border border-dashed rounded-xl">
                                <FileText className="w-8 h-8 mx-auto mb-3" />
                                No hay honorarios registrados.
                            </div>
                        )}

                        {!loading && !error && filteredHonorarios.map(honorario => (
                            <div
                                key={honorario.id}
                                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row justify-between items-start md:items-center"
                            >
                                {/* Columna de Monto y Servicio (Izquierda) */}
                                <div className="flex-grow mb-4 md:mb-0">
                                    <div className="text-md text-gray-700 font-semibold mb-2">
                                        {honorario.titulo}
                                    </div>
                                    <div className="flex items-center text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                                        ${honorario.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })} / 
                                        {honorario.pagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-md text-gray-900 font-medium">
                                        {honorario.razon}
                                    </div>
                                </div>

                                {/* Columna de Fecha y Estado (Centro/Derecha) */}
                                <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-6 items-start md:items-center">

                                    {/* Fecha */}
                                    <div className="flex items-center text-sm font-medium text-gray-500">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {honorario.fecha}
                                    </div>

                                    {/* Estado */}
                                    <EstadoBadge estado={honorario.estado} />

                                    {/* Botones de Acción (PDF + Pagar) */}
                                    <div className="flex space-x-2 mt-2 md:mt-0">
                                        <button
                                            onClick={() => handleVerPDF(honorario.pdfUrl)}
                                            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition duration-150 shadow-sm border border-blue-200"
                                            title="Ver Detalle PDF"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDescargarPDF(honorario.pdfUrl)}
                                            className="p-2 rounded-full text-orange-600 hover:bg-orange-100 transition duration-150 shadow-sm border border-orange-200"
                                            title="Descargar PDF"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Open payment modal; monto pendiente = monto - pagado
                                                const pendiente = Math.max(0, honorario.monto - (honorario.pagado || 0));
                                                setPaymentHonorarioId(honorario.id);
                                                setPaymentMontoPendiente(pendiente);
                                            }}
                                            className="p-2 rounded-full text-white bg-green-600 hover:bg-green-700 transition duration-150 shadow-sm border border-green-700"
                                            title="Pagar"
                                        >
                                            Pagar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Payment modal */}
                        <PaymentForm
                            honorarioId={paymentHonorarioId}
                            montoPendiente={paymentMontoPendiente}
                            userId={honorarios.find(h => h.id === paymentHonorarioId)?.userId}
                            onClose={() => { setPaymentHonorarioId(null); setPaymentMontoPendiente(0); }}
                            onPaymentSubmit={async (payment) => {
                                // payment: { honorarioId, montoPagado, metodo, comprobante, fecha }
                                if (!payment || !payment.honorarioId) return;
                                const { honorarioId, montoPagado, metodo, comprobante } = payment;
                                const toastId = toast.loading('Procesando pago...');
                                try {
                                    // Create payment record (simulate transfer if needed)
                                    // include the user id related to the honorario in the payment payload
                                    const existingHonorario = honorarios.find(h => h.id === honorarioId);
                                    const paymentPayload = {
                                        honorario: honorarioId,
                                        user: existingHonorario?.userId ?? null,
                                        payment_method: metodo,
                                        payment_amount: montoPagado,
                                        proof: comprobante || null,
                                    };
                                    await createPayment(paymentPayload);
                                    toast.success('Pago registrado', { id: toastId });
                                    // close modal
                                    setPaymentHonorarioId(null);
                                    setPaymentMontoPendiente(0);
                                    // Refresh list from server so UI reflects new payment/status
                                    setPage(1);
                                } catch (err) {
                                    console.error('Error procesando pago', err);
                                    toast.error('Error procesando pago', { id: toastId });
                                }
                            }}
                        />

                        {/* Pagination controls */}
                        {!loading && !error && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-600">{totalCount !== null ? `Total: ${totalCount}` : ''}</div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1 || !prevUrl && page === 1}
                                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                    >Anterior</button>
                                    <div className="px-3 py-1">
                                        Página {page}{totalCount ? ` / ${Math.max(1, Math.ceil(totalCount / pageSize))}` : ''}
                                    </div>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={!nextUrl && totalCount !== null && page >= Math.ceil(totalCount / pageSize)}
                                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                    >Siguiente</button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    )
}
