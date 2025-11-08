import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TriviaGame.css'; 
import { COLOMBIA_QUESTIONS } from '../data/triviaDataColombia'; 
// 💡 NUEVAS IMPORTACIONES: Funciones para guardar y cargar puntajes
import { saveNewHighScore, loadHighScores } from '../utils/scoreUtils'; 

// ===================================================================
// 💡 DATOS Y LÓGICA DE PREGUNTAS
// ===================================================================

const triviaQuestions = COLOMBIA_QUESTIONS; 

const getRandomQuestion = (difficulty) => {
    // Usa el banco de preguntas importado
    const list = triviaQuestions[difficulty] || triviaQuestions['Fácil']; 
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
};

// ===================================================================
// 💡 COMPONENTE PRINCIPAL
// ===================================================================

const TriviaGame = () => {
    // --- Configuración Inicial ---
    const [difficulty, setDifficulty] = useState('Medio');
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);
    
    // --- Estados del Juego (Actualizados) ---
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0); 
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null); // Usado para feedback de respuesta Y mensaje final
    
    // 💡 LÓGICA DE PUNTUACIÓN POR TIEMPO (Copiada de MathGame)
    const minutesPassedRef = useRef(0); 
    const [lastMinuteScore, setLastMinuteScore] = useState(0); 
    const [initialScorePerAnswer, setInitialScorePerAnswer] = useState(0); 

    // --- Temporizadores y Refs ---
    const gameTimerRef = useRef(null);
    const feedbackTimerRef = useRef(null);
    
    // 💡 Estado de Mejor Puntaje (gestionado por scoreUtils)
    const [bestScore, setBestScore] = useState(0);

    // --- Funciones de Lógica ---
    
    // Función para obtener los puntos de respuesta solo para la pantalla de configuración
    const getDifficultyPoints = useCallback(() => {
        switch (difficulty) {
            case 'Fácil': return 10;
            case 'Medio': return 20;
            case 'Difícil': return 30;
            default: return 20;
        }
    }, [difficulty]);
    
    // FUNCIÓN PARA ESTABLECER LA PUNTUACIÓN BASE
    const setInitialConfig = useCallback((level) => {
        let minutePoints = 0;
        let answerPoints = 0;

        switch (level) {
            case 'Fácil':
                minutePoints = 1;
                answerPoints = 10;
                break;
            case 'Medio': 
                minutePoints = 2;
                answerPoints = 20;
                break;
            case 'Difícil':
            default:
                minutePoints = 3;
                answerPoints = 30;
        }
        setLastMinuteScore(minutePoints);
        setInitialScorePerAnswer(answerPoints);
    }, []);

    const startNewQuestion = useCallback(() => {
        if (feedbackTimerRef.current) {
            clearTimeout(feedbackTimerRef.current);
        }

        const newQ = getRandomQuestion(difficulty);
        setCurrentQuestion(newQ);
        setSelectedAnswer(null);
        setFeedback(null);
    }, [difficulty]);
    
    const startGame = () => {
        // Inicialización del tiempo transcurrido y la puntuación por minuto
        setTimeElapsed(0); 
        minutesPassedRef.current = 0; 
        setInitialConfig(difficulty); 

        setScore(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setIsGameEnded(false);
        setIsGameStarted(true);
        startNewQuestion();
    };

    // 💡 LÓGICA DE FINALIZACIÓN Y GUARDADO DE PUNTUACIÓN (ACTUALIZADA)
    const resetGame = () => {
        const gameKey = 'TriviaGame'; // Clave para este juego
        const finalScore = score;
        
        // 1. Guardar y verificar récord
        const { isNewRecord, bestScore: updatedBestScore } = saveNewHighScore(gameKey, difficulty, finalScore);
        
        // 2. Establecer mensaje de finalización
        let finalMessage = `Juego Terminado. Tu puntaje final fue ${finalScore}. El récord de ${difficulty} sigue siendo ${updatedBestScore}.`;
        if (isNewRecord) {
            finalMessage = `¡Juego Terminado! 🚀 ¡NUEVO RÉCORD en ${difficulty}: ${finalScore} puntos!`;
        }
        
        // 3. Actualizar estados para volver a la pantalla de configuración
        setBestScore(updatedBestScore); 
        setIsGameEnded(true); // Indica que el juego terminó
        setIsGameStarted(false); // Vuelve a la pantalla de configuración

        // 4. Limpiar estados de juego activo
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setFeedback({ message: finalMessage }); // Usamos el estado 'feedback' para mostrar el puntaje final
        
        // 5. Detener temporizadores
        clearInterval(gameTimerRef.current); 
        clearTimeout(feedbackTimerRef.current);
    };

    const handleAnswerSelect = (option) => {
        if (!isGameStarted || isGameEnded || selectedAnswer) return;
        
        setSelectedAnswer(option);

        const correct = option === currentQuestion.a;
        const points = initialScorePerAnswer; 

        if (correct) {
            setScore(prev => prev + points);
            setCorrectCount(prev => prev + 1);
            setFeedback({ type: 'correct', message: `¡Correcto! +${points} puntos. ✅` });
        } else {
            setIncorrectCount(prev => prev + 1);
            setFeedback({ type: 'incorrect', message: `Incorrecto. La respuesta era ${currentQuestion.a} ❌` });
        }
        
        feedbackTimerRef.current = setTimeout(startNewQuestion, 1000); 
    };

    // --- Efectos ---

    // Lógica del temporizador de conteo ascendente y puntos por minuto
    useEffect(() => {
        if (!isGameStarted || isGameEnded) {
            clearInterval(gameTimerRef.current);
            return;
        }

        gameTimerRef.current = setInterval(() => {
            setTimeElapsed(prevTime => {
                const newTime = prevTime + 1; 
                const currentMinutesPassed = Math.floor(newTime / 60);

                if (currentMinutesPassed > minutesPassedRef.current) { 
                    setScore(prevScore => prevScore + lastMinuteScore);
                    minutesPassedRef.current = currentMinutesPassed; 
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(gameTimerRef.current);
    }, [isGameStarted, isGameEnded, lastMinuteScore]); 

    // 💡 LÓGICA DE CARGA INICIAL DEL MEJOR PUNTAJE (NUEVA)
    useEffect(() => {
        // Carga el mejor puntaje de 'TriviaGame' para la dificultad actual
        const allScores = loadHighScores();
        const currentBest = (allScores['TriviaGame'] && allScores['TriviaGame'][difficulty]) || 0;
        setBestScore(currentBest);
    }, [difficulty, isGameStarted]); // Recarga si cambia la dificultad O si vuelve a la pantalla de inicio

    // 💡 ELIMINADO: El useEffect que guardaba el puntaje (ahora lo hace resetGame)

    // --- Utilidad ---

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };


    // ===================================================================
    // RENDERIZADO
    // ===================================================================

    // --- 1. Pantalla de Configuración (Inicio) ---
    if (!isGameStarted) {
        return (
            <div className="trivia-game-container setup-screen">
                <div className="config-box">
                    <h1>🧠 Desafío de Cultura General</h1>
                    
                    {/* Selector de Dificultad */}
                    <label>
                        Seleccionar Dificultad (+{getDifficultyPoints()} pts por acierto):
                    </label>
                    <div className="difficulty-selector">
                        {['Fácil', 'Medio', 'Difícil'].map(level => (
                            <button
                                key={level}
                                className={`btn ${difficulty === level ? 'btn-active' : 'btn-tertiary'}`}
                                onClick={() => setDifficulty(level)}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    
                    {/* ELIMINADO: Selector de Tiempo */}
                    
                    <button onClick={startGame} className="btn btn-start">
                        Comenzar Desafío
                    </button>
                    
                    {/* 💡 MUESTRA LA PUNTUACIÓN FINAL AL TERMINAR MANUALMENTE */}
                    {isGameEnded && feedback && <div className="game-over-message">{feedback.message}</div>}
                    <p className="best-score-display">Mejor Récord ({difficulty}): {bestScore}</p>
                </div>
            </div>
        );
    }

    // --- 2. Pantalla de Juego Activo ---
    return (
        <div className="trivia-game-container active-game">
            
            {/* Encabezado con Tiempo y Puntaje */}
            <div className="game-header">
                <div className="timer-box">
                    ⏳ Tiempo transcurrido: <span className="timer-value">{formatTime(timeElapsed)}</span>
                </div>
                <div className="score-box">
                    Puntaje: <span className="score-value">{score}</span> | Mejor: {bestScore}
                </div>
            </div>
            
            {/* Panel de Pregunta */}
            {currentQuestion && (
                <div className="question-panel">
                    {/* Muestra la nueva lógica de puntuación */}
                    <p className="difficulty-label">Nivel: {difficulty} (+{initialScorePerAnswer} pts por acierto, +{lastMinuteScore} pts por minuto)</p>
                    
                    <div className="question-display">
                        {currentQuestion.q}
                    </div>

                    <div className="options-grid">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-button ${
                                    selectedAnswer === option 
                                    ? (feedback && feedback.type === 'correct' ? 'correct-selected' : 'incorrect-selected') 
                                    : (feedback && option === currentQuestion.a ? 'correct-answer' : '')
                                }`}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={!!selectedAnswer} 
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    
                    {feedback && (
                        <p className={`feedback-message ${feedback.type}`}>
                            {feedback.message}
                        </p>
                    )}
                </div>
            )}
            
            <button onClick={resetGame} className="btn btn-small btn-secondary reset-button">
                Finalizar Juego
            </button>
        </div>
    );
};

export default TriviaGame;