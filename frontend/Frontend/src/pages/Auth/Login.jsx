import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext.jsx';
import { Mail, Lock, Loader2 } from 'lucide-react';

export const Login = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);


    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        if (!username || !password) {
            setError('Por favor, ingresa tu usuario y contraseña.');
            return;
        }
        setLoading(true);
        const userData = await login({ username, password });
        if (!userData) {
            setLoading(false);
            setError('Usuario o contraseña incorrectos');
        } else {
            setError('');
            // Redirige 
            if (userData.role === 'admin') {
                navigate('/admin');
            }
            else if (userData.role === 'employee') {
                navigate('/employee');
            }
            else if (userData.role === 'client') {
                navigate('/client');
            }
        }
    };
    const getErrorClass = (field) => {
        return submitted && !field
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-orange-500';
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 font-sans">
            <div className="w-full max-w-sm bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
                <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10">
                    Iniciar Sesión
                </h1>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    {/* campo de usuario */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Usuario
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if (error) setError('');
                                }}
                                className={`w-full py-3 pl-10 pr-4 border rounded-xl transition duration-150 shadow-sm
                  focus:outline-none focus:ring-2 ${getErrorClass(username)}`}
                                placeholder="ej. tu_usuario123"
                            //                 disabled={loading}
                            />
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        {/* Mensaje de error de campo requerido para Usuario */}
                        {submitted && !username && (
                            <p className="text-red-500 text-xs mt-1">El campo Usuario es obligatorio.</p>
                        )}
                    </div>
                    {/* campo de contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError('');
                                }}
                                className={`w-full py-3 pl-10 pr-4 border rounded-xl transition duration-150 shadow-sm
                  focus:outline-none focus:ring-2 ${getErrorClass(password)}`}
                                placeholder="********"
                                disabled={loading}
                            />
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        {/* Mensaje de error de campo requerido para Contraseña */}
                        {submitted && !password && (
                            <p className="text-red-500 text-xs mt-1">El campo Contraseña es obligatorio.</p>
                        )}
                    </div>
                    {/* Enlace de "Olvidaste la Contraseña?" */}
                    <div className="text-right pt-2">
                        <a
                            href="#"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-150"
                            onClick={(e) => {
                                e.preventDefault();
                                setError('Simulación: Se ha iniciado el proceso de recuperación de contraseña.');
                            }}
                        >
                            ¿Olvidaste la Contraseña?
                        </a>
                    </div>
                    {/* Mensaje de error general (usuario/contraseña incorrecta) */}
                    {error && (
                        <div className={`p-3 rounded-lg text-sm transition-all duration-300 ${error.includes('exitoso') ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'
                            }`} role="alert">
                            {error}
                        </div>
                    )}
                    {/* Botón de Iniciar Sesión */}
                    <button
                        type="submit"
                        className={`w-full py-3 rounded-xl text-white font-bold tracking-wider uppercase transition duration-300 ease-in-out shadow-lg flex items-center justify-center
              ${loading
                                ? 'bg-orange-400 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300'
                            }`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-3 h-5 w-5" />
                                Iniciando...
                            </>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login


