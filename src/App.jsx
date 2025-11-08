import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
// Importaciones de Páginas
import Inicio from './pages/Inicio.jsx';
import Calendario from './pages/Calendario.jsx';
import Header from './components/Header.jsx'; 
import MathGame from './pages/MathGame.jsx'; 
import Juegos from './pages/Juegos.jsx'; 
import TriviaGame from './pages/TriviaGame.jsx'; 
import EnglishGame from './pages/EnglishGame.jsx'; 
import RiddlesGame from './pages/RiddlesGame.jsx'; 
import Puntajes from './pages/Puntajes.jsx'; 
import Login from './pages/Login.jsx'; 
import Register from './pages/Register.jsx'; 

// ====================================================================
// 1. COMPONENTE DE LAYOUT PROTEGIDO (Incluye el Header) 💡 NUEVO
// ====================================================================
const ProtectedLayout = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Redirige si no está autenticado
        return <Navigate to="/login" replace />;
    }

    // ✅ Renderiza el Header una sola vez, seguido de la ruta hija actual (<Outlet />)
    return (
        <>
            <Header />
            <main>
                {/* Outlet renderizará el componente de página correspondiente (Inicio, Calendario, etc.) */}
                <Outlet />
            </main>
        </>
    );
};


// ====================================================================
// 2. CONTENIDO PRINCIPAL CON LÓGICA DE AUTH (AppRoutes)
// ====================================================================
const AppRoutes = () => {
    const { isAuthenticated } = useAuth(); 

    return (
        <Routes>
            
            {/* 🔴 RUTAS PÚBLICAS: Login y Register */}
            <Route 
                path='/register' 
                element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
            />
            <Route 
                path='/login' 
                element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
            />

            {/* 🟢 RUTAS PROTEGIDAS: Usando el ProtectedLayout como padre */}
            {/* Todas las rutas definidas DENTRO de este <Route> serán hijas del ProtectedLayout. */}
            <Route element={<ProtectedLayout />}>
                
                {/* Rutas sin Header duplicado */}
                <Route path='/' element={<Inicio />} />
                <Route path='/calendario' element={<Calendario />} />
                <Route path='/juegos' element={<Juegos />} /> 
                <Route path='/puntajes' element={<Puntajes />} />

                {/* Rutas de Juegos Específicos */}
                <Route path='/juegos/calculo-mental' element={<MathGame />} />
                <Route path='/juegos/cultura-general' element={<TriviaGame />} /> 
                <Route path='/juegos/ingles' element={<EnglishGame />} /> 
                <Route path='/juegos/acertijos' element={<RiddlesGame />} /> 
                
                {/* Rutas de Placeholder */}
                <Route path='/juegos/juegos-bloques' element={
                    <div style={{ padding: '20px', textAlign: 'center' }}>Juegos de Bloques - En desarrollo</div>
                } />
                <Route path='/juegos/juegos-mouse' element={
                    <div style={{ padding: '20px', textAlign: 'center' }}>Juegos de Mouse - En desarrollo</div>
                } />

            </Route>

            {/* Manejo de Rutas No Encontradas (404) */}
            <Route path="*" element={
                isAuthenticated ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Error 404: Página no encontrada.</div>
                ) : (
                    <Navigate to="/login" replace />
                )
            } />
        </Routes>
    );
}

// ====================================================================
// 3. COMPONENTE PRINCIPAL (App)
// ====================================================================
function App() {
    return (
        <BrowserRouter>  
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>  
    );
}

export default App;