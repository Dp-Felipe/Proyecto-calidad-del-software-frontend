import React, { useState, useEffect } from 'react';
import { loadHighScores, GAME_NAMES, GAME_KEYS } from '../utils/scoreUtils'; 
import { getUniqueTasks, getAllScheduledEvents } from '../api/api'; 
import './Inicio.css'; 

// SECCIÓN: CONSTANTES
const GAME_ICONS = {
    'math': '🧠',
    'trivia': '🌍',
    'english': '🇬🇧',
    'riddles': '💡',
};

const Inicio = () => {
    // SECCIÓN: ESTADOS
    const [highestScores, setHighestScores] = useState([]);
    const [uniquePendients, setUniquePendients] = useState([]); 
    const [scheduledEvents, setScheduledEvents] = useState({}); 
    const [isLoading, setIsLoading] = useState(true);

    // SECCIÓN: LÓGICA DE CARGA DE DATOS
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            let allScheduledList = [];

            try {
                // Cargar y Calcular Puntajes
                const allScores = loadHighScores();
                const calculatedScores = GAME_KEYS.map(gameKey => {
                    const scoresForGame = allScores[gameKey] || {};
                    const scoreValues = Object.values(scoresForGame);
                    const maxScore = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
                    
                    return {
                        id: gameKey,
                        name: GAME_NAMES[gameKey],
                        score: maxScore,
                    };
                });
                setHighestScores(calculatedScores);
                
                // Cargar Tareas y Eventos
                const eventsData = await getAllScheduledEvents(); 
                setScheduledEvents(eventsData); 
                
                // Aplanamos la estructura de eventos en una sola lista
                allScheduledList = Object.keys(eventsData)
                    .flatMap(dateKey => 
                        eventsData[dateKey].map(event => ({
                            id: event.id,
                            name: event.name,
                            date: dateKey,
                            startTime: event.startTime || '00:00',
                            endTime: event.endTime || '00:00' 
                        }))
                    );

                // Filtramos y ordenamos tareas futuras/pendientes
                const upcomingScheduledTasks = allScheduledList
                    
                    .sort((a, b) => {
                        if (a.date !== b.date) {
                            return a.date.localeCompare(b.date);
                        }
                        return a.startTime.localeCompare(b.startTime);
                    });

                setUniquePendients(upcomingScheduledTasks);
                
            } catch (error) {
                console.error("Error al cargar datos del dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []); 

    // SECCIÓN: UTILERÍAS PARA RENDERIZADO
    const getMonthName = (date) => {
        return date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    }
    
    const CalendarWidget = () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        
        const startDayOfWeek = firstDayOfMonth.getDay(); 
        const monthStartDay = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1; 

        const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']; 

        const calendarDays = [];
        for (let i = 0; i < monthStartDay; i++) {
            calendarDays.push(null); 
        }
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(i); 
        }

        return (
            <div className="simulated-calendar">
                <div className="calendar-header">
                    {weekDays.map(d => <span key={d} className="weekday">{d}</span>)}
                </div>
                <div className="calendar-grid">
                    {calendarDays.map((day, index) => {
                        const isToday = day && day === today.getDate() && firstDayOfMonth.getMonth() === today.getMonth();
                        
                        return (
                            <span 
                                key={index} 
                                className={`day ${isToday ? 'selected' : ''} ${!day ? 'empty' : ''}`}
                            >
                                {day}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    }
    
    // SECCIÓN: RENDERIZADO PRINCIPAL

    if (isLoading) {
        return (
            <div className="inicio-dashboard loading-state">
                <p>Cargando datos del dashboard...</p>
            </div>
        );
    }

    return (
        <div className="inicio-dashboard">
            
            {/* SECCIÓN: CALENDARIO Y TAREAS */}
            <div className="top-section">
                
                <div className="panel dashboard-calendar-widget">
                    <h2>{getMonthName(new Date())}</h2>
                    <CalendarWidget /> 
                </div>

                <div className="panel pendients-panel">
                    <h2>Tareas Programadas ({uniquePendients.length})</h2>
                    <ul className="pendients-list">
                        {uniquePendients.length > 0 ? (
                            uniquePendients.map(pendient => (
                                <li key={pendient.id} className="pendient-item">
                                    {pendient.name}- 
                                    <span className="pendient-time">  
                                            ({pendient.startTime} - {pendient.endTime})
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li className="pendient-item no-pendients">
                                ¡No hay tareas programadas! 🎉
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* SECCIÓN: PUNTAJES */}
            <div className="bottom-section">
                <div className="high-scores-grid">
                    {highestScores.map(game => (
                        <div key={game.id} className="score-card">
                            <span className="game-icon">{GAME_ICONS[game.id]}</span> 
                            <p className="game-name">{game.name}</p>
                            <div className="score-value">{game.score}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Inicio;