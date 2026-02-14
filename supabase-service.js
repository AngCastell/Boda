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
            // Si no asistirá, cantidad_acompañante = 0, de lo contrario = 2
            const cantidadAcompañante = guestData.attendance === 'no' ? 0 : 2;
            
            const { data, error } = await this.client
                .from('wedding_guests')
                .insert([
                    {
                        name: guestData.name,
                        attendance: guestData.attendance,
                        cantidad_acompañante: cantidadAcompañante
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
                cantidad_acompañante: data.cantidad_acompañante ?? 2,
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
                cantidad_acompañante: guest.cantidad_acompañante ?? 2,
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
                cantidad_acompañante: guest.cantidad_acompañante ?? 2,
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
                cantidad_acompañante: data.cantidad_acompañante ?? 2,
                timestamp: new Date(data.updated_at).toLocaleString('es-MX')
            };
        } catch (error) {
            console.error('Error al actualizar invitado:', error);
            throw error;
        }
    }

    /**
     * Buscar invitado por nombre completo
     * @param {string} name - Nombre completo del invitado
     * @returns {Promise<Object|null>} - Datos del invitado encontrado o null
     */
    async findGuestByName(name) {
        if (!this.client) {
            throw new Error('Cliente de Supabase no inicializado');
        }

        try {
            const searchName = name.trim();
            
            // Primero intentar búsqueda exacta (case-insensitive)
            let { data, error } = await this.client
                .from('wedding_guests')
                .select('*')
                .ilike('name', searchName)
                .limit(1)
                .maybeSingle();

            // Si no se encuentra con búsqueda exacta, intentar búsqueda parcial
            if (!data && error && error.code === 'PGRST116') {
                const { data: partialData, error: partialError } = await this.client
                    .from('wedding_guests')
                    .select('*')
                    .ilike('name', `%${searchName}%`)
                    .limit(1)
                    .maybeSingle();
                
                if (partialData) {
                    data = partialData;
                    error = null;
                } else if (partialError && partialError.code !== 'PGRST116') {
                    throw partialError;
                }
            } else if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (!data) {
                return null;
            }

            return {
                id: data.id,
                name: data.name,
                attendance: data.attendance,
                cantidad_acompañante: data.cantidad_acompañante ?? 2,
                timestamp: new Date(data.created_at).toLocaleString('es-MX')
            };
        } catch (error) {
            console.error('Error al buscar invitado:', error);
            throw error;
        }
    }

    /**
     * Actualizar cantidad de acompañantes de un invitado
     * @param {number} id - ID del invitado
     * @param {number} cantidad - Nueva cantidad de acompañantes (0, 1 o 2)
     * @returns {Promise<Object>} - Datos actualizados del invitado
     */
    async updateCantidadAcompañantes(id, cantidad) {
        if (!this.client) {
            throw new Error('Cliente de Supabase no inicializado');
        }

        // Validar que la cantidad sea válida (0, 1 o 2)
        if (cantidad < 0 || cantidad > 2) {
            throw new Error('La cantidad de acompañantes debe ser 0, 1 o 2');
        }

        try {
            // Primero obtener el invitado actual para validar
            const { data: currentGuest, error: fetchError } = await this.client
                .from('wedding_guests')
                .select('cantidad_acompañante')
                .eq('id', id)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            const currentCantidad = currentGuest.cantidad_acompañante ?? 2;

            // Solo permitir disminuir, no aumentar
            if (cantidad > currentCantidad) {
                throw new Error('No se puede aumentar la cantidad de acompañantes. Solo se permite disminuir.');
            }

            const { data, error } = await this.client
                .from('wedding_guests')
                .update({
                    cantidad_acompañante: cantidad
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
                cantidad_acompañante: data.cantidad_acompañante,
                timestamp: new Date(data.updated_at).toLocaleString('es-MX')
            };
        } catch (error) {
            console.error('Error al actualizar cantidad de acompañantes:', error);
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
