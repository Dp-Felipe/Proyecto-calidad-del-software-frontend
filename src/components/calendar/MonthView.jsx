import React from 'react';
import './MonthView.css'; 

// SECCIÓN: LÓGICA DE DÍAS DEL MES
const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date().toDateString();

    const firstDayOfMonth = new Date(year, month, 1);
    
    // Calcula el día de la semana para el primer día del mes (0=Dom, 1=Lun, ..., 6=Sáb)
    const firstWeekDayIndex = firstDayOfMonth.getDay(); 
    
    // Si la semana debe empezar en Lunes (1), convertimos 0 (Domingo) a 7.
    // El offset es la cantidad de días de relleno necesarios.
    // getDay(): 0=Dom, 1=Lun, 2=Mar, etc.
    // Queremos que Lun (1) tenga 0 offset, Mar (2) tenga 1, Dom (0) tenga 6.
    const startOffset = firstWeekDayIndex === 0 ? 6 : firstWeekDayIndex - 1; 
    
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days = [];
    
    // Días del mes anterior (Relleno inicial)
    for (let i = startOffset; i > 0; i--) {
        const prevDate = new Date(year, month - 1, lastDayOfPrevMonth - i + 1);
        days.push({ 
            date: prevDate, 
            isCurrentMonth: false,
            dateKey: prevDate.toISOString().split('T')[0]
        });
    }

    // Días del mes actual
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const currDate = new Date(year, month, i);
        days.push({ 
            date: currDate, 
            isCurrentMonth: true,
            isToday: currDate.toDateString() === today,
            dateKey: currDate.toISOString().split('T')[0]
        });
    }

    // Días del mes siguiente (Relleno final)
    const daysNeeded = (7 - days.length % 7) % 7;
    for (let i = 1; i <= daysNeeded; i++) {
        const nextDate = new Date(year, month + 1, i);
        days.push({ 
            date: nextDate, 
            isCurrentMonth: false,
            dateKey: nextDate.toISOString().split('T')[0]
        });
    }

    return days;
};

// SECCIÓN: COMPONENTE MONTHVIEW
const MonthView = ({ date, onDayClick, scheduledEvents, onPrevMonth, onNextMonth }) => {
    const days = getDaysInMonth(date);
    // CRÍTICO: Los días de la semana deben estar en el orden correcto
    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div className="month-calendar-container">
            
            {/* SECCIÓN: NAVEGACIÓN Y PANTALLA DE FECHA */}
            <div className="week-navigation-controls">
                <div className="date-display">
                    <h2 className="current-month-year">{monthName}</h2>
                    <button className="today-button">Today</button>
                    <div className="week-nav-arrows">
                        <button onClick={onPrevMonth} className="arrow-button">&lt;</button>
                        <button onClick={onNextMonth} className="arrow-button">&gt;</button>
                    </div>
                </div>
            </div>

            {/* SECCIÓN: ENCABEZADOS DE DÍA */}
            <div className="week-day-headers month-view-day-headers">
                
                {weekDays.map(day => (
                    <div 
                        key={day} 
                        className="day-header month-header-card" 
                        style={{ cursor: 'default' }} 
                    >
                        <span className="weekday-name">
                            {/* Mostrar las tres primeras letras en mayúsculas (LUN, MAR, etc.) */}
                            {day.substring(0, 3).toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>
            
            {/* SECCIÓN: CUERPO DE LA GRILLA DEL CALENDARIO */}
            <div className="month-view"> 
                
                {days.map((dayObj, index) => {
                    const { date, isCurrentMonth, dateKey, isToday } = dayObj;
                    const dailyEvents = scheduledEvents[dateKey] || [];
                    
                    const cellClasses = [
                        'day-cell',
                        !isCurrentMonth ? 'other-month' : '',
                        isToday ? 'today' : '' 
                    ].join(' ');

                    return (
                        <div
                            key={index}
                            className={cellClasses}
                            onClick={() => isCurrentMonth && onDayClick(date)}
                        >
                            <span className="day-number">{date.getDate()}</span>
                            
                            {/* Renderizar los eventos */}
                            <div className="event-list">
                                {dailyEvents.map(event => (
                                    <div 
                                        key={event.id}
                                        className={`event-item ${event.type || ''}`}
                                        style={{ backgroundColor: event.color }} 
                                        title={`${event.name} (${event.startTime})`}
                                    >
                                        {event.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;