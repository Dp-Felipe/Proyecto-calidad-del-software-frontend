import React, { useState, useEffect, useCallback } from 'react';
import './TaskList.css';
import { createOrGetUniqueTask, createScheduledEvent, updateScheduledEvent, deleteScheduledEvent } from '../../api/api'; 

const predefinedColors = [
    { name: 'Rojo', hex: '#ff0000ff' },
    { name: 'Azul', hex: '#008cffff' },
    { name: 'Verde', hex: '#00ff0dff' },
    { name: 'Amarillo', hex: '#ffc400ff' },
    { name: 'Púrpura', hex: '#d900ffff' },
    { name: 'Naranja', hex: '#ff9900ff' },
];


const TaskList = ({ selectedDate, scheduledEvents, setScheduledEvents, uniqueTasks, setUniqueTasks, isLoading }) => { 
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskColor, setNewTaskColor] = useState(predefinedColors[0].hex);
    const [taskDate, setTaskDate] = useState(selectedDate.toISOString().split('T')[0]); 
    const [startTime, setStartTime] = useState('09:00'); 
    const [endTime, setEndTime] = useState('10:00'); 
    const [selectedUniqueTaskName, setSelectedUniqueTaskName] = useState(''); 
    const dateKey = selectedDate.toISOString().split('T')[0];
    const dailyTasks = scheduledEvents?.[dateKey] || [];


    useEffect(() => {

        if (!isEditMode) {
            setTaskDate(selectedDate.toISOString().split('T')[0]);
        }
    }, [selectedDate, isEditMode]);

    const handleTaskSelection = (name) => {
        setSelectedUniqueTaskName(name);
        setNewTaskName(name);
        if (name) {
            const selectedTask = (uniqueTasks || []).find(t => t.name === name); // Protección adicional aquí
            if (selectedTask) {
                setNewTaskColor(selectedTask.color);
            }
        }
    };

    const openModalForEdit = (task) => {
        setTaskToEdit(task);
        setIsEditMode(true);
        setIsModalOpen(true);
        setNewTaskName(task.name);
        setSelectedUniqueTaskName(task.name);
        setNewTaskColor(task.color);
        setTaskDate(task.date);
        setStartTime(task.startTime);
        setEndTime(task.endTime);
    };

    const handleDeleteTask = async (taskId, date) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta tarea programada?")) return;

        try {

            await deleteScheduledEvent(taskId); 
            setScheduledEvents(prevEvents => {
                const dateKey = date.toISOString().split('T')[0];
                const updatedEvents = (prevEvents[dateKey] || []).filter(task => task.id !== taskId);
                
                if (updatedEvents.length === 0) {
                    const { [dateKey]: _, ...rest } = prevEvents;
                    return rest;
                }
                
                return {
                    ...prevEvents,
                    [dateKey]: updatedEvents,
                };
            });
            alert("Tarea eliminada correctamente.");
        } catch (error) {
            console.error("Fallo al eliminar el evento:", error.message);
            alert(`No se pudo eliminar la tarea. Detalle: ${error.message}`);
        }
    };


    const handleSaveTask = async (e) => {
        e.preventDefault();
        
        if (!newTaskName.trim() || !taskDate) return; 


        const eventDataToSend = {
            name: newTaskName.trim(),
            color: newTaskColor,
            date: taskDate,
            startTime: startTime,
            endTime: endTime
        };
        
        try {
            let savedEvent;
            
            if (isEditMode) {
                
                
                const taskData = { name: newTaskName.trim(), color: newTaskColor };
                const savedUniqueTask = await createOrGetUniqueTask(taskData);
                
                const updatedEventData = {
                    ...eventDataToSend,
                    id: taskToEdit.id,
                    uniqueTaskId: savedUniqueTask.id, 
                };
                savedEvent = await updateScheduledEvent(taskToEdit.id, updatedEventData);

                // 3. Actualizar frontend
                setScheduledEvents(prevEvents => {
                    const oldDateKey = taskToEdit.date;
                    const newDateKey = taskDate;

                    const newEventsState = { ...prevEvents };

                    if (oldDateKey !== newDateKey) {
                        newEventsState[oldDateKey] = (newEventsState[oldDateKey] || []).filter(e => e.id !== taskToEdit.id);
                        if (newEventsState[oldDateKey].length === 0) delete newEventsState[oldDateKey];
                    }

                    const eventsForNewDate = (newEventsState[newDateKey] || []).filter(e => e.id !== taskToEdit.id);
                    newEventsState[newDateKey] = [...eventsForNewDate, savedEvent];
                    
                    return newEventsState;
                });
                alert("Evento actualizado correctamente.");

            } else {
                // --- MODO CREACIÓN (Lógica original) ---
                const taskData = { name: newTaskName.trim(), color: newTaskColor };
                const savedUniqueTask = await createOrGetUniqueTask(taskData);
                
                // Actualizar catálogo si es nuevo
                const isNew = !(uniqueTasks || []).find(t => t.name.toLowerCase() === savedUniqueTask.name.toLowerCase()); // Protección
                if (isNew) {
                    setUniqueTasks(prevTasks => [...(prevTasks || []), savedUniqueTask]); // Protección
                }
                
                const eventDataToCreate = {
                    ...eventDataToSend,
                    uniqueTaskId: savedUniqueTask.id, 
                };
                
                savedEvent = await createScheduledEvent(eventDataToCreate);
                
                setScheduledEvents(prevEvents => {
                    const eventsForDate = prevEvents[taskDate] || [];
                    return {
                        ...prevEvents,
                        [taskDate]: [...eventsForDate, savedEvent] 
                    };
                });
                alert("Evento programado correctamente.");
            }
            
        } catch (error) {
            console.error("Fallo al guardar el evento:", error.message);
            alert(`No se pudo guardar la tarea. Detalle: ${error.message}`);
        }

        // 4. Limpiar y cerrar
        setNewTaskName('');
        setSelectedUniqueTaskName('');
        setStartTime('09:00'); 
        setEndTime('10:00'); 
        setTaskToEdit(null); 
        setIsEditMode(false); 
        setIsModalOpen(false);
    };


    const displayDate = selectedDate 
        ? selectedDate.toLocaleDateString('es-ES', { 
              weekday: 'long', day: 'numeric', month: 'long' 
          })
        : 'Selecciona un día en el calendario';

    if (isLoading) {
        return <div className="task-list-panel loading">Cargando tareas y catálogo...</div>;
    }

    return (
        <div className="task-list-panel">
            <div className="task-panel-header">
                <h3>Tareas para el {displayDate}</h3>
                
                <button 
                    className="add-task-button"
                    onClick={() => {
                        setTaskDate(selectedDate.toISOString().split('T')[0]); 
                        setNewTaskName(''); 
                        setSelectedUniqueTaskName(''); 
                        setTaskToEdit(null); 
                        setIsEditMode(false); 
                        setIsModalOpen(true);
                    }}
                    title="Programar Nueva Tarea"
                >
                    +
                </button>
            </div>
            
            {/* Lista de tareas diarias */}
            <ul className="task-list">
                {dailyTasks
                    .sort((a, b) => (a.startTime > b.startTime ? 1 : -1))
                    .map(task => (
                        <li 
                            key={task.id} 
                            className={`task-item ${task.completed ? 'completed' : ''}`}
                            style={{ borderLeft: `6px solid ${task.color}` }} 
                        >
                            <input type="checkbox" checked={task.completed} readOnly />
                            <span>{task.name}</span>
                            
                            <div className="task-details">
                                <span className="task-time">{task.startTime} - {task.endTime}</span>
                                
                                <div className="task-actions">
                                    <button 
                                        className="edit-task-button" 
                                        onClick={() => openModalForEdit(task)}
                                        title="Editar Tarea"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        className="delete-task-button" 
                                        onClick={() => handleDeleteTask(task.id, selectedDate)}
                                        title="Eliminar Tarea"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                {dailyTasks.length === 0 && (
                    <p className="no-tasks-message">No hay tareas programadas para este día.</p>
                )}
            </ul>

            {/* --------------------- MODAL EMERGENTE --------------------- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* 💡 Título dinámico */}
                        <h4>{isEditMode ? 'Editar Evento Programado' : 'Programar Nueva Tarea'}</h4>
                        <form onSubmit={handleSaveTask}>
                            
                            {/* SELECTOR DE TAREAS EXISTENTES */}
                            <div className="form-group task-select-group">
                                <label>Elegir o crear nueva tarea:</label>
                                <select 
                                    value={selectedUniqueTaskName} 
                                    onChange={(e) => handleTaskSelection(e.target.value)}
                                    className="task-catalog-select"
                                >
                                    <option value="">-- Crear Nueva Tarea --</option>
                                    {/* ⭐ CORRECCIÓN CLAVE: Protección contra 'uniqueTasks' no siendo un array */}
                                    {(uniqueTasks || []).map(task => ( 
                                        <option 
                                            key={task.id} 
                                            value={task.name}
                                        >
                                            {task.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Nombre de la tarea:</label>
                                <input 
                                    type="text" 
                                    value={newTaskName} 
                                    onChange={(e) => {
                                        setNewTaskName(e.target.value);
                                        setSelectedUniqueTaskName(e.target.value); 
                                    }}
                                    placeholder="Ej: Estudiar React" 
                                    required
                                />
                            </div>

                            {/* Selector de Color */}
                            <div className="form-group">
                                <label>Color de la tarea:</label>
                                <div className="color-selector">
                                    {predefinedColors.map(color => (
                                        <div
                                            key={color.name}
                                            className={`color-option ${newTaskColor === color.hex ? 'selected' : ''}`}
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => setNewTaskColor(color.hex)}
                                            title={color.name}
                                        >
                                            {newTaskColor === color.hex && '✓'}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Fecha del evento:</label>
                                <input
                                    type="date"
                                    value={taskDate}
                                    onChange={(e) => setTaskDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Rango de hora:</label>
                                <div className="time-range-selector">
                                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required/>
                                    <span>-</span>
                                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required/>
                                </div>
                            </div>


                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save">
                                    {/* 💡 Texto dinámico */}
                                    {isEditMode ? 'Actualizar Evento' : 'Guardar Evento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskList;