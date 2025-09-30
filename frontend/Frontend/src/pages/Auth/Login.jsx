import { useState, useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext.jsx';

export const Login = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login({ username, password });
        if (!success) {
            setError('Usuario o contraseña incorrectos');
        } else {
            setError('');
            // Redirige o actualiza la UI según tu app
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 border-1 mt-30 w-80 h-72">
                <div className="flex flex-col gap-2 mt-3">
                    <label htmlFor="username">usuario</label>
                    <input className='border-1 px-2 py-1'
                        type="text"
                        id='username'
                        value={username}
                        placeholder='johnDoe'
                        onChange={e => setUsername(e.target.value)}
                        required
                    />

                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="password">contraseña</label>
                    <input className='border-1 px-2 py-1'
                        type="password"
                        id='password'
                        value={password}
                        placeholder='ContrseñaSegura123'
                        onChange={e => setPassword(e.target.value)}
                        required
                    />

                </div>
                <div className="flex flex-col gap-2 mt-4 p-1.5 rounded-full font-medium bg-orange-400 " >
                    <button
                        type="submit"
                    >
                        Iniciar Sesion
                    </button>
                </div>
                
            </form>
        </div>
    )
}

export default Login


