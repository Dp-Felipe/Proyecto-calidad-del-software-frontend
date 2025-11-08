import React, { useState, useEffect } from 'react';
import './Calendario.css';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView'; 
import DayView from '../components/calendar/DayView'; 
import TaskList from '../components/calendar/TaskList.jsx';
import { getUniqueTasks, getAllScheduledEvents } from '../api/api'; 


const Calendario = () => {
    // SECCIÓN: ESTADOS
    const [viewMode, setViewMode] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const [isTaskListVisible, setIsTaskListVisible] = useState(false); 

    const [scheduledEvents, setScheduledEvents] = useState({});
    const [uniqueTasks, setUniqueTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // SECCIÓN: LÓGICA DE CARGA DE DATOS
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const tasksData = await getUniqueTasks(); 
                setUniqueTasks(tasksData);
                const eventsData = await getAllScheduledEvents(); 
                setScheduledEvents(eventsData);
            } catch (error) {
                console.error("Error al cargar datos del servidor:", error);
                alert(`Fallo al cargar la aplicación. Asegúrate de que el servidor esté activo. Detalle: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []); 

    // SECCIÓN: MANEJADORES DE NAVEGACIÓN
    const handleMonthChange = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };
    
    const handleWeekChange = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };
    
    const handleDayChange = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    const handleDayClick = (day) => { 
        if (day) {
            setSelectedDate(day);
            setIsTaskListVisible(true);
        }
    }
    
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setIsTaskListVisible(false); 
    }

    // SECCIÓN: LÓGICA DE RENDERIZADO DE VISTA
    const renderCalendarView = () => {
        if (isLoading) {
            return <div className="loading-message">Cargando calendario...</div>;
        }
        
        switch(viewMode) {
            case 'day':
                return (
                    <DayView 
                        date={currentDate}
                        scheduledEvents={scheduledEvents} 
                        onPrevDay={() => handleDayChange(-1)}
                        onNextDay={() => handleDayChange(1)}
                    />
                );
            case 'week':
                return (
                    <WeekView 
                        date={currentDate}
                        scheduledEvents={scheduledEvents} 
                        onDayClick={handleDayClick}      
                        onPrevWeek={() => handleWeekChange(-1)} 
                        onNextWeek={() => handleWeekChange(1)}  
                    />
                );
            case 'month':    
            default:
                return (
                    <MonthView 
                        date={currentDate} 
                        onDayClick={handleDayClick}
                        scheduledEvents={scheduledEvents} 
                        onPrevMonth={() => handleMonthChange(-1)}
                        onNextMonth={() => handleMonthChange(1)}
                    />
                );
        }
    };

    // SECCIÓN: RENDERIZADO PRINCIPAL
    return (
        <div>
            <main className={`calendar-page-layout ${isTaskListVisible ? 'tasks-visible' : ''}`}>

                <div className="calendar-panel"> 
                    <div className="view-selector"> 
                        <button className={viewMode === 'day' ? 'active' : ''} onClick={() => handleViewModeChange('day')}>Día</button>
                        <button className={viewMode === 'week' ? 'active' : ''} onClick={() => handleViewModeChange('week')}>Semana</button>
                        <button className={viewMode === 'month' ? 'active' : ''} onClick={() => handleViewModeChange('month')}>Mes</button>
                    </div>
                    
                    <div className="calendar-view-content">
                        {renderCalendarView()} 
                    </div>
                </div>
                
                {isTaskListVisible && (
                    <div className="tasks-panel">
                        <div className="tasks-panel-close">
                            <h4>Detalle de Tareas</h4>
                            <button onClick={() => setIsTaskListVisible(false)}>✕</button>
                        </div>
                        <TaskList 
                            selectedDate={selectedDate} 
                            scheduledEvents={scheduledEvents} 
                            setScheduledEvents={setScheduledEvents} 
                            uniqueTasks={uniqueTasks} 
                            setUniqueTasks={setUniqueTasks} 
                            isLoading={isLoading}
                        /> 
                    </div>
                )}

            </main>
        </div>
    );
};

export default Calendario;