import React, { useState, useEffect, useRef, useCallback } from 'react';
import './RiddlesGame.css'; 
import { RIDDLES_QUESTIONS } from '../data/riddlesData'; 
// 💡 NUEVAS IMPORTACIONES: Funciones para guardar y cargar puntajes
import { saveNewHighScore, loadHighScores } from '../utils/scoreUtils'; 

// ===================================================================
// 💡 LÓGICA DE PREGUNTAS (Se mantiene)
// ===================================================================

const riddles = RIDDLES_QUESTIONS;

const getRandomRiddle = (difficulty) => {
    const list = riddles[difficulty] || riddles['Fácil']; 
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
};

// ===================================================================
// 💡 COMPONENTE PRINCIPAL (Modificado)
// ===================================================================

const RiddlesGame = () => {
    // --- Configuración Inicial y Estados del Juego ---
    const [difficulty, setDifficulty] = useState('Medio');
    // ELIMINADO: const [gameDuration, setGameDuration] = useState(10); 
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);
    
    // --- Estados del Juego ---
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    
    // CAMBIADO: Reemplazamos timeLeft por timeElapsed (juego infinito)
    const [timeElapsed, setTimeElapsed] = useState(0); 
    
    // 💡 ESTADOS PARA LA LÓGICA DE PUNTUACIÓN POR TIEMPO (COPIADO DE MATHGAME)
    const minutesPassedRef = useRef(0); // Referencia para el bonus por minuto
    const [lastMinuteScore, setLastMinuteScore] = useState(0); // Puntos por minuto
    const [initialScorePerAnswer, setInitialScorePerAnswer] = useState(0); // Puntos por respuesta
    
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null); 
    
    // --- Temporizadores y Récord ---
    const gameTimerRef = useRef(null);
    const feedbackTimerRef = useRef(null);
    
    const [bestScore, setBestScore] = useState(0); // Se carga con useEffect

    // FUNCIÓN PARA ESTABLECER LA PUNTUACIÓN BASE (Adaptada para Acertijos)
    const setInitialConfig = useCallback((level) => {
        let minutePoints = 0;
        let answerPoints = 0;

        // 💡 PUNTAJES MÁS ALTOS PARA ACERTIJOS
        switch (level) {
            case 'Fácil':
                minutePoints = 1;
                answerPoints = 20; 
                break;
            case 'Medio': 
                minutePoints = 2;
                answerPoints = 40;
                break;
            case 'Difícil':
            default:
                minutePoints = 3;
                answerPoints = 60;
                break;
        }
        setLastMinuteScore(minutePoints);
        setInitialScorePerAnswer(answerPoints);
    }, []);


    const startNewQuestion = useCallback(() => {
        if (feedbackTimerRef.current) {
            clearTimeout(feedbackTimerRef.current);
        }

        const newQ = getRandomRiddle(difficulty);
        setCurrentQuestion(newQ);
        setSelectedAnswer(null);
        setFeedback(null);
    }, [difficulty]);
    
    const startGame = () => {
        // Inicialización de estados para el juego infinito
        setTimeElapsed(0); 
        minutesPassedRef.current = 0; 
        
        setScore(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setIsGameEnded(false);
        setIsGameStarted(true);
        
        setInitialConfig(difficulty); // Configura los puntos
        startNewQuestion();
    };
    
    // 💡 LÓGICA DE FINALIZACIÓN Y GUARDADO DE PUNTUACIÓN (ACTUALIZADA)
    const resetGame = () => {
        const gameKey = 'RiddlesGame'; // Clave para este juego
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

    // Función para volver a la pantalla de configuración (si se presiona "Cambiar Configuración")
    const backToSetup = () => {
        setIsGameStarted(false);
        setIsGameEnded(false);
        setCurrentQuestion(null);
        setFeedback(null);
    };

    const handleAnswerSelect = (option) => {
        if (!isGameStarted || isGameEnded || selectedAnswer) return;
        
        setSelectedAnswer(option);

        const correct = option === currentQuestion.a;
        const points = initialScorePerAnswer; 

        if (correct) {
            setScore(prev => prev + points);
            setCorrectCount(prev => prev + 1);
            setFeedback({ type: 'correct', message: `¡Respuesta Correcta! ✅ +${points} puntos.` });
        } else {
            setIncorrectCount(prev => prev + 1);
            setFeedback({ type: 'incorrect', message: `Incorrecto. La respuesta era: ${currentQuestion.a} ❌` });
        }
        
        feedbackTimerRef.current = setTimeout(startNewQuestion, 1500); 
    };

    // --- Efectos: Temporizador y Guardado de Puntaje ---
    useEffect(() => {
        if (!isGameStarted || isGameEnded) {
            clearInterval(gameTimerRef.current);
            return;
        }

        // MODIFICADO: Contador que AUMENTA (endless game)
        gameTimerRef.current = setInterval(() => {
            setTimeElapsed(prevTime => {
                const newTime = prevTime + 1; 
                const currentMinutesPassed = Math.floor(newTime / 60);

                // LÓGICA DE PUNTOS POR MINUTO (copiada de MathGame.jsx)
                if (currentMinutesPassed > minutesPassedRef.current) { 
                    setScore(prevScore => prevScore + lastMinuteScore);
                    minutesPassedRef.current = currentMinutesPassed; 
                }
                
                return newTime;
            });
        }, 1000);
        
        return () => clearInterval(gameTimerRef.current);
    }, [isGameStarted, isGameEnded, lastMinuteScore]); 

    // Carga del Mejor Récord por dificultad
    useEffect(() => {
        const allScores = loadHighScores();
        const currentBest = (allScores['RiddlesGame'] && allScores['RiddlesGame'][difficulty]) || 0;
        setBestScore(currentBest);
    }, [difficulty, isGameStarted]); // Recarga si cambia la dificultad O si vuelve a la pantalla de inicio

    // 💡 ELIMINADO: El useEffect que guardaba el puntaje (ahora lo hace resetGame)

    // --- Utilidad de Formato de Tiempo (Se mantiene) ---
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };


    // ===================================================================
    // RENDERIZADO
    // ===================================================================

    // --- 1. Pantalla de Fin de Juego ---
    if (isGameEnded) {
        const totalQuestions = correctCount + incorrectCount;
        return (
            <div className="riddles-game-container end-screen">
                <div className="game-over-box">
                    <h1>¡Juego Finalizado! 🛑</h1> 
                    <p className="final-score-text">Puntaje Final: <span>{score}</span></p>
                    <p>Tiempo de Juego: {formatTime(timeElapsed)}</p>
                    <p>Total de Acertijos: {totalQuestions}</p>
                    <p>Aciertos: {correctCount} | Errores: {incorrectCount}</p>
                    {/* Muestra si el puntaje actual es el mejor (el estado ya se actualizó) */}
                    {score === bestScore && score > 0 && <p className="new-record">¡NUEVO RÉCORD! 🏆</p>} 
                    <p>Mejor Récord en {difficulty}: {bestScore}</p>
                    <div className="end-buttons">
                        <button onClick={startGame} className="btn btn-primary">Jugar de Nuevo</button> 
                        <button onClick={backToSetup} className="btn btn-secondary">Cambiar Configuración</button> 
                    </div>
                </div>
            </div>
        );
    }
    
    // --- 2. Pantalla de Configuración (Inicio) ---
    if (!isGameStarted) {
        // Función anónima para obtener los puntos de la dificultad seleccionada
        const { answerPoints, minutePoints } = (()=>{
             let mp = 0; let ap = 0;
             switch (difficulty) {
                case 'Fácil': mp = 1; ap = 20; break;
                case 'Medio': mp = 2; ap = 40; break;
                case 'Difícil': mp = 3; ap = 60; break;
                default: mp = 2; ap = 40;
             }
             return { answerPoints: ap, minutePoints: mp };
        })();
        
        return (
            <div className="riddles-game-container setup-screen">
                <div className="config-box">
                    <h1>🧠 Desafío de Acertijos y Lógica (Modo Infinito)</h1>
                    
                    {/* Selector de Dificultad */}
                    <label>Seleccionar Dificultad:</label>
                    <p className='points-info'>
                        Ganas <span style={{fontWeight: 'bold'}}>+{answerPoints} pts</span> por acierto y <span style={{fontWeight: 'bold'}}>+{minutePoints} pts</span> de bonificación por minuto.
                    </p>
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
                    {/* Muestra el mensaje de feedback (puntaje final/récord) aquí */}
                    {feedback && <div className="game-over-message">{feedback.message}</div>}
                    <p className="best-score-display">Mejor Récord en {difficulty}: {bestScore}</p>
                </div>
            </div>
        );
    }

    // --- 3. Pantalla de Juego Activo ---
    return (
        <div className="riddles-game-container active-game">
            
            {/* Encabezado con Tiempo y Puntaje */}
            <div className="game-header">
                <div className="timer-box">
                    {/* CAMBIADO: Muestra el tiempo transcurrido */}
                    ⏱️ Tiempo transcurrido: <span className="timer-value">{formatTime(timeElapsed)}</span> 
                </div>
                <div className="score-box">
                    Puntaje: <span className="score-value">{score}</span> | Mejor: {bestScore}
                </div>
            </div>
            
            {/* Panel de Pregunta */}
            {currentQuestion && (
                <div className="question-panel">
                    {/* MODIFICADO: Muestra la info de puntos por minuto/respuesta */}
                    <p className="difficulty-label">Nivel: {difficulty} (+{initialScorePerAnswer} pts / acierto, +{lastMinuteScore} pts / min)</p> 
                    
                    <div className="question-display riddle-text">
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

export default RiddlesGame;