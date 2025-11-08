import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './Login.css'; 

const Register = () => {
    const { register } = useAuth(); 
    const navigate = useNavigate();
    const [name, setName] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!name || !email || !password) {
            setError('Por favor, ingresa tu nombre, correo y contraseña.');
            return;
        }

        setIsLoading(true);
        
        try {
            // Llama a la función de registro. Si es exitosa, resuelve la promesa.
            await register(name, email, password); 

            // Éxito: Redirigir al inicio o a una página de bienvenida
            navigate('/', { replace: true }); 
            
        } catch (error) {
            console.error("Error durante el registro:", error);
            setError(error || 'Ocurrió un error inesperado durante el registro.');
            
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-left-panel">
            </div>

            {/* Columna Derecha: Formulario de Registro */}
            <div className="login-right-panel">
                <div className="login-form-wrapper">
                    <h2 className="app-name">APRENDE/JUEGA</h2>
                    <h3 className="welcome-message">Crea tu cuenta</h3>
                    <p className="signup-prompt">
                        Ya tienes cuenta? <Link to="/login" className="link">Ingresar</Link>.
                    </p>

                    <form className="login-form" onSubmit={handleRegister}>
                        
                        {/* Campo: Name */}
                        <div className="form-group">
                            <label htmlFor="name">Usuario</label>
                            <input 
                                type="text" 
                                id="name" 
                                placeholder="Tu usuario"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        
                        {/* Campo: Email */}
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        
                        {/* Campo: Password */}
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="········" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        
                        {/* Mensaje de error */}
                        {error && <p style={{ color: '#dc3545', textAlign: 'center', fontSize: '0.9em', marginBottom: '10px' }}>{error}</p>}
                        
                        <button type="submit" className="btn-login" disabled={isLoading}>
                            {isLoading ? 'Registrando...' : 'Registrar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;