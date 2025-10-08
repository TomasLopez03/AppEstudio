import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useContext(AuthContext);

    // 1. Definir los estados de redirección y mensaje
    const [redirectPath, setRedirectPath] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // 2. Lógica de comprobación de autenticación y autorización
    useEffect(() => {
        let path = null;
        let message = null;

        // Comprobación de autenticación
        if (!user) {
            path = "/login";
            message = "Por favor, inicia sesión para acceder a esta página.";
        } 
        // Comprobación de autorización (solo si el usuario existe y hay roles definidos)
        else if (allowedRoles && !allowedRoles.includes(user.role)) {
             // O a una página de acceso denegado
            path = `/${user.role}`;
            message = "No tienes permiso para acceder a esta página.";
        }

        // 3. Actualizar los estados (esto provocará una re-renderización si cambian)
        setRedirectPath(path);
        setErrorMessage(message);

    }, [user, allowedRoles]); // Se ejecuta cuando 'user' o 'allowedRoles' cambian

    // 4. Disparar el toast (Efecto Secundario)
    // Este useEffect se ejecuta solo cuando la ruta de redirección cambia a una ruta válida.
    useEffect(() => {
        if (errorMessage) {
            // ** CORRECCIÓN: El toast se ejecuta SÓLO una vez aquí, como efecto secundario.
            toast.error(errorMessage);
        }
    }, [errorMessage]); // Se ejecuta solo si el mensaje de error cambia

    // 5. Renderizar la Navegación o el Contenido
    if (redirectPath) {
        // La redirección sucede después de que el toast se ha disparado una vez.
        return <Navigate to={redirectPath} replace />;
    }
    
    // Si no hay redirección (autenticado y autorizado), mostrar el contenido
    return children;
}