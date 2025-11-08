const STORAGE_KEY = 'highScoresData';

// 💡 Mapeo de claves internas a nombres para la interfaz
export const GAME_KEYS = ['MathGame', 'RiddlesGame', 'EnglishGame', 'TriviaGame'];
export const GAME_NAMES = {
    'MathGame': 'Juego de Matemáticas',
    'RiddlesGame': 'Acertijos',
    'EnglishGame': 'Vocabulario en Inglés',
    'TriviaGame': 'Trivia de Colombia',
};

// 💡 Dificultades disponibles (deben coincidir con las usadas en los juegos)
export const DIFFICULTIES = ['Fácil', 'Medio', 'Difícil'];

/**
 * Carga todos los puntajes altos desde localStorage.
 * @returns {Object} Estructura de puntajes: { [gameKey]: { [difficulty]: score } }
 */
export const loadHighScores = () => {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        // Devuelve el objeto si existe, o un objeto vacío si no hay datos.
        return json ? JSON.parse(json) : {};
    } catch (e) {
        console.error("Error al cargar puntajes de localStorage:", e);
        return {};
    }
};

/**
 * Guarda el nuevo puntaje si es superior al puntaje alto actual.
 * 💡 ESTA FUNCIÓN DEBE SER LLAMADA AL FINALIZAR CADA JUEGO.
 * * @param {string} gameKey - La clave del juego (e.g., 'MathGame').
 * @param {string} difficulty - La dificultad (e.g., 'Medio').
 * @param {number} newScore - El puntaje obtenido.
 * @returns {{isNewRecord: boolean, bestScore: number}} - Retorna si fue un nuevo récord y el mejor puntaje.
 */
export const saveNewHighScore = (gameKey, difficulty, newScore) => {
    const allScores = loadHighScores();
    const gameScores = allScores[gameKey] || {};
    const currentBest = gameScores[difficulty] || 0;
    
    let isNewRecord = false;

    if (newScore > currentBest) {
        // Nuevo récord!
        gameScores[difficulty] = newScore;
        allScores[gameKey] = gameScores;
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allScores));
            isNewRecord = true;
        } catch (e) {
            console.error("Error al guardar el nuevo puntaje en localStorage:", e);
        }
    }
    
    // Retorna el mejor puntaje (ya sea el nuevo o el anterior)
    return { 
        isNewRecord, 
        bestScore: isNewRecord ? newScore : currentBest 
    };
};