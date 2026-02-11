/**
 * Servicio para interactuar con Supabase
 * Maneja todas las operaciones CRUD para los invitados de la boda
 */

class SupabaseService {
    constructor() {
        // Inicializar cliente de Supabase
        if (typeof supabase !== 'undefined') {
            this.client = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
        } else {
            console.error('Supabase client no está disponible. Asegúrate de incluir el script de Supabase.');
            this.client = null;
        }
    }

    /**
     * Agregar un nuevo invitado
     * @param {Object} guestData - Datos del invitado { name, attendance }
     * @returns {Promise<Object>} - Datos del invitado guardado
     */
    async addGuest(guestData) {
        if (!this.client) {
            throw new Error('Cliente de Supabase no inicializado');
        }

        try {
            const { data, error } = await this.client
                .from('wedding_guests')
                .insert([
                    {
                        name: guestData.name,
                        attendance: guestData.attendance
                    }
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                id: data.id,
                name: data.name,
                attendance: data.attendance,
                timestamp: new Date(data.created_at).toLocaleString('es-MX')
            };
        } catch (error) {
            console.error('Error al agregar invitado:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los invitados
     * @returns {Promise<Array>} - Lista de todos los invitados
     */
    async getAllGuests() {
        if (!this.client) {
            throw new Error('Cliente de Supabase no inicializado');
        }

        try {
            const { data, error } = await this.client
                .from('wedding_guests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Transformar datos al formato esperado
            return data.map(guest => ({
                id: guest.id,
                name: guest.name,
                attendance: guest.attendance,
                timestamp: new Date(guest.created_at).toLocaleString('es-MX')
            }));
        } catch (error) {
            console.error('Error al obtener invitados:', error);
            throw error;
        }
    }

    /**
     * Obtener invitados confirmados
     * @returns {Promise<Array>} - Lista de invitados que confirmaron asistencia
     */
    async getConfirmedGuests() {
        if (!this.client) {
            throw new Error('Cliente de Supabase no inicializado');
        }

        try {
            const { data, error } = await this.client
                .from('wedding_guests')
                .select('*')
                .eq('attendance', 'yes')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data.map(guest => ({
                id: guest.id,
                name: guest.name,
                attendance: guest.attendance,
                timestamp: new Date(guest.created_at).toLocaleString('es-MX')
            }));
        } catch (error) {
            console.error('Error al obtener invitados confirmados:', error);
            throw error;
        }
    }

    /**
     * Actualizar un invitado existente
     * @param {number} id - ID del invitado
     * @param {Object} guestData - Nuevos datos { name, attendance }
     * @returns {Promise<Object>} - Datos actualizados del invitado
     */
    async updateGuest(id, guestData) {
        if (!this.client) {
            throw new Error('Cliente de Supabase no inicializado');
        }

        try {
            const { data, error } = await this.client
                .from('wedding_guests')
                .update({
                    name: guestData.name,
                    attendance: guestData.attendance
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                id: data.id,
                name: data.name,
                attendance: data.attendance,
                timestamp: new Date(data.updated_at).toLocaleString('es-MX')
            };
        } catch (error) {
            console.error('Error al actualizar invitado:', error);
            throw error;
        }
    }

    /**
     * Eliminar un invitado
     * @param {number} id - ID del invitado a eliminar
     * @returns {Promise<boolean>} - true si se eliminó correctamente
     */
    async deleteGuest(id) {
        if (!this.client) {
            throw new Error('Cliente de Supabase no inicializado');
        }

        try {
            const { error } = await this.client
                .from('wedding_guests')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error al eliminar invitado:', error);
            throw error;
        }
    }

    /**
     * Contar invitados confirmados
     * @returns {Promise<number>} - Número de invitados confirmados
     */
    async getConfirmedCount() {
        if (!this.client) {
            throw new Error('Cliente de Supabase no inicializado');
        }

        try {
            const { count, error } = await this.client
                .from('wedding_guests')
                .select('*', { count: 'exact', head: true })
                .eq('attendance', 'yes');

            if (error) {
                throw error;
            }

            return count || 0;
        } catch (error) {
            console.error('Error al contar invitados confirmados:', error);
            throw error;
        }
    }
}

// Crear instancia global del servicio
let supabaseService = null;

// Inicializar servicio cuando esté listo
function initSupabaseService() {
    if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        supabaseService = new SupabaseService();
        console.log('✅ Servicio de Supabase inicializado');
        return true;
    } else {
        console.warn('⚠️ Supabase no está disponible. Usando localStorage como respaldo.');
        return false;
    }
}
