import { useState, useContext, useEffect } from 'react'
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, X, Menu, Search, Loader2 } from 'lucide-react';
import { Navbar } from './Navbar.jsx';
import { AuthContext } from '../auth/AuthContext.jsx';
import { toast, Toaster } from 'react-hot-toast';

import { getEmployees, getEmployeesByUrl, createEmployees, partialUpdateEmployees } from '../api/users.js';
import { InputField } from './ListClient.jsx'

export const ListEmployee = () => {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [expandedEmployee, setExpandedEmployee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [newEmployee, setNewEmployee] = useState({
        username: '', email: '', password: '', first_name: '', last_name: '', role: '', cuit: '',
        celular: '',
    });

    // Alternar la expansión de un empleado en vista móvil
    const toggleExpand = (id) => {
        setExpandedEmployee(expandedEmployee === id ? null : id);
    };

    //Abre modal para crear empleado
    const handleCreate = () => {
        setIsEditing(false);
        setEditingEmployee(null);
        setNewEmployee({
            username: '', email: '', password: '', first_name: '', last_name: '', role: '', cuit: '',
            celular: '',
        });
        setIsModalOpen(true);
    }

    // Abre el modal para editar
    const handleEdit = (employee) => {
        setIsEditing(true);
        setEditingEmployee(employee);
        setNewEmployee(employee);
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);
        (async () => {
            try {
                if (isEditing && editingEmployee && editingEmployee.id) {
                    // Actualizar empleado existente
                    const resp = await partialUpdateEmployees(editingEmployee.id, newEmployee);
                    // Actualizar la lista localmente
                    if (resp?.data?.id) {
                        setEmployees(employees.map(emp => emp.id === resp.data.id ? resp.data : emp));
                        toast.success('Empleado actualizado con éxito');
                    }
                } else {
                    // Crear nuevo empleado
                    const resp = await createEmployees(newEmployee);
                    // refrescar la lista
                    await loadEmployees();
                    toast.success('Empleado creado con éxito');
                }
                setIsModalOpen(false);
            } catch (error) {
                console.error('Error al guardar el empleado:', error);
                toast.error('Error al guardar el empleado');
            } finally {
                setLoading(false);
            }
        })();
    }

    //eliminar empleado
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) return;
        (async () => {
            try {
                await partialUpdateEmployees(id, { is_active: false });
                //refrescar la lista
                await loadEmployees();
                toast.success('Empleado eliminado con éxito');
            } catch (error) {
                console.error('Error al eliminar el empleado:', error);
                toast.error('Error al eliminar el empleado');
            }
        })();
    }

    const loadEmployees = async (url = null) => {
        try {
            setFetching(true);
            let resp
            if (url) resp = await getEmployeesByUrl(url);
            else resp = await getEmployees({ page_size: 5 });
            const payload = resp?.data ?? {};
            const data = payload?.results ?? [];
            setEmployees(data);
            setNextPage(payload?.next || null);
            setPreviousPage(payload?.previous || null);
            setTotalCount(payload?.count ?? data.length);
        } catch (error) {
            console.error('Error al cargar los empleados:', error);
            toast.error('Error al cargar los empleados');
            setEmployees([]);
            setNextPage(null);
            setPreviousPage(null);
            setTotalCount(0);
        } finally {
            setFetching(false);
        }
    }

    useEffect(() => {
        let mounted = true;
        loadEmployees();
        return () => { mounted = false };
    }, []);

    const fecthPage = async (url) => {
        if (!url) return;
        await loadEmployees(url);
    }

    // Mapea el booleano is_active a un texto legible
    const statusLabel = (isActive) => {
        // Normalizar distintos tipos (boolean, 'true'/'false', 1/0)
        if (isActive === true || isActive === 'true') return 'activo';
        return 'inactivo';
    };

    const StatusBadge = ({ isActive }) => {
        const active = (isActive === true || isActive === 'true' || isActive === 1 || isActive === '1');
        const colorClass = active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const label = active ? 'activo' : 'inactivo';
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <Navbar userRole={user?.role} />
            <Toaster position="top-right" />

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
                                {['Nombre', 'Apellido', 'CUIT', 'Celular', 'Email', 'Estado', 'Acción'].map(header => (
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
                            {employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.first_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.last_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.cuit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.celular}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 truncate max-w-xs">{employee.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge isActive={employee.is_active} /></td>


                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition">
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
                    {employees.map((employee) => (
                        <div key={employee.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                            {/* Encabezado visible siempre (Nombre/Razón Social y Toggle) */}
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer transition duration-150 hover:bg-gray-50"
                                onClick={() => toggleExpand(employee.id)}
                            >
                                <div className="text-base font-semibold text-gray-800 truncate">
                                    {/* El título principal que se ve en mobile (como 'Nombre' en tu imagen) */}
                                    {employee.first_name} {employee.last_name}
                                </div>
                                {expandedEmployee === employee.id ? (
                                    <ChevronUp className="w-5 h-5 text-orange-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>

                            {/* Contenido expansible */}
                            {expandedEmployee === employee.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        {/* Filas de la imagen, alineadas */}
                                        <span className="font-medium text-gray-600">Nombre</span>
                                        <span className="text-gray-800 truncate">{employee.first_name}</span>

                                        <span className="font-medium text-gray-600">Apellido</span>
                                        <span className="text-gray-800 truncate">{employee.last_name}</span>

                                        <span className="font-medium text-gray-600">CUIT</span>
                                        <span className="text-gray-800">{employee.cuit}</span>

                                        <span className="font-medium text-gray-600">Celular</span>
                                        <span className="text-gray-800">{employee.celular}</span>

                                        <span className="font-medium text-gray-600">Email</span>
                                        <span className="text-gray-800 truncate">{employee.email}</span>


                                        <span className="font-medium text-gray-600">Estado</span>
                                        <span><StatusBadge isActive={employee.is_active} /></span>


                                        {/* Acciones - Parte inferior de la lista */}
                                        <div className="col-span-2 pt-3 flex justify-end space-x-3 border-t mt-2 border-gray-200">
                                            <button
                                                onClick={() => handleDelete(employee.id)}
                                                className="p-2 text-red-600 hover:text-red-800 bg-red-100 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(employee)}
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
                    <button
                        onClick={() => fetchPage(previousPage)}
                        disabled={!previousPage || fetching}
                        className={`p-3 border rounded-full hover:bg-gray-200 transition ${!previousPage || fetching ? 'opacity-50 cursor-not-allowed' : 'text-gray-500'}`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center px-3 text-sm text-gray-600">
                        Mostrando {employees.length} de {totalCount}
                    </div>
                    <button
                        onClick={() => fetchPage(nextPage)}
                        disabled={!nextPage || fetching}
                        className={`p-3 border rounded-full hover:bg-orange-100 transition ${!nextPage || fetching ? 'opacity-50 cursor-not-allowed' : 'text-orange-500'}`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

            </main>

            {/* 3. Modal para Crear/Editar empleado (UX mejorada) */}
            {isModalOpen && (
                <div className="fixed inset-0 backdrop-blur-xs bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl transform transition-all overflow-y-auto max-h-[90vh]">
                        {/* Encabezado del Modal */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditing ? 'Editar Emmpleado' : 'Crear Nuevo Empleado'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Formulario del Modal */}
                        <form onSubmit={handleSave} className="space-y-4">

                            <InputField label="Nombre" name="first_name" value={newEmployee.first_name} setNewClient={setNewEmployee} disabled={loading} type="text" required={false} />
                            <InputField label="Apellido" name="last_name" value={newEmployee.last_name} setNewClient={setNewEmployee} disabled={loading} type="text" required={false} />
                            <InputField label="CUIT" name="cuit" value={newEmployee.cuit} setNewClient={setNewEmployee} disabled={loading} type="text" />
                            <InputField label="Usuario" name="username" value={newEmployee.username} setNewClient={setNewEmployee} disabled={loading} type="text" />
                            {!isEditing && (
                                <InputField label="Contraseña" name="password" value={newEmployee.password} setNewClient={setNewEmployee} disabled={loading} type="password" />
                            )}
                            <InputField label="Email" name="email" value={newEmployee.email} setNewClient={setNewEmployee} disabled={loading} type="email" />
                            <InputField label="Celular" name="celular" value={newEmployee.celular} setNewClient={setNewEmployee} disabled={loading} type="text" />

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

const ChevronLeft = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRight = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
