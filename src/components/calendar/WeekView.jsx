import React from 'react';
import './WeekView.css';
import { getWeekDays } from '../../utils/calendarUtils';

const formatTime = (time) => time ? time.substring(0, 5) : '';

const WeekView = ({ date, scheduledEvents, onDayClick, onPrevWeek, onNextWeek }) => {
    
    // SECCIÓN: CÁLCULO DE FECHAS
    const weekDays = getWeekDays(date);
    const startOfWeek = weekDays[0];
    const displayHeader = `${startOfWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    const todayKey = new Date().toISOString().split('T')[0];

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

    // SECCIÓN: LÓGICA DE EVENTOS (CORRECCIÓN APLICADA AQUÍ)
    const getEventsForSlot = (day, hour) => {
        const dayKey = day.toISOString().split('T')[0];
        const events = scheduledEvents[dayKey] || [];
        
        return events.filter(event => {
            // ⭐ CORRECCIÓN CLAVE: Validación para evitar 'split' en undefined/null
            if (!event.startTime || !event.endTime || typeof event.startTime !== 'string' || typeof event.endTime !== 'string') {
                return false; // Ignora eventos con datos de hora incompletos o inválidos
            }

            const startHour = parseInt(event.startTime.split(':')[0]);
            const endHour = parseInt(event.endTime.split(':')[0]);
            const currentHour = parseInt(hour);
            
            // Segunda validación: si el parseo falló
            if (isNaN(startHour) || isNaN(endHour)) {
                 return false;
            }
            
            return startHour === currentHour || (startHour < currentHour && endHour > currentHour);
        });
    };
    
    if (!scheduledEvents) {
        return <div className="week-view-container loading">Cargando eventos semanales...</div>;
    }

    // SECCIÓN: RENDERIZADO DEL COMPONENTE
    return (
        <div className="week-view-container">
            <div className="week-navigation-controls">
                <div className="date-display">
                    <h2 className="current-month-year">{displayHeader}</h2>
                    <div className="week-nav-arrows">
                        <button onClick={onPrevWeek} className="arrow-button">&lt;</button>
                        <button onClick={onNextWeek} className="arrow-button">&gt;</button>
                    </div>
                </div>
            </div>

            <div className="week-day-headers">
                <div className="time-header-spacer">GMT-05</div>
                {weekDays.map(day => {
                    const dayKey = day.toISOString().split('T')[0];
                    const isToday = dayKey === todayKey;
                    
                    return (
                        <div key={dayKey} className={`day-header ${isToday ? 'today-header' : ''}`} onClick={() => onDayClick(day)}>
                            <span className="weekday-name">{day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}</span>
                            <span className="day-number">{day.getDate()}</span>
                        </div>
                    );
                })}
            </div>


            <div className="week-hours-grid">
                {hours.map(hour => (
                    <React.Fragment key={hour}>
                        
                        <div className="time-label">
                            {hour === '00' ? '' : `${parseInt(hour) % 12 || 12} ${parseInt(hour) >= 12 ? 'PM' : 'AM'}`}
                        </div>
                        
                        {weekDays.map(day => {
                            const events = getEventsForSlot(day, hour);
                            const dayKey = day.toISOString().split('T')[0];
                            const isToday = dayKey === todayKey;
                            
                            return (
                                <div 
                                    key={`${dayKey}-${hour}`} 
                                    className={`day-slot ${isToday ? 'today-slot' : ''}`}
                                    onClick={() => onDayClick(day)}
                                >
                                    {events.map(event => (
                                        <div 
                                            key={event.id} 
                                            className="event-item-week"
                                            style={{ backgroundColor: event.color, borderColor: event.color }}
                                            title={`${event.name} (${formatTime(event.startTime)} - ${formatTime(event.endTime)})`}
                                        >
                                            {event.name}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
export default WeekView;