const RENDER_BASE_URL = process.env.REACT_APP_API_URL;

// Determina la URL base:
// Si existe REACT_APP_API_URL (es decir, en Vercel), usa esa URL y añade '/api'.
// Si no existe (estás en desarrollo local), usa tu localhost.
const API_BASE_URL = RENDER_BASE_URL 
    ? `${RENDER_BASE_URL}/api` 
    : 'http://localhost:5000/api'; // Asegúrate de que 5000 sea el puerto de tu Backend local

// -----------------------------------------------------------------------------------
// RESTO DEL CÓDIGO (No necesita cambios)
// -----------------------------------------------------------------------------------

const handleRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const token = localStorage.getItem('token'); 

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = {
        ...options,
        headers: headers,
    };

    try {
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
            
            if (response.status === 401 || response.status === 403) {
            }
            
            throw new Error(errorBody.message || `Error HTTP ${response.status} en ${endpoint}`);
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : {};

    } catch (error) {
        throw error;
    }
};

// =========================================================
// FUNCIONES para el SERVICIO DE CATÁLOGO (/api/tasks)
// =========================================================

export const getUniqueTasks = () => {
    return handleRequest('/tasks');
};

export const createOrGetUniqueTask = (taskData) => {
    return handleRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
    });
};

// =========================================================
// FUNCIONES para el SERVICIO DE EVENTOS (/api/events)
// =========================================================

export const getAllScheduledEvents = () => {
    return handleRequest('/events');
};
export const createScheduledEvent = (eventData) => {

    return handleRequest('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
    });
};

export const updateScheduledEvent = (id, eventData) => {
    return handleRequest(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
    });
};

export const deleteScheduledEvent = (id) => {
    return handleRequest(`/events/${id}`, {
        method: 'DELETE',
    });
};