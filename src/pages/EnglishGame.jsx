import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EnglishGame.css'; 
import { ENGLISH_VOCABULARY } from '../data/englishData'; 
// 💡 NUEVAS IMPORTACIONES: Funciones para guardar y cargar puntajes
import { saveNewHighScore, loadHighScores } from '../utils/scoreUtils'; 

// ===================================================================
// 💡 LÓGICA DE PREGUNTAS (Sin cambios)
// ===================================================================

const vocabulary = ENGLISH_VOCABULARY;

const getRandomVocab = (difficulty) => {
    // 💡 Asegúrate que 'Medio' coincida con la clave en englishData.js
    const list = vocabulary[difficulty] || vocabulary['Fácil']; 
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
};

// ===================================================================
// 💡 COMPONENTE PRINCIPAL (Modificado)
// ===================================================================

const EnglishGame = () => {
    // --- Configuración Inicial y Estados del Juego ---
    const [difficulty, setDifficulty] = useState('Medio'); // Asegúrate que 'Medio' sea la clave correcta
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);
    
    // --- ESTADOS DE PUNTUACIÓN Y TIEMPO (Adaptados del MathGame) ---
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0); // Tiempo transcurrido
    
    // ESTADOS PARA LA LÓGICA DE PUNTUACIÓN POR TIEMPO
    const minutesPassedRef = useRef(0); 
    const [lastMinuteScore, setLastMinuteScore] = useState(0); // Puntos por minuto
    const [initialScorePerAnswer, setInitialScorePerAnswer] = useState(0); // Puntos por respuesta
    
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null); 
    
    // --- Temporizadores y Récord ---
    const gameTimerRef = useRef(null);
    const feedbackTimerRef = useRef(null);
    const [bestScore, setBestScore] = useState(0); 

    // FUNCIÓN PARA ESTABLECER LA PUNTUACIÓN BASE SEGÚN LA DIFICULTAD (Adaptada)
    const setInitialConfig = useCallback((level) => {
        let minutePoints = 0;
        let answerPoints = 0;

        switch (level) {
            case 'Fácil':
                minutePoints = 1;
                answerPoints = 10;
                break;
            case 'Medio': // Asegúrate que 'Medio' sea la clave correcta
                minutePoints = 2;
                answerPoints = 20;
                break;
            case 'Difícil':
                minutePoints = 3;
                answerPoints = 30;
                break;
            default:
                minutePoints = 1;
                answerPoints = 10;
        }
        setLastMinuteScore(minutePoints);
        setInitialScorePerAnswer(answerPoints);
    }, []);

    const startNewQuestion = useCallback(() => {
        if (feedbackTimerRef.current) {
            clearTimeout(feedbackTimerRef.current);
        }

        const newQ = getRandomVocab(difficulty);
        setCurrentQuestion(newQ);
        setSelectedAnswer(null);
        setFeedback(null);
    }, [difficulty]);
    
    const startGame = () => {
        setScore(0);
        minutesPassedRef.current = 0; 
        setTimeElapsed(0); 
        setCorrectCount(0);
        setIncorrectCount(0);
        setIsGameEnded(false);
        setIsGameStarted(true);
        setInitialConfig(difficulty); 
        startNewQuestion();
    };

    // 💡 LÓGICA DE FINALIZACIÓN Y GUARDADO DE PUNTUACIÓN (ACTUALIZADA)
    const resetGame = () => {
        const gameKey = 'EnglishGame'; // Clave para este juego
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
        setIsGameEnded(true); 
        setIsGameStarted(false);

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
            setFeedback({ type: 'correct', message: `¡Correcto! (+${points} pts) ✅` });
        } else {
            setIncorrectCount(prev => prev + 1);
            setFeedback({ type: 'incorrect', message: `Incorrecto. La respuesta era: ${currentQuestion.a} ❌` });
        }
        
        feedbackTimerRef.current = setTimeout(startNewQuestion, 1200); 
    };

    // --- Efecto: Temporizador Continuo y Puntos por Minuto (Adaptado del MathGame) ---
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
    
    // --- Lógica de Mejor Puntuación (Adaptada) ---
    useEffect(() => {
        // Carga el mejor puntaje de 'EnglishGame' para la dificultad actual
        const allScores = loadHighScores();
        const currentBest = (allScores['EnglishGame'] && allScores['EnglishGame'][difficulty]) || 0;
        setBestScore(currentBest);
    }, [difficulty, isGameStarted]); // Recarga si cambia la dificultad O si vuelve a la pantalla de inicio

    // 💡 ELIMINADO: El useEffect que guardaba el puntaje al final (ahora lo hace resetGame)

    // --- Utilidad de Formato de Tiempo (Mantenida) ---
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };


    // ===================================================================
    // RENDERIZADO (Actualizado)
    // ===================================================================

    // --- 1. Pantalla de Configuración (Inicio) ---
    if (!isGameStarted) {
        // Función local para mostrar puntos en los botones
        const getDisplayPoints = (level) => {
            switch (level) {
                case 'Fácil': return { answer: 10, minute: 1 };
                case 'Medio': return { answer: 20, minute: 2 };
                case 'Difícil': return { answer: 30, minute: 3 };
                default: return { answer: 10, minute: 1 };
            }
        }
        
        return (
            <div className="english-game-container setup-screen">
                <div className="config-box">
                    <h1>📚 Desafío de Vocabulario en Inglés</h1>
                    
                    {/* Selector de Dificultad (Actualizado con info de puntos) */}
                    <label>Selecciona la Dificultad (Juego Continuo):</label>
                    <div className="difficulty-selector">
                        {['Fácil', 'Medio', 'Difícil'].map(level => {
                            const { answer, minute } = getDisplayPoints(level);
                            return (
                                <button
                                    key={level}
                                    className={`btn ${difficulty === level ? 'btn-active' : 'btn-tertiary'}`}
                                    onClick={() => setDifficulty(level)}
                                >
                                    {level} 
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* ELIMINADO: Selector de Tiempo */}
                    
                    <button onClick={startGame} className="btn btn-start">
                        ¡Comenzar!
                    </button>
                    {/* 💡 Muestra el mensaje de feedback (puntaje final/récord) aquí */}
                    {isGameEnded && <div className="game-over-message">{feedback.message}</div>}
                    <p className="best-score-display">Mejor Récord ({difficulty}): {bestScore}</p>
                </div>
            </div>
        );
    }

    // --- 2. Pantalla de Juego Activo (Actualizada) ---
    return (
        <div className="english-game-container active-game">
            
            {/* Encabezado con Tiempo Transcurrido y Puntaje */}
            <div className="game-header">
                <div className="timer-box">
                    ⏳ Tiempo Transcurrido: <span className="timer-value">{formatTime(timeElapsed)}</span>
                </div>
                <div className="score-box">
                    Puntaje: <span className="score-value">{score}</span> | Mejor: {bestScore}
                </div>
            </div>
            
            {/* Panel de Pregunta */}
            {currentQuestion && (
                <div className="question-panel">
                    <p className="difficulty-label">
                        Nivel: {difficulty} (+{initialScorePerAnswer} pts/palabra | +{lastMinuteScore} pts/min)
                    </p>
                    
                    <div className="question-display">
                        Traduce lo siguiente: <span className="word-to-translate">"{currentQuestion.q}"</span>
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

export default EnglishGame;