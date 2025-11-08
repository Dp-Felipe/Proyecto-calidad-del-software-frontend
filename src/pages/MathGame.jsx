import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MathGame.css';
// 💡 NUEVAS IMPORTACIONES: Funciones para guardar y cargar puntajes
import { saveNewHighScore, loadHighScores } from '../utils/scoreUtils'; 

// ===================================================================
//                 FUNCIONES Y LÓGICA DEL JUEGO (se mantienen)
// ===================================================================
// ... (generateOperation y formatTime se mantienen sin cambios) ...

const generateOperation = (difficulty) => {
    let maxNum = 0;
    let operators = [];

    switch (difficulty) {
        case 'Fácil':
            maxNum = 20;
            operators = ['+', '-'];
            break;
        case 'Medio':
            maxNum = 100;
            operators = ['+', '-', '*'];
            break;
        case 'Difícil':
        default:
            maxNum = 500;
            operators = ['+', '-', '*', '/'];
            break;
    }
    
    const getRandomNum = (max) => Math.floor(Math.random() * max) + 1;
    let num1 = getRandomNum(maxNum);
    let num2 = getRandomNum(maxNum);
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let operation;
    let answer;

    try {
        operation = `${num1} ${operator} ${num2}`;
        let result;
        switch (operator) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/': 
                if (difficulty !== 'Difícil') {
                    if (num1 % num2 !== 0) {
                        return generateOperation(difficulty);
                    }
                    result = num1 / num2;
                } else {
                    result = num1 / num2;
                }
                break;
            default: return generateOperation(difficulty);
        }
        answer = parseFloat(result.toFixed(2));
    } catch (e) {
        return generateOperation(difficulty);
    }
    
    return { operation, answer };
};

const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
};


// ===================================================================
// 💡 COMPONENTE PRINCIPAL
// ===================================================================

