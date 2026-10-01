// CONFIGURACIÓN DE INDEXEDDB NATIVO
const DB_NAME = "R02_DB";
const DB_VERSION = 1;
const STORE_NAME = "derechohabientes";
let db;

// Inicializar la Base de Datos Local IndexedDB al abrir la app
const request = indexedDB.open(DB_NAME, DB_VERSION);
request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Indexamos por CURP como llave primaria, y creamos índices de búsqueda rápida
        const store = db.createObjectStore(STORE_NAME, { keyPath: "CURP" });
        store.createIndex("by_nombre", "NOMBRE", { unique: false });
        store.createIndex("by_calle", "CALLE", { unique: false });
    }
};
request.onsuccess = (e) => { db = e.target.result; };

// FUNCIÓN PARA DESCARGAR MASIVAMENTE LAS 50,000 FILAS EN BLOQUES
async function downloadAllDataMassive() {
    const btn = document.getElementById('btn-massive-download');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    btn.disabled = true;
    progressContainer.style.display = "block";
    
    let offset = 0;
    let limit = 10000; // Bloques de 10,000 registros
    let isDone = false;
    
    // Limpiar base de datos local anterior para una carga limpia
    const txClear = db.transaction(STORE_NAME, "readwrite");
    txClear.objectStore(STORE_NAME).clear();
    
    try {
        while (!isDone) {
            progressText.innerText = `Descargando registros desde la fila ${offset}...`;
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllData&offset=${offset}&limit=${limit}`);
            const data = await response.json();
            
            if (data.records && data.records.length > 0) {
                // Insertar el bloque en IndexedDB masivamente
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                
                data.records.forEach(record => {
                    if(record.CURP) store.put(record); // Guarda o actualiza por CURP
                });
                
                await new Promise((resolve) => { tx.oncomplete = resolve; });
            }
            
            isDone = data.done;
            offset = data.nextOffset;
            
            // Animación de barra de progreso aproximada basada en un estimado de 50k filas
            let percentage = Math.min(100, Math.round((offset / 50000) * 100));
            progressBar.style.width = `${percentage}%`;
        }
        
        progressText.innerText = "¡Descarga completa exitosamente! 50,000 registros listos offline.";
        alert("Éxito: Toda la base de datos se ha guardado de forma permanente en el teléfono.");
    } catch (error) {
        console.error(error);
        alert("Ocurrió un error en la descarga masiva. Verifica tu conexión de Red.");
    } finally {
        btn.disabled = false;
    }
}

// BÚSQUEDA ULTRA RÁPIDA EN MEMORIA DISCO (INDEXEDDB)
function searchData() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = "";

    if(query.length < 3) return; // Esperar 3 letras para no saturar la pantalla con 50k datos

    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const requestCursor = store.openCursor();
    let matchesFound = 0;

    requestCursor.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            const item = cursor.value;
            
            // Validación multicriterio simultánea: CALLE, NOMBRE, CURP, AP PATERNO, AP MATERNO
            const match = 
                (item.CALLE && item.CALLE.toLowerCase().includes(query)) ||
                (item.NOMBRE && item.NOMBRE.toLowerCase().includes(query)) ||
                (item.CURP && item.CURP.toLowerCase().includes(query)) ||
                (item.AP_PATERNO && item.AP_PATERNO.toLowerCase().includes(query)) ||
                (item.AP_MATERNO && item.AP_MATERNO.toLowerCase().includes(query));

            if (match) {
                const div = document.createElement('div');
                div.className = "result-item";
                div.innerHTML = `<strong>${item.NOMBRE} ${item.AP_PATERNO} ${item.AP_MATERNO || ''}</strong><br><small>CURP: ${item.CURP} | Calle: ${item.CALLE || 'No registrada'}</small>`;
                div.onclick = () => openForm(item);
                resultsContainer.appendChild(div);
                matchesFound++;
            }

            // Limitamos a un máximo de 30 resultados visuales por rendimiento de pantalla
            if (matchesFound < 30) {
                cursor.continue();
            }
        }
    };
}
