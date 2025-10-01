import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext.jsx';

export const Login = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = await login({ username, password });
        if (!userData) {
            setError('Usuario o contraseña incorrectos');
        } else {
            setError('');
            // Redirige 
            if(userData.role === 'admin'){
                navigate('/admin');
            }
            else if(userData.role === 'employee'){
                navigate('/employee');
            }
            else if(userData.role === 'client'){
                navigate('/client');
            }
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 border-1 mt-30 w-80 h-75 rounded-lg shadow-lg">
                <div className="flex flex-col gap-2 mt-3">
                    <label className='ml-2' htmlFor="username">usuario</label>
                    <input className='border-1 px-3.5 py-1 rounded-full'
                        type="text"
                        id='username'
                        value={username}
                        placeholder='johnDoe'
                        onChange={e => setUsername(e.target.value)}
                        required
                    />

                </div>
                <div className="flex flex-col gap-2">
                    <label className='ml-2' htmlFor="password">contraseña</label>
                    <input className='border-1 px-3.5 py-1 rounded-full'
                        type="password"
                        id='password'
                        value={password}
                        placeholder='ContrseñaSegura123'
                        onChange={e => setPassword(e.target.value)}
                        required
                    />

                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex flex-col p-1.5 rounded-full font-medium text-white bg-amber-500 hover:bg-amber-600" >
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


