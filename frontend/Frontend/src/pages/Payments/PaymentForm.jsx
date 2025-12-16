import { useState, useCallback } from "react"
import { X, DollarSign, Send, CheckSquare, Camera, AlertTriangle, FileUp } from 'lucide-react';
import { createPayment } from '../../api/honorarios.js';

// Métodos de pago disponibles
const PAYMENT_METHODS = [
    { value: 'transferencia', label: 'Transferencia Bancaria', icon: Send },
    { value: 'efectivo', label: 'Efectivo', icon: DollarSign },
    { value: 'cheque', label: 'Cheque', icon: CheckSquare },
];


export const PaymentForm = ({ honorarioId, montoPendiente, userId, onClose, onPaymentSubmit }) => {

    // Estado del formulario de pago
    const [paymentData, setPaymentData] = useState({
        monto: montoPendiente || 0,
        metodo: 'transferencia',
        comprobanteFile: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Actualiza los datos del formulario (excepto archivos)
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({ ...prev, [name]: value }));
        // Limpiar el error si empieza a editar
        setError(null);
    }, []);

    // Maneja la selección del archivo de comprobante
    const handleFileChange = useCallback((e) => {
        setPaymentData(prev => ({ ...prev, comprobanteFile: e.target.files[0] }));
    }, []);

    // Reinicia el estado del formulario al cerrar
    const resetForm = () => {
        setPaymentData({ monto: montoPendiente || 0, metodo: 'transferencia', comprobanteFile: null });
        setIsSubmitting(false);
        setError(null);
    };

    // Maneja el envío del formulario de pago
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null);

        // 1. Validaciones
        const { monto, metodo, comprobanteFile,} = paymentData;

        if (monto <= 0 || monto > montoPendiente) {
            setError(`El monto debe ser mayor a cero y no exceder el pendiente (${montoPendiente}).`);
            return;
        }

        if (metodo === 'transferencia' && !comprobanteFile) {
            setError('Debe adjuntar el comprobante para pagos por Transferencia Bancaria.');
            return;
        }

        // 2. Envío del Pago a la API
        setIsSubmitting(true);

        try {
            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('honorario', honorarioId);
            formData.append('user', userId);
            formData.append('payment_amount', monto);
            formData.append('payment_method', metodo);
            
            // Agregar el archivo si es transferencia
            if (metodo === 'transferencia' && comprobanteFile) {
                formData.append('ticket_pdf', comprobanteFile);
            }

            // Llamar a la API para crear el pago
            const response = await createPayment(formData);

            // Llamar a la función callback del componente padre con la respuesta
            onPaymentSubmit({
                ...response.data,
                montoPagado: monto,
                metodo,
                comprobante: comprobanteFile ? comprobanteFile.name : 'N/A',
                fecha: new Date().toISOString(),
            });

            // Cerrar y resetear
            resetForm();
            onClose();

        } catch (err) {
            console.error('Error al procesar el pago:', err);
            setError(err.response?.data?.detail || 'Error al procesar el pago. Intente de nuevo.');
            setIsSubmitting(false);
        }
    };
    // Si honorarioId es null, el modal no se muestra
    if (!honorarioId) {
        return null;
    }
    return (
        <div
            className="fixed inset-0 backdrop-blur-xs  z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={(e) => {
                // Solo cierra si el click es en el fondo, no en el modal
                if (e.target === e.currentTarget) {
                    onClose();
                    resetForm();
                }
            }}
        >
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform scale-100 transition-transform duration-300">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                        <DollarSign className="w-6 h-6 text-orange-600" />
                        <span>Registrar Pago</span>
                    </h2>
                    <button 
                        onClick={() => { onClose(); resetForm(); }}
                        className="p-2 rounded-full text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body / Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Monto Pendiente */}
                    <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 space-y-1">
                        <p className="font-semibold">
                            Monto Pendiente: <span className="text-green-700">${montoPendiente?.toFixed(2) || '0.00'}</span>
                        </p>
                    </div>

                    {/* Alerta de Error */}
                    {error && (
                        <div className="flex items-center p-3 text-sm text-red-800 bg-red-100 rounded-lg" role="alert">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            <div>{error}</div>
                        </div>
                    )}
                    
                    {/* Campo Monto del Pago */}
                    <InputField 
                        id="monto" 
                        label="Monto del Pago" 
                        name="monto"
                        value={paymentData.monto} 
                        onChange={handleChange} 
                        icon={DollarSign}
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        disabled={isSubmitting}
                    />

                    {/* Selección de Método de Pago */}
                    <div>
                        <label htmlFor="metodo" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Send className="w-4 h-4 mr-2 text-orange-500" />
                            Método de Pago
                        </label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            {PAYMENT_METHODS.map(method => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setPaymentData(prev => ({ ...prev, metodo: method.value, comprobanteFile: null }))}
                                    className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200 flex flex-col items-center space-y-1 ${
                                        paymentData.metodo === method.value
                                            ? 'border-orange-600 bg-orange-50 text-orange-800 shadow-md'
                                            : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                    disabled={isSubmitting}
                                >
                                    <method.icon className="w-5 h-5" />
                                    <span>{method.label.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Carga de Comprobante (Condicional) */}
                    {paymentData.metodo === 'transferencia' && (
                        <div className="border p-4 rounded-lg bg-yellow-50 border-yellow-200">
                            <label htmlFor="comprobanteFile" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FileUp className="w-4 h-4 mr-2 text-orange-500" />
                                Comprobante de Transferencia (Obligatorio)
                            </label>
                            <input
                                id="comprobanteFile"
                                name="comprobanteFile"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 mt-2"
                                disabled={isSubmitting}
                            />
                            {paymentData.comprobanteFile && (
                                <p className="text-xs text-gray-500 mt-1">Archivo seleccionado: <span className="font-semibold">{paymentData.comprobanteFile.name}</span></p>
                            )}
                        </div>
                    )}

                    {/* Botón de Enviar */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-gray-400"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <DollarSign className="w-5 h-5" />
                            )}
                            <span>{isSubmitting ? 'Procesando Pago...' : 'Confirmar Pago'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Componente de Campo de Entrada Reutilizable
const InputField = ({ id, label, value, onChange, icon: Icon, type = "text", placeholder = "", ...props }) => (
    <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            {Icon && <Icon className="w-4 h-4 mr-2 text-orange-500" />}
            {label}
        </label>
        <div className="relative">
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none bg-white border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                {...props}
            />
        </div>
    </div>
);