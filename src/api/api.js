// Archivo de Servicio (donde se definen las funciones getUniqueTasks, createScheduledEvent, etc.)

// ⭐⭐⭐ CAMBIOS CRÍTICOS APLICADOS AQUÍ ⭐⭐⭐
// 1. Usamos la sintaxis correcta para leer variables de entorno en proyectos Vite/Vercel.
const RENDER_BASE_URL = import.meta.env.VITE_API_URL;

// 2. Determina la URL base:
// Si VITE_API_URL existe (en Vercel), usa esa URL completa (ej: https://.../api).
// Si no existe (en desarrollo local), usa el fallback local estándar. 
const API_BASE_URL = RENDER_BASE_URL 
    ? RENDER_BASE_URL 
    : 'http://localhost:3000/api'; // Puerto local estandarizado (3000)

// -----------------------------------------------------------------------------------
// RESTO DEL CÓDIGO (No necesita cambios)
// -----------------------------------------------------------------------------------

const handleRequest = async (endpoint, options = {}) => {
    // La URL ahora solo concatena el endpoint (ej: /tasks) a la base (ej: https://.../api)
    const url = `${API_BASE_URL}${endpoint}`; 
    
    // NOTA: Tu AuthContext usa sessionStorage, pero aquí usas localStorage. 
    // Asegúrate de que el token realmente se guarde en localStorage para que esta línea funcione.
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
                // Posiblemente una lógica para limpiar el token si falla.
                console.error("Autenticación fallida o prohibida. Se requiere iniciar sesión de nuevo.");
            }
            
            throw new Error(errorBody.message || `Error HTTP ${response.status} en ${endpoint}`);
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : {};

    } catch (error) {
        // Error de red (como el "Failed to fetch" que vimos por el localhost)
        console.error(`Error al hacer la solicitud a ${url}:`, error);
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