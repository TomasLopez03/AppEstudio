import { useContext, useState, useEffect } from 'react'
import { User, Mail, Phone, Lock, Save, Edit, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../auth/AuthContext.jsx';
import Navbar from './Navbar';
import toast from 'react-hot-toast';
import { getProfile, partialUpdateProfile } from '../api/users';

export const Profile = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        celular: '',
        usuario: '',
        email: '',
        razon_social: '',
        cuit: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // 2. Estado para controlar el modo de edición
    const [isEditing, setIsEditing] = useState(false);
    // 3. Estado para la nueva contraseña (vacío por defecto)
    const [newPassword, setNewPassword] = useState('');

    // Maneja el cambio en cualquier campo del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Maneja el cambio en el campo de nueva contraseña
    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    // Save using partialUpdateProfile
    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.email) {
            toast.error('El nombre y el email son obligatorios.');
            return;
        }

            // No profileId required: backend exposes profile at /api/profile/ (RetrieveUpdateAPIView)

        try {
            setSaving(true);
            const payload = {
                username: formData.usuario,
                email: formData.email,
                razon_social: formData.razon_social,
                cuit: formData.cuit,
                celular: formData.celular,
                first_name: formData.nombre,
                last_name: formData.apellido,
            };
            // If user provided a new password, include it (backend must accept this)
            if (newPassword) payload.password = newPassword;

            await partialUpdateProfile(payload);
            toast.success('Perfil actualizado con éxito');
            setIsEditing(false);
            setNewPassword('');
        } catch (err) {
            console.error('Error actualizando perfil', err);
            toast.error('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    // Load profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const res = await getProfile();
                const data = res?.data || {};
                setFormData({
                    nombre: data.first_name || '',
                    apellido: data.last_name || '',
                    celular: data.celular || '',
                    usuario: data.username || '',
                    email: data.email || '',
                    razon_social: data.razon_social || '',
                    cuit: data.cuit || ''
                });
            } catch (err) {
                console.error('Error cargando perfil', err);
                toast.error('Error al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user?.id]);

    const NotificationToast = () => null;
    return (
        <>
            <Navbar userRole={user?.role} />
            <div className="min-h-screen bg-gray-100  flex flex-col items-center p-4 md:p-8 font-sans">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 lg:p-10 mt-10">

                    {loading && (
                        <div className="text-center p-6 mb-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-600">Cargando perfil...</p>
                        </div>
                    )}

                    {/* Encabezado y Botón de Edición */}
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold text-orange-600 flex items-center">
                            <User className="w-7 h-7 mr-3 text-gray-700" />
                            Mi Perfil
                        </h1>
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    // Al cancelar, recargamos desde el servidor
                                    getProfile().then(res => {
                                        const d = res?.data || {};
                                        setFormData({
                                            nombre: d.first_name || '',
                                            apellido: d.last_name || '',
                                            celular: d.celular || '',
                                            usuario: d.username || '',
                                            email: d.email || '',
                                            razon_social: d.razon_social || '',
                                            cuit: d.cuit || ''
                                        });
                                    }).catch(() => {});
                                    setNewPassword('');
                                }
                                setIsEditing(!isEditing);
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md flex items-center space-x-2 
                            ${isEditing
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                        >
                            {isEditing ? <XCircle className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                            <span>{isEditing ? 'Cancelar Edición' : 'Editar Datos'}</span>
                        </button>
                    </div>

                    {/* Formulario de Datos */}
                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Fila: Nombre y Apellido */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                id="nombre"
                                label="Nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                disabled={!isEditing}
                                icon={User}
                            />
                            <InputField
                                id="apellido"
                                label="Apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                disabled={!isEditing}
                                icon={User}
                            />
                        </div>

                        {/* Fila: Celular y Usuario */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                id="celular"
                                label="Celular"
                                name="celular"
                                value={formData.celular}
                                onChange={handleChange}
                                disabled={!isEditing}
                                icon={Phone}
                                type="tel"
                            />
                            <InputField
                                id="usuario"
                                label="Usuario / ID"
                                name="usuario"
                                value={formData.usuario}
                                // El nombre de usuario/ID generalmente no se puede cambiar
                                disabled={true}
                                icon={User}
                            />
                        </div>
                        
                        <InputField 
                            id="razon_social"
                            label="Razón Social"
                            name="razon_social"
                            value={formData.razon_social}
                            onChange={handleChange}
                            disabled={!isEditing}
                            icon={User}
                            type='text'
                        />
                        {/* Fila: Email */}
                        <InputField
                            id="email"
                            label="Correo Electrónico"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            icon={Mail}
                            type="email"
                        />

                        {/* Fila: Contraseña (Solo aparece para edición) */}
                        {isEditing && (
                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Cambiar Contraseña</h3>
                                <InputField
                                    id="newPassword"
                                    label="Nueva Contraseña"
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={handlePasswordChange}
                                    disabled={!isEditing}
                                    icon={Lock}
                                    type="password"
                                    placeholder="Dejar vacío para no cambiar"
                                />
                                <p className="text-xs text-gray-500 mt-2">La contraseña debe tener al menos 8 caracteres.</p>
                            </div>
                        )}

                        {/* Botón de Guardar (Solo visible en modo edición) */}
                        {isEditing && (
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`w-full md:w-auto px-6 py-3 ${saving ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white font-bold text-lg rounded-xl shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2`}
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                                </button>
                            </div>
                        )}
                    </form>

                </div>
            </div>
        </>
    )
}

const InputField = ({ id, label, value, onChange, disabled, icon: Icon, type = "text", placeholder = "" }) => (
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
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full px-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none 
                    ${disabled
                        ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-default'
                        : 'bg-white border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                    }`}
            />
        </div>
    </div>
);