const MathGame = () => {
    // --- Configuración Inicial --
    const [difficulty, setDifficulty] = useState('Medio'); 
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);
    
    // --- ESTADOS DE PUNTUACIÓN Y TIEMPO ---
    const [score, setScore] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0); 
    const [bestScore, setBestScore] = useState(0); 
    
    // 💡 ESTADOS PARA LA LÓGICA DE PUNTUACIÓN POR TIEMPO
    const minutesPassedRef = useRef(0);
    const [lastMinuteScore, setLastMinuteScore] = useState(0); 
    const [initialScorePerAnswer, setInitialScorePerAnswer] = useState(0); 
    
    // --- Estados de la Pregunta ---
    const [currentOperation, setCurrentOperation] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState(''); 
    
    const answerInputRef = useRef(null);

    // FUNCIÓN PARA ESTABLECER LA PUNTUACIÓN BASE SEGÚN LA DIFICULTAD
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
    
    
    const loadNewOperation = useCallback(() => {
        const newOperation = generateOperation(difficulty);
        setCurrentOperation(newOperation);
        setUserAnswer('');
        setFeedbackMessage('');
        answerInputRef.current?.focus();
    }, [difficulty]); 

    const startGame = () => {
        setScore(0);
        minutesPassedRef.current = 0;
        setTimeElapsed(0); 
        setIsGameStarted(true);
        setIsGameEnded(false);
        setInitialConfig(difficulty); 
        loadNewOperation(); 
    };

    // 💡 LÓGICA DE FINALIZACIÓN Y GUARDADO DE PUNTUACIÓN (ACTUALIZADA)
    const resetGame = () => {
        const gameKey = 'MathGame';
        const finalScore = score;
        
        // 1. LLAMA A LA FUNCIÓN DE UTILIDAD para guardar y verificar si es récord
        const { isNewRecord, bestScore: updatedBestScore } = saveNewHighScore(gameKey, difficulty, finalScore);
        
        // 2. Establece el mensaje de finalización
        if (isNewRecord) {
            setFeedbackMessage(`¡Juego Terminado! 🚀 ¡NUEVO RÉCORD en ${difficulty}: ${finalScore} puntos!`);
        } else {
            setFeedbackMessage(`Juego Terminado. Tu puntaje final fue ${finalScore}. El récord de ${difficulty} sigue siendo ${updatedBestScore}.`);
        }
        
        // 3. Actualiza estados para terminar el juego y mostrar el resumen
        setBestScore(updatedBestScore); 
        setIsGameEnded(true); 
        setIsGameStarted(false);

        // 4. Limpia estados de juego activo
        setCurrentOperation(null);
        setUserAnswer('');
    };
    
    // Lógica para enviar la respuesta (se mantiene)
    const handleAnswerSubmit = (e) => {
        e.preventDefault();
        if (!currentOperation) return;
        
        const numericUserAnswer = parseFloat(userAnswer) || 0; 
        
        const correct = numericUserAnswer === currentOperation.answer;

        if (correct) {
            setScore(prevScore => prevScore + initialScorePerAnswer); 
            setFeedbackMessage(`¡Correcto! +${initialScorePerAnswer} puntos. ✅`);
            
            setTimeout(loadNewOperation, 500); 
        } else {
            setFeedbackMessage(`Incorrecto. La respuesta era ${currentOperation.answer}. ❌`);
            setTimeout(loadNewOperation, 1000);
        }
    };
    
    // -------------------------------------------------------------
    // EFECTO PRINCIPAL DEL TEMPORIZADOR (Se mantiene)
    // -------------------------------------------------------------
    useEffect(() => {
        if (!isGameStarted || isGameEnded) return;

        const timer = setInterval(() => {
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

        return () => clearInterval(timer);
    }, [isGameStarted, isGameEnded, lastMinuteScore]); 
    
    // 💡 LÓGICA DE CARGA INICIAL DEL MEJOR PUNTAJE (Mantenida y mejorada para recargar)
    useEffect(() => {
        const allScores = loadHighScores();
        const currentBest = (allScores['MathGame'] && allScores['MathGame'][difficulty]) || 0;
        setBestScore(currentBest);
    }, [difficulty, isGameStarted]); 

    // Función local para mostrar puntos en los botones
    const getDisplayPoints = (level) => {
        switch (level) {
            case 'Fácil': return { answer: 10, minute: 1 };
            case 'Medio': return { answer: 20, minute: 2 };
            case 'Difícil': return { answer: 30, minute: 3 };
            default: return { answer: 10, minute: 1 };
        }
    }

    // -------------------------------------------------------------
    // RENDERIZADO (ACTUALIZADO)
    // -------------------------------------------------------------
    
    if (!isGameStarted) {
        return (
            <div className="math-game-container setup-screen">
                <div className="config-box"> {/* Alineado con EnglishGame.jsx */}
                    <h1>🔢 Desafío de Cálculo Mental</h1> {/* Alineado con EnglishGame.jsx */}
                    
                    <label>Selecciona la Dificultad (Juego Continuo):</label>
                    <div className="difficulty-selector">
                        {['Fácil', 'Medio', 'Difícil'].map(level => {
                            const { answer, minute } = getDisplayPoints(level);
                            return (
                                <button
                                    key={level}
                                    /* Clases alineadas con EnglishGame.jsx */
                                    className={`btn ${difficulty === level ? 'btn-active' : 'btn-tertiary'}`}
                                    onClick={() => setDifficulty(level)}
                                >
                                    {level} 
                                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <button onClick={startGame} className="btn btn-start">
                        ¡Comenzar!
                    </button>
                    {/* Clases alineadas con EnglishGame.jsx */}
                    {isGameEnded && <div className="game-over-message">{feedbackMessage}</div>}
                    <p className="best-score-display">Mejor Récord ({difficulty}): {bestScore}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="math-game-container active-game">
            
            {/* Encabezado con Tiempo Transcurrido y Puntaje (Alineado con EnglishGame.jsx) */}
            <div className="game-header"> {/* game-status-bar renombrado a game-header */}
                <div className="timer-box">
                    ⏳ Tiempo Transcurrido: <span className="timer-value">{formatTime(timeElapsed)}</span>
                </div>
                <div className="score-box">
                    Puntaje: <span className="score-value">{score}</span> | Mejor: {bestScore}
                </div>
            </div>
            
            {/* Panel de Pregunta (Alineado con EnglishGame.jsx) */}
            <div className="question-panel">
                <p className="difficulty-label">
                    Nivel: {difficulty} (+{initialScorePerAnswer} pts/operación | +{lastMinuteScore} pts/min)
                </p>
                <div className="operation-display">
                    {currentOperation ? currentOperation.operation : 'Cargando...'} = ?
                </div>

                <form onSubmit={handleAnswerSubmit} className="answer-form">
                    <input
                        type="number"
                        ref={answerInputRef}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Tu respuesta aquí"
                        required
                        autoFocus
                        disabled={!currentOperation} 
                    />
                    <button type="submit" className="btn btn-submit" disabled={!currentOperation}>
                        Enviar
                    </button>
                </form>
                
                {feedbackMessage && <p className={`feedback ${feedbackMessage.includes('Correcto') ? 'correct' : 'incorrect'}`}>{feedbackMessage}</p>}
            </div>
            
            {/* Permite al usuario finalizar el juego en cualquier momento */}
            <button onClick={resetGame} className="btn btn-small btn-secondary reset-button">
                Finalizar Juego
            </button>
        </div>
    );
};

export default MathGame;