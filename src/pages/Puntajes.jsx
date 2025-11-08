import React, { useState, useEffect } from 'react';
import { loadHighScores, GAME_NAMES, GAME_KEYS, DIFFICULTIES } from '../utils/scoreUtils'; 
import './Puntajes.css'; // Importa el archivo de estilos

const Puntajes = () => {
    const [highScores, setHighScores] = useState({});

    useEffect(() => {
        // Cargar los puntajes al montar el componente
        setHighScores(loadHighScores());
    }, []);

    return (
        <div className="scores-page-container">
            <h1>🏆 Mejores Puntajes de Juego 🏆</h1>
            <p>Récords personales guardados en tu navegador para cada juego y dificultad.</p>
            
            <main className="scores-grid">
                {GAME_KEYS.map((gameKey) => {
                    const scores = highScores[gameKey] || {};
                    const gameName = GAME_NAMES[gameKey];

                    return (
                        <section key={gameKey} className="game-score-card">
                            <h2>{gameName}</h2>
                            
                            <div className="difficulty-list">
                                {DIFFICULTIES.map((difficulty) => {
                                    // Obtiene el mejor puntaje para esta dificultad
                                    const score = scores[difficulty] || 0; 
                                    
                                    return (
                                        <div key={difficulty} className="score-item">
                                            <span className="difficulty-name">{difficulty}:</span>
                                            <span className={`best-score-value ${score > 0 ? 'achieved' : 'zero'}`}>
                                                {score} puntos
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                        </section>
                    );
                })}
            </main>

            <footer className="scores-footer">
                <small>Los puntajes se almacenan localmente en el navegador que estás utilizando.</small>
            </footer>
        </div>
    );
};

export default Puntajes;