
export const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const dayOfWeek = startOfWeek.getDay(); 
    
    // Calcula el Lunes de esa semana (o el Domingo, si prefieres que la semana empiece el Domingo)
    // Para empezar el Lunes: Ajustamos para que 0 (Domingo) sea -6 días
    // Si queremos que la semana empiece en Lunes (ISO 8601):
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    startOfWeek.setDate(diff); // Establece el día al inicio de la semana
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
    }
    return days;
};