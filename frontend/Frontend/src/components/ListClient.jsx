import React, { useState } from 'react';
// Iconos de Lucide-React para una mejor UI/UX
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, X, Menu, Search, Loader2 } from 'lucide-react';
import { Navbar } from './Navbar.jsx';

// Datos de ejemplo
const initialClients = [
    { id: 1, razonSocial: 'Tech Solutions S.A.', cuit: '30-71234567-8', celular: '1155551234', email: 'contacto@techsol.com', deuda: 1500.50, importe: 2000.00, pago: 'Atrasado', medioPago: 'Transferencia' },
    { id: 2, razonSocial: 'Distribuidora Global SRL', cuit: '20-34567890-1', celular: '2234449876', email: 'info@global.com', deuda: 0.00, importe: 500.00, pago: 'Pagado', medioPago: 'Efectivo' },
    { id: 3, razonSocial: 'Marketing Digital Pro', cuit: '33-89012345-0', celular: '3416667777', email: 'ventas@mktdigital.net', deuda: 750.25, importe: 1000.00, pago: 'Pendiente', medioPago: 'Tarjeta' },
];

export const ListClient = () => {
    const [clients, setClients] = useState(initialClients);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Simulación de sidebar para la navegación
    const [isEditing, setIsEditing] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [expandedClient, setExpandedClient] = useState(null); // Para el modo mobile
    const [loading, setLoading] = useState(false);
    const [newClient, setNewClient] = useState({
        razonSocial: '', cuit: '', celular: '', email: '', deuda: 0, importe: 0, pago: 'Pendiente', medioPago: 'Transferencia'
    });

    // Alternar la expansión de un cliente en vista móvil
    const toggleExpand = (id) => {
        setExpandedClient(expandedClient === id ? null : id);
    };

    // Abre el modal para crear
    const handleCreate = () => {
        setIsEditing(false);
        setEditingClient(null);
        setNewClient({
            razonSocial: '', cuit: '', celular: '', email: '', deuda: 0, importe: 0, pago: 'Pendiente', medioPago: 'Transferencia'
        });
        setIsModalOpen(true);
    };

    // Abre el modal para editar
    const handleEdit = (client) => {
        setIsEditing(true);
        setEditingClient(client);
        setNewClient(client);
        setIsModalOpen(true);
    };

    // Guarda la creación o edición
    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulación de guardado
        setTimeout(() => {
            if (isEditing) {
                // Actualizar cliente
                setClients(clients.map(c => c.id === newClient.id ? newClient : c));
            } else {
                // Crear nuevo cliente (asignar ID simple para la simulación)
                const id = Math.max(...clients.map(c => c.id)) + 1;
                setClients([...clients, { ...newClient, id }]);
            }
            setLoading(false);
            setIsModalOpen(false);
        }, 500);
    };

    // Eliminar cliente
    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
            setClients(clients.filter(client => client.id !== id));
        }
    };

    // Etiqueta de estado de pago
    const PagoBadge = ({ pago }) => {
        let colorClass = '';
        if (pago === 'Pagado') colorClass = 'bg-green-100 text-green-800';
        else if (pago === 'Atrasado') colorClass = 'bg-red-100 text-red-800';
        else colorClass = 'bg-yellow-100 text-yellow-800';

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {pago}
            </span>
        );
    };



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* 1. Header Fijo (Visible en Mobile y Desktop) */}
            {/* <header className="sticky top-0 z-10 bg-white shadow-md p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-gray-600 hover:text-gray-900 lg:hidden mr-3 p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800">Clientes</h1>
                </div>
                <button
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition"
                >
                    <Search className="w-6 h-6" />
                </button>
            </header> */}
            <Navbar userRole={'admin'} />

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
            <main className="flex-grow p-4 md:p-8">

                {/* Botón de CREAR NUEVO (Estilo de la imagen) */}
                <div className="mb-6">
                    <button
                        onClick={handleCreate}
                        className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>CREAR NUEVO</span>
                    </button>
                </div>

                {/* ------------------------------------- */}
                {/* DESKTOP VIEW (Tabla tradicional) */}
                {/* ------------------------------------- */}
                <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Razón Social', 'CUIT', 'Celular', 'Email', 'Deuda', 'Pago', 'Acción'].map(header => (
                                    <th
                                        key={header}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.razonSocial}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cuit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.celular}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 truncate max-w-xs">{client.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                                        ${client.deuda.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <PagoBadge pago={client.pago} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ------------------------------------- */}
                {/* MOBILE VIEW (Lista expansible - inspirado en la imagen) */}
                {/* ------------------------------------- */}
                <div className="lg:hidden space-y-3">
                    {clients.map((client) => (
                        <div key={client.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                            {/* Encabezado visible siempre (Nombre/Razón Social y Toggle) */}
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer transition duration-150 hover:bg-gray-50"
                                onClick={() => toggleExpand(client.id)}
                            >
                                <div className="text-base font-semibold text-gray-800 truncate">
                                    {/* El título principal que se ve en mobile (como 'Nombre' en tu imagen) */}
                                    {client.razonSocial}
                                </div>
                                {expandedClient === client.id ? (
                                    <ChevronUp className="w-5 h-5 text-orange-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>

                            {/* Contenido expansible */}
                            {expandedClient === client.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        {/* Filas de la imagen, alineadas */}
                                        <span className="font-medium text-gray-600">CUIT</span>
                                        <span className="text-gray-800">{client.cuit}</span>

                                        <span className="font-medium text-gray-600">Celular</span>
                                        <span className="text-gray-800">{client.celular}</span>

                                        <span className="font-medium text-gray-600">Email</span>
                                        <span className="text-gray-800 truncate">{client.email}</span>

                                        <span className="font-medium text-gray-600">Deuda</span>
                                        <span className="text-red-500 font-semibold">${client.deuda.toFixed(2)}</span>

                                        <span className="font-medium text-gray-600">Importe Total</span>
                                        <span className="text-gray-800">${client.importe.toFixed(2)}</span>

                                        <span className="font-medium text-gray-600">Pago</span>
                                        <span><PagoBadge pago={client.pago} /></span>

                                        <span className="font-medium text-gray-600">Medio de pago</span>
                                        <span className="text-gray-800">{client.medioPago}</span>

                                        {/* Acciones - Parte inferior de la lista */}
                                        <div className="col-span-2 pt-3 flex justify-end space-x-3 border-t mt-2 border-gray-200">
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="p-2 text-red-600 hover:text-red-800 bg-red-100 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(client)}
                                                className="p-2 text-blue-600 hover:text-blue-800 bg-blue-100 rounded-lg transition-all"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Simulación de Paginación (flechas simples) */}
                <div className="flex justify-center mt-8 space-x-4">
                    <button className="p-3 border rounded-full text-gray-500 hover:bg-gray-200 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="p-3 border rounded-full text-orange-500 hover:bg-orange-100 transition">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

            </main>

            {/* 3. Modal para Crear/Editar Cliente (UX mejorada) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl transform transition-all overflow-y-auto max-h-[90vh]">
                        {/* Encabezado del Modal */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Formulario del Modal */}
                        <form onSubmit={handleSave} className="space-y-4">

                            <InputField label="Razón Social" name="razonSocial" value={newClient.razonSocial} setNewClient={setNewClient} disabled={loading} type="text" />
                            <InputField label="CUIT" name="cuit" value={newClient.cuit} setNewClient={setNewClient} disabled={loading} type="text" />
                            <InputField label="Celular" name="celular" value={newClient.celular} setNewClient={setNewClient} disabled={loading} type="tel" />
                            <InputField label="Email" name="email" value={newClient.email} setNewClient={setNewClient} disabled={loading} type="email" />

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Importe Total" name="importe" value={newClient.importe} setNewClient={setNewClient} disabled={loading} type="number" step="0.01" />
                                <InputField label="Deuda Actual" name="deuda" value={newClient.deuda} setNewClient={setNewClient} disabled={loading} type="number" step="0.01" />
                            </div>

                            <SelectField label="Estado de Pago" name="pago" value={newClient.pago} setNewClient={setNewClient} disabled={loading} options={['Pagado', 'Pendiente', 'Atrasado']} />
                            <SelectField label="Medio de Pago" name="medioPago" value={newClient.medioPago} setNewClient={setNewClient} disabled={loading} options={['Transferencia', 'Efectivo', 'Tarjeta', 'Cheque']} />

                            {/* Botón de Guardar */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 mt-6 rounded-xl text-white font-bold tracking-wider transition duration-300 ease-in-out flex items-center justify-center space-x-2
                  ${loading
                                        ? 'bg-green-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        Guardando...
                                    </>
                                ) : (
                                    isEditing ? 'Guardar Cambios' : 'Crear Cliente'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// Componente auxiliar para campos de input
const InputField = ({ label, name, value, setNewClient, disabled, type = 'text', step }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      step={step}
      id={name}
      name={name}
      value={value}
      onChange={(e) => setNewClient(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
      className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
      disabled={disabled}
      required
    />
  </div>
);
// Componente auxiliar para campos de selección
const SelectField = ({ label, name, value, setNewClient, disabled, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={(e) => setNewClient(prev => ({ ...prev, [name]: e.target.value }))}
      className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition appearance-none bg-white"
      disabled={disabled}
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

// Iconos de paginación que faltan importar en el original
const ChevronLeft = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRight = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);


