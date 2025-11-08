import React from 'react';
import { Link } from 'react-router-dom';
import './Juegos.css'; 

// Definición de los juegos disponibles
const gamesList = [
    {
        id: 'calculo-mental',
        name: 'CÁLCULO MENTAL',
        description: 'Mejora tu velocidad con sumas, restas y más.',
        link: '/juegos/calculo-mental',
        icon: '🧠',
        iconClass: 'icon-math'
    },
    {
        id: 'cultura-general',
        name: 'CULTURA GENERAL',
        description: 'Pon a prueba tu conocimiento mundial.',
        link: '/juegos/cultura-general',
        icon: '🌍', 
        iconClass: 'icon-trivia'
    },
    {
        id: 'ingles',
        name: 'APRENDE INGLÉS',
        description: 'Practica vocabulario y frases en inglés.',
        link: '/juegos/ingles', 
        icon: '🇬🇧', 
        iconClass: 'icon-english'
    },
    {
        id: 'acertijos', // 💡 NUEVO ID
        name: 'ACERTIJOS Y LÓGICA', // 💡 NUEVO JUEGO
        description: 'Resuelve retos de razonamiento y deducción.',
        link: '/juegos/acertijos', // 💡 NUEVO ENLACE
        icon: '💡', 
        iconClass: 'icon-riddles'
    },
];

const Juegos = () => { 
    return (
        <div className="games-menu-container">
            <h1>🎮 Catálogo de Juegos</h1>
            <p className="menu-subtitle">Elige tu desafío para hoy.</p>
            
            <div className="games-grid">
                {gamesList.map((game) => (
                    <Link to={game.link} key={game.id} className="game-card">
                        <div className={`game-icon ${game.iconClass}`}>
                            {game.icon} 
                        </div>
                        <div className="game-text-content">
                            <h2 className="game-title">{game.name}</h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Juegos;