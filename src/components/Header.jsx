import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

// SECCIÓN: COMPONENTE
const Header = () => {
    // SECCIÓN: ESTADOS
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // SECCIÓN: CONSTANTES DE NAVEGACIÓN
    const navItems = [
        { name: 'Inicio', link: '/' },
        { name: 'Calendario', link: '/calendario' },
        { name: 'Juegos', link: '/juegos' },
        { name: 'Puntajes', link: '/puntajes' }, 
    ];

    // SECCIÓN: MANEJADOR DE EVENTOS
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className='app-header'>
            {/* SECCIÓN: TÍTULO */}
            <div className='app-header-title'> 
                APRENDE/JUEGA
            </div>

            {/* SECCIÓN: BOTÓN HAMBURGUESA (visible solo en móvil) */}
            <button className='menu-toggle' onClick={toggleMenu} aria-expanded={isMenuOpen}>
                <span className='menu-icon'></span>
            </button>

            {/* SECCIÓN: NAVEGACIÓN */}
            <nav className={`app-nav ${isMenuOpen ? 'open' : ''}`}>
                <ul className='nav-list' onClick={() => setIsMenuOpen(false)}> {/* Cierra al hacer clic en un enlace */}
                    {navItems.map((item) => (
                        <li key={item.name} className='nav-list-item'>
                            <Link to={item.link}> 
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default Header;