import React from 'react';
import './DayView.css'; 

const formatTime = (time) => time ? time.substring(0, 5) : '';

const DayView = ({ date, scheduledEvents, onPrevDay, onNextDay }) => {
    
    const dayKey = date.toISOString().split('T')[0]; 
    const events = scheduledEvents[dayKey] || [];
    
    console.log(`DayView: Buscando eventos para la clave [${dayKey}]. Encontrados: ${events.length}`);

    const displayHeader = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const todayKey = new Date().toISOString().split('T')[0];
    const isToday = dayKey === todayKey;

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    // SECCIÓN: LÓGICA DE EVENTOS (CORRECCIÓN APLICADA AQUÍ)
    const getEventsForSlot = (hour) => {
        const currentHour = parseInt(hour);
        
        return events.filter(event => {
            // ⭐ CORRECCIÓN RECOMENDADA: Validación para evitar 'split' en undefined/null
            if (!event.startTime || typeof event.startTime !== 'string') {
                return false;
            }
            
            const startHour = parseInt(event.startTime.split(':')[0]);
            
            // Segunda validación: si el parseo falló
            if (isNaN(startHour)) {
                 return false;
            }
            
            return startHour === currentHour;
        });
    };
    
    if (!scheduledEvents) {
        return <div className="day-view-container loading">Cargando eventos...</div>;
    }

    return (
        <div className="day-view-container">
            
            <div className="week-navigation-controls">
                <div className="date-display">
                    <h2 className="current-month-year">{displayHeader}</h2>
                    <button className="today-button">Today</button>
                    <div className="week-nav-arrows">
                        <button onClick={onPrevDay} className="arrow-button">&lt;</button>
                        <button onClick={onNextDay} className="arrow-button">&gt;</button>
                    </div>
                </div>
            </div>

            <div className="week-day-headers day-view-headers">
                <div className="time-header-spacer">GMT-05</div> 
                
                <div 
                    key={dayKey} 
                    className={`day-header ${isToday ? 'today-header' : ''}`}
                >
                    <span className="weekday-name">
                        {date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                    </span>
                    <span className="day-number">
                        {date.getDate()}
                    </span>
                </div>
            </div>
            <div className="day-hours-grid">
                
                {hours.map(hour => (
                    <React.Fragment key={hour}>
                        
                        <div className="time-label-day">
                            {hour === '00' ? '' : `${parseInt(hour) % 12 || 12} ${parseInt(hour) >= 12 ? 'PM' : 'AM'}`}
                        </div>
                        
                        <div className="day-slot-single">
                            {getEventsForSlot(hour).map(event => (
                                <div 
                                    key={event.id} 
                                    className="event-item-day"
                                    style={{ 
                                        backgroundColor: event.color, 
                                        borderColor: event.color,
                                        display: 'block', 
                                        marginBottom: '2px', 
                                        padding: '2px 5px', 
                                        borderRadius: '4px',
                                        color: 'white', 
                                        fontSize: '0.8em',
                                        lineHeight: '1.2',
                                        overflow: 'hidden', 
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis'
                                    }}
                                    title={`${event.name} (${formatTime(event.startTime)} - ${formatTime(event.endTime)})`}
                                >
                                    {event.name} ({formatTime(event.startTime)} - {formatTime(event.endTime)})
                                </div>
                            ))}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
export default DayView;