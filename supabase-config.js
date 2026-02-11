// Configuración de Supabase
// Reemplaza estos valores con los de tu proyecto de Supabase

const SUPABASE_CONFIG = {
    url: 'https://axwqtaubbgtkvsagpihi.supabase.co', // Ejemplo: 'https://xxxxx.supabase.co'
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d3F0YXViYmd0a3ZzYWdwaWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Njg0NDQsImV4cCI6MjA4NjM0NDQ0NH0.qud2Wk3_lWLdWyXUslj19T3qtL3jy-fNXRq0EJtvJC0' // Tu clave pública (anon key) de Supabase
};

// Verificar que la configuración esté completa
if (SUPABASE_CONFIG.url === 'https://axwqtaubbgtkvsagpihi.supabase.co' || SUPABASE_CONFIG.anonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d3F0YXViYmd0a3ZzYWdwaWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Njg0NDQsImV4cCI6MjA4NjM0NDQ0NH0.qud2Wk3_lWLdWyXUslj19T3qtL3jy-fNXRq0EJtvJC0') {
    console.warn('⚠️ Por favor configura tu URL y anonKey de Supabase en supabase-config.js');
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}
