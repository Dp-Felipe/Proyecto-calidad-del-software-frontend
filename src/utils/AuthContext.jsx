import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios'; 
// Asegúrate de que esta URL base sea correcta.
const API_URL = 'http://localhost:3000/api/auth'; 

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// 💡 Duración de la sesión: 1 hora en milisegundos
const EXPIRATION_DURATION = 60 * 60 * 1000; 

export const AuthProvider = ({ children }) => {
    // 💡 CAMBIO: Usamos sessionStorage para que la sesión se borre al cerrar la pestaña
    const [token, setToken] = useState(sessionStorage.getItem('token') || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // 💡 Referencia para almacenar el temporizador de auto-logout
    const timerRef = useRef(null);

    // ==========================================================
    // 🔓 FUNCIÓN DE LOGOUT
    // ==========================================================
    const logout = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('expiration'); 
    }, []);
    
    // Función local para configurar el temporizador de auto-logout
    const setupAutoLogout = useCallback((expirationTime) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        
        const timeUntilLogout = expirationTime - Date.now();
        
        if (timeUntilLogout > 0) {
            timerRef.current = setTimeout(() => {
                console.log('Session expired (1 hour limit). Logging out automatically.');
                logout(); // Llama a la función de logout
            }, timeUntilLogout);
        }
    }, [logout]);

    // Función auxiliar para manejar el guardado de sesión
    const saveSession = (userData, newToken) => {
        const expirationTime = Date.now() + EXPIRATION_DURATION;

        setUser(userData);
        setToken(newToken);
        
        // 💡 Guardar en sessionStorage y añadir el tiempo de expiración
        sessionStorage.setItem('token', newToken);
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('expiration', expirationTime.toString());
        
        // 💡 Configurar el temporizador de auto-logout
        setupAutoLogout(expirationTime);
    };

    // ==========================================================
    // 💡 EFECTO PRINCIPAL: Carga y verificación de caducidad
    // ==========================================================
    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');
        const storedExpiration = sessionStorage.getItem('expiration');
        
        if (storedToken && storedUser && storedExpiration) {
            const expirationTime = parseInt(storedExpiration, 10);
            const currentTime = Date.now();
            
            // 1. Verificar si la sesión ya expiró
            if (currentTime >= expirationTime) {
                console.log('Stored session has expired based on timestamp. Logging out.');
                logout();
            } else {
                // 2. Si es válida, restaurar estado y configurar el temporizador
                setToken(storedToken);
                try {
                    setUser(JSON.parse(storedUser));
                    setupAutoLogout(expirationTime);
                } catch (e) {
                    logout();
                }
            }
        }
        setLoading(false);
        
        // 💡 Limpieza: Detener el temporizador cuando el componente se desmonte
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };

    }, [logout, setupAutoLogout]); // Dependencias para asegurar la limpieza y configuración

    // ==========================================================
    // 🚀 FUNCIÓN DE REGISTRO
    // ==========================================================
    const register = async (name, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                name,
                email,
                password,
            });

            const { id, name: userName, email: userEmail, token: newToken } = response.data;
            const userData = { id, name: userName, email: userEmail };
            
            saveSession(userData, newToken); 

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error desconocido al registrar.';
            throw errorMessage;
        }
    };

    // ==========================================================
    // 🔑 FUNCIÓN DE LOGIN (Corregida para el backend)
    // ==========================================================
    // 💡 Ahora acepta 'username' (que puede ser el nombre o el correo)
    const login = async (username, password) => { 
        try {
            const response = await axios.post(`${API_URL}/login`, {
                // ✅ CORRECCIÓN CLAVE: Enviamos el 'username' bajo la clave 'email',
                // ya que el backend lo espera en req.body.email para la búsqueda OR.
                email: username, 
                password,
            });

            const { id, name: userName, email: userEmail, token: newToken } = response.data;
            const userData = { id, name: userName, email: userEmail };

            saveSession(userData, newToken); 
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error de credenciales.';
            console.error('Error durante el login:', errorMessage);
            throw errorMessage;
        }
    };


    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user && !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};