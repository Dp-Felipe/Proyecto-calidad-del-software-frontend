import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext'; 
import './Login.css'; 

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    // LÓGICA DE INICIO DE SESIÓN
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!username || !password) {
            setError('Por favor, ingresa tu usuario y contraseña.');
            return;
        }

        setIsLoading(true);

        try {
            await login(username, password); 
            
            navigate('/', { replace: true });
            
        } catch (error) {
            console.error("Error durante el login:", error);
            setError(error || 'Ocurrió un error inesperado al iniciar sesión.');
            
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="login-container">
            {/* PANEL IZQUIERDO: DECORATIVO */}
            <div className="login-left-panel">
                <div className="login-branding">
                </div>
                <div className="login-welcome-content">
                </div>
                <div className="login-footer">
                </div>
            </div>

            {/* PANEL DERECHO: FORMULARIO DE LOGIN */}
            <div className="login-right-panel">
                <div className="login-form-wrapper">
                    <h2 className="app-name">JUEGA/APRENDE</h2>
                    <h3 className="welcome-message">Bienvenido</h3>
                    
                    <p className="signup-prompt">
                        No tienes cuenta<Link to="/register" className="link"> Crea una cuenta</Link>
                    </p>

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="username">Usuario</label>
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Tu nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading} 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="········" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading} 
                            />
                        </div>
                        
                        {/* Mensaje de error o de carga */}
                        {error && <p style={{ color: '#dc3545', textAlign: 'center', fontSize: '0.9em', marginBottom: '10px' }}>{error}</p>}
                        
                        <button type="submit" className="btn-login" disabled={isLoading}>
                            {isLoading ? 'Iniciando Sesión...' : 'Ingresar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;