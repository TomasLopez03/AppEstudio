import { createContext, useState } from 'react';
import { login, refreshToken } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Inicializa el estado con los valores de localStorage
    const storedUser = localStorage.getItem('user');
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [refreshTokenState, setRefreshTokenState] = useState(localStorage.getItem('refreshToken'));
    const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

    // Función para iniciar sesión
    const handleLogin = async (credentials) => {
        try {
            const response = await login(credentials);
            const { access, refresh, id, username, role } = response.data;
            setAccessToken(access);
            setRefreshTokenState(refresh);
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            // Puedes guardar datos de usuario si tu API los devuelve
            const userData = { id, username, role };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            return userData;
        } catch (error) {
            return false;
        }
    };

    // Función para refrescar el access token
    const handleRefresh = async () => {
        try {
            const response = await refreshToken({ refresh: refreshTokenState });
            const { access } = response.data;
            setAccessToken(access);
            localStorage.setItem('accessToken', access);
            return access;
        } catch (error) {
            handleLogout();
            return null;
        }
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        setAccessToken(null);
        setRefreshTokenState(null);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{
            accessToken,
            refreshToken: refreshTokenState,
            user,
            login: handleLogin,
            refresh: handleRefresh,
            logout: handleLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
};