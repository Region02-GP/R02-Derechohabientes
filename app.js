// =========================================================================
// R02-DERECHOHABIENTES: CONFIGURACIÓN GENERAL Y ESTADO DE LA APP
// =========================================================================

// URL del Web App de Google Apps Script 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxjnhccH8xVxjIK6VUj-PDXI0pQnlH7J6RjLPFzdUutd0ldLOGwsvY5xW7S5oO3CMgK/exec";

// CURPs Autorizadas en Código para la Pantalla de Acceso (Pantalla 1)
const AUTHORIZED_CURPS = {
    "CURPVALIDA12345678": "Juan Pérez López",
    "CURPVALIDA87654321": "María Gómez García"
};

let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let syncedHistory = JSON.parse(localStorage.getItem('syncedHistory')) || [];
let currentUser = null;
let previousScreen = 'screen-welcome';

// =========================================================================
// INITIALIZACIÓN DE INDEXEDDB (Base de Datos Local de Alta Capacidad)
// =========================================================================
const DB_NAME = "R02_DB";
const DB_VERSION = 1;
const STORE_NAME = "derechohabientes";
let db;

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        // La CURP limpia será nuestra llave primaria única
        const store = db.createObjectStore(STORE_NAME, { keyPath: "CURP" });
        store.createIndex("by_nombre", "NOMBRE", { unique: false });
        store.createIndex("by_calle", "CALLE", { unique: false });
    }
};

request.onsuccess = (e) => { 
    db = e.target.result; 
    console.log("IndexedDB inicializada correctamente para soporte masivo.");
};

request.onerror = (e) => {
    console.error("Error al abrir IndexedDB:", e.target.error);
};

// NAVEGACIÓN GENERAL ENTRE PANTALLAS
function changeScreen(screenId) {
    if (screenId !== 'screen-history') {
        previousScreen = screenId;
    }
    
    // Si el usuario va hacia la pantalla de búsqueda, precargamos los datos en la RAM
    if (screenId === 'screen-search') {
        preloadDatabaseToMemory();
    }
    
    document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}
// =========================================================================
// PANTALLA 1: ACCESO POR CURP
// =========================================================================
function login() {
    const curpInput = document.getElementById('login-curp').value.trim().toUpperCase();
    if (AUTHORIZED_CURPS[curpInput]) {
        currentUser = { curp: curpInput, name: AUTHORIZED_CURPS[curpInput] };
        document.getElementById('welcome-message').innerText = `Bienvenido(a), ${currentUser.name}`;
        changeScreen('screen-welcome');
    } else {
        alert("CURP no autorizada o inválida en el sistema.");
    }
}

// =========================================================================
// PANTALLA 2: DESCARGA MASIVA PROTEGIDA (BLINDADA CONTRA ERRORES DE RED)
// =========================================================================
async function downloadAllDataMassive() {
    const btn = document.getElementById('btn-massive-download');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (!db) return alert("La base de datos local aún no está lista. Reintente en un segundo.");
    
    btn.disabled = true;
    progressContainer.style.display = "block";
    
    let offset = 0;
    let limit = 10000; // Paquetes óptimos de 10k para no saturar el navegador
    let isDone = false;
    let totalCargados = 0;
    
    // Limpieza total antes de sobreescribir para evitar duplicados en el teléfono
    const txClear = db.transaction(STORE_NAME, "readwrite");
    txClear.objectStore(STORE_NAME).clear();
    
    try {
        while (!isDone) {
            progressText.innerText = `Descargando registros: ${totalCargados} acumulados...`;
            
            // Forzamos saltar cachés del navegador con una marca de tiempo unica
            const url = `${GOOGLE_SCRIPT_URL}?action=getAllData&offset=${offset}&limit=${limit}&_=${new Date().getTime()}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            // LEER COMO TEXTO SEGURO Y CONVERTIR A OBJETO
            const textData = await response.text();
            let data;
            
            try {
                data = JSON.parse(textData);
            } catch (jsonParseError) {
                console.error("Respuesta no válida del servidor Google (No es JSON):", textData);
                throw new Error("El servidor de Google devolvió un formato corrompido.");
            }
            
            // Validar que la estructura interna contenga los registros
            if (data && data.records && data.records.length > 0) {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                
                data.records.forEach(record => {
                    // Validamos que el registro tenga una CURP válida antes de inyectar en disco
                    if (record && record.CURP) {
                        record.CURP = String(record.CURP).replace(/ /g, "").toUpperCase().trim();
                        store.put(record); 
                        totalCargados++;
                    }
                });
                
                // Esperar a que la transacción en el disco duro local termine por completo
                await new Promise((resolve) => { tx.oncomplete = resolve; });
            }
            
            // Actualizar variables de control del ciclo while
            isDone = data.done === true || data.records.length === 0;
            offset = data.nextOffset || (offset + limit);
            
            // Animación de progreso visual basada en un universo estimado de 25,000 filas
            let percentage = Math.min(100, Math.round((offset / 25000) * 100));
            progressBar.style.width = `${percentage}%`;
        }
        
        progressText.innerText = `¡Descarga completa! ${totalCargados} derechohabientes listos offline.`;
        alert(`Éxito: Se han guardado ${totalCargados} registros en la memoria interna.`);
    } catch (error) {
        console.error("Error detallado durante la descarga masiva:", error);
        alert(`Error en la transferencia: ${error.message}\nVerifica la consola para más detalles.`);
    } finally {
        // Retraso de seguridad antes de reactivar el botón para evitar clics dobles catastróficos
        window.setTimeout(() => { btn.disabled = false; }, 1000);
    }
}

// =========================================================================
// PANTALLA 3: BUSCADOR MULTICRITERIO INTEGRAL (MEMORIA RAM)
// =========================================================================
let localMemoryDatabase = [];

function preloadDatabaseToMemory() {
    if (!db) return;
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const requestGetAll = store.getAll(); 

    requestGetAll.onsuccess = (e) => {
        localMemoryDatabase = e.target.result || [];
        console.log(`Base de datos de ${localMemoryDatabase.length} registros precargada en RAM.`);
    };
}

function searchData() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = "";

    if (query.length < 3) return;
    if (localMemoryDatabase.length === 0) preloadDatabaseToMemory();

    let matchesFound = 0;

    for (let i = 0; i < localMemoryDatabase.length; i++) {
        const item = localMemoryDatabase[i];
        if (!item) continue;

        const calle = item.CALLE ? String(item.CALLE).toLowerCase() : "";
        const nombre = item.NOMBRE ? String(item.NOMBRE).toLowerCase() : "";
        const curp = item.CURP ? String(item.CURP).toLowerCase() : "";
        const apPaterno = item.AP_PATERNO ? String(item.AP_PATERNO).toLowerCase() : "";
        const apMaterno = item.AP_MATERNO ? String(item.AP_MATERNO).toLowerCase() : "";

        const match = calle.includes(query) || nombre.includes(query) || curp.includes(query) || apPaterno.includes(query) || apMaterno.includes(query);

        if (match) {
            if (matchesFound < 30) {
                const div = document.createElement('div');
                
                // VALIDACIÓN DE VISITA: Verifica si tiene coordenadas válidas de Sheets o si está en la cola temporal
                const tieneLat = item.Latitud && item.Latitud !== "" && item.Latitud !== "0" && item.Latitud !== "ERROR";
                const tieneLon = item.Longitud && item.Longitud !== "" && item.Longitud !== "0" && item.Longitud !== "ERROR";
                const yaSincronizadoOModificado = tieneLat && tieneLon;
                
                // Verificar además si está pendiente en la cola de hoy
                const estaEnColaPendiente = pendingSync.some(p => p.CURP === item.CURP);
                const fueVisitado = yaSincronizadoOModificado || estaEnColaPendiente;

                // Asignar clase CSS común o clase de visitado
                div.className = fueVisitado ? "result-item status-visitado" : "result-item";
                
                const displayNombre = item.NOMBRE || '';
                const displayPaterno = item.AP_PATERNO || '';
                const displayMaterno = item.AP_MATERNO || '';
                const displayCurp = item.CURP || '';
                const displayCalle = item.CALLE || 'No registrada';
                
                // Texto de ayuda si ya fue actualizado
                const indicadorTexto = fueVisitado ? '<br><small style="color:#236947; font-weight:bold;">✓ Información Actualizada / Con GPS</small>' : '';

                div.innerHTML = `<strong>${displayNombre} ${displayPaterno} ${displayMaterno}</strong>${indicadorTexto}<br><small>CURP: ${displayCurp} | Calle: ${displayCalle}</small>`;
                
                div.onclick = () => openForm(item);
                resultsContainer.appendChild(div);
            }
            matchesFound++;
        }
    }

    if (matchesFound === 0) {
        resultsContainer.innerHTML = "<div class='result-item' style='color: gray; text-align: center;'>No se encontraron derechohabientes que coincidan.</div>";
    }
}

// =========================================================================
// PANTALLA 4: FORMULARIO DE EDICIÓN Y CAPTURA GPS ESTANDARIZADA
// =========================================================================
function openForm(item) {
    document.getElementById('f-curp').value = item.CURP || '';
    document.getElementById('f-id').value = item.ID || '';
    document.getElementById('f-nombre').value = item.NOMBRE || '';
    document.getElementById('f-paterno').value = item.AP_PATERNO || '';
    document.getElementById('f-materno').value = item.AP_MATERNO || '';
    document.getElementById('f-situacion').value = item.SITUACION || '';
    document.getElementById('f-causal').value = item.CUSAL || '';
    
    document.getElementById('f-telfijo').value = item.TEL_FIJO || '';
    document.getElementById('f-telcel').value = item.TEL_CEL || '';
    document.getElementById('f-municipio').value = item.MUNICIPIO || '';
    document.getElementById('f-localidad').value = item.LOCALIDAD || '';
    document.getElementById('f-seccion').value = item.SECCION || '';
    document.getElementById('f-colonia').value = item.COLONIA || '';
    document.getElementById('f-cp').value = item.CP || '';
    document.getElementById('f-calle').value = item.CALLE || '';
    document.getElementById('f-numext').value = item.NUM_EXT || '';
    document.getElementById('f-referencia').value = item.REFERENCIA || '';

    document.getElementById('f-lat').value = "Buscando satélite...";
    document.getElementById('f-lon').value = "Buscando satélite...";

    const gpsOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let cleanLat = String(position.coords.latitude.toFixed(6)).replace(",", ".");
                let cleanLon = String(position.coords.longitude.toFixed(6)).replace(",", ".");
                document.getElementById('f-lat').value = cleanLat;
                document.getElementById('f-lon').value = cleanLon;
            },
            (error) => { 
                document.getElementById('f-lat').value = "ERROR";
                document.getElementById('f-lon').value = "ERROR";
                alert("Atención: Permita el acceso a la ubicación para capturar la georreferencia.");
            },
            gpsOptions
        );
    } else {
        document.getElementById('f-lat').value = "NO COMPATIBLE";
        document.getElementById('f-lon').value = "NO COMPATIBLE";
    }
    changeScreen('screen-form');
}

function saveData(event) {
    event.preventDefault();
    const latValue = document.getElementById('f-lat').value;
    const lonValue = document.getElementById('f-lon').value;

    if (latValue.includes("Buscando") || latValue === "" || latValue === "ERROR" || latValue === "NO COMPATIBLE") {
        alert("🛑 BLOQUEO: No se puede guardar el registro sin la georreferencia del domicilio.");
        return; 
    }
    
    const targetCurp = document.getElementById('f-curp').value;
    
    // CORRECCIÓN VITAL: Buscamos el registro directamente en la memoria RAM activa
    const memoryIndex = localMemoryDatabase.findIndex(r => r.CURP === targetCurp);
    const originalRecord = memoryIndex !== -1 ? localMemoryDatabase[memoryIndex] : {};

        const record = {
        CURP: targetCurp,
        ID: document.getElementById('f-id').value,
        NOMBRE: document.getElementById('f-nombre').value,
        AP_PATERNO: document.getElementById('f-paterno').value,
        AP_MATERNO: document.getElementById('f-materno').value,
        TEL_FIJO: document.getElementById('f-telfijo').value,
        TEL_CEL: document.getElementById('f-telcel').value,
        MUNICIPIO: document.getElementById('f-municipio').value,
        LOCALIDAD: document.getElementById('f-localidad').value,
        SECCION: document.getElementById('f-seccion').value,
        COLONIA: document.getElementById('f-colonia').value,
        CP: document.getElementById('f-cp').value,
        CALLE: document.getElementById('f-calle').value,
        NUM_EXT: document.getElementById('f-numext').value,
        REFERENCIA: document.getElementById('f-referencia').value,
        SITUACION: document.getElementById('f-situacion').value,
        CUSAL: document.getElementById('f-causal').value,
        
        // UNIFICACIÓN DE CAMPOS: Forzamos la escritura en el formato de objeto idéntico
        Latitud: latValue,
        Longitud: lonValue,
        
        FECHA_MODIFICACION: new Date().toLocaleString("es-MX"),
        USUARIO_MODIFICA: currentUser.name,
        SHEETS_ROW_INDEX: originalRecord.SHEETS_ROW_INDEX || ""
    };

    // 1. Actualizar la base de datos física del teléfono
    const txUpdate = db.transaction(STORE_NAME, "readwrite");
    txUpdate.objectStore(STORE_NAME).put(record);

    // 2. ACTUALIZACIÓN EN TIEMPO REAL: Sobreescribimos el registro en la memoria RAM activa
    if (memoryIndex !== -1) {
        localMemoryDatabase[memoryIndex] = record;
    } else {
        localMemoryDatabase.push(record);
    }

    // 3. Mandar a la cola temporal de sincronización
    pendingSync.push(record);
    localStorage.setItem('pendingSync', JSON.stringify(pendingSync));

    alert("Confirmación: Modificación guardada localmente.");
    
    // Limpiar inputs del buscador
    document.getElementById('search-input').value = "";
    document.getElementById('search-results').innerHTML = "";
    
    // Regresamos a la pantalla de búsqueda
    changeScreen('screen-search');
}

// =========================================================================
// PANTALLA 5: HISTORIAL DINÁMICO Y REPORTES DIRECTOS EN EXCEL/CSV
// =========================================================================
function openHistoryScreen() {
    // CAMBIO DE PANTALLA DE SEGURIDAD ANTES DE RENDERIZAR
    changeScreen('screen-history');

    document.getElementById('pending-count').innerText = pendingSync.length;
    const logList = document.getElementById('history-log');
    logList.innerHTML = "";

    // 1. Mostrar registros pendientes
    pendingSync.forEach((item) => {
        const div = document.createElement('div');
        div.className = "result-item";
        div.innerHTML = `<strong>⏳ ${item.NOMBRE} (${item.CURP})</strong><br><small>Pendiente de subir | Modificado: ${item.FECHA_MODIFICACION}</small>`;
        logList.appendChild(div);
    });

    // 2. Mostrar registros ya sincronizados (Con marca verde y opacidad)
    syncedHistory.forEach((item) => {
        const div = document.createElement('div');
        div.className = "result-item";
        div.style.opacity = "0.6"; 
        div.innerHTML = `<strong>✅ ${item.NOMBRE} (${item.CURP})</strong><br><small style="color:green;">Sincronizado con Sheets con éxito</small>`;
        logList.appendChild(div);
    });
}

function goBackFromHistory() {
    changeScreen(previousScreen);
}

async function syncWithSheets() {
    if (pendingSync.length === 0) return alert("No tienes registros pendientes de sincronizar en la cola.");

    alert("Conectando y sincronizando con Google Sheets por renglón indexado...");
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "sync", records: pendingSync })
        });

        const result = await response.json();

        if (result.status === "success") {
            // Mover a bitácora histórica local del teléfono
            syncedHistory = syncedHistory.concat(pendingSync);
            localStorage.setItem('syncedHistory', JSON.stringify(syncedHistory));

            pendingSync = [];
            localStorage.removeItem('pendingSync');
            
            openHistoryScreen();
            alert(`¡Excelente! Sincronización realizada en Sheets: ${result.message}`);
        } else {
            alert(`Error retornado del servidor: ${result.message}`);
        }
    } catch (e) {
        console.error(e);
        alert("Fallo de conexión de red temporal. Tus cambios siguen resguardados de forma segura en el teléfono.");
    }
}

function downloadBackupCSV() {
    const allVisitsOfDay = pendingSync.concat(syncedHistory);

    if (allVisitsOfDay.length === 0) {
        return alert("No tienes ningún registro de visita en el teléfono para exportar hoy.");
    }

    const headers = [
        "CURP", "ID", "NOMBRE", "AP_PATERNO", "AP_MATERNO", "TEL_FIJO", "TEL_CEL", 
        "MUNICIPIO", "LOCALIDAD", "SECCION", "COLONIA", "CP", "CALLE", "NUM_EXT", 
        "REFERENCIA", "SITUACION", "CUSAL", "Latitud", "Longitud", "FECHA_MODIFICACION", "USUARIO_MODIFICA"
    ];

    let csvRows = [headers.join(",")];

    allVisitsOfDay.forEach(record => {
        const values = headers.map(header => {
            let val = record[header] !== undefined ? record[header] : "";
            let valStr = String(val).trim();
            if (valStr.includes(",") || valStr.includes("\n") || valStr.includes('"')) {
                valStr = `"${valStr.replace(/"/g, '""')}"`;
            }
            return valStr;
        });
        csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const downloadAnchor = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fechaHoy = new Date().toISOString().slice(0, 10);
    
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `R02_Reporte_Completo_${fechaHoy}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
}

function clearLocalStorage() {
    if (confirm("¿Estás absolutamente seguro de vaciar la memoria? Perderás los registros pendientes y el historial del día.")) {
        pendingSync = [];
        syncedHistory = []; 
        localStorage.clear();
        if (db) {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).clear();
        }
        openHistoryScreen();
        alert("Datos e historial del teléfono eliminados correctamente.");
    }
}

// ACTIVACIÓN DEL SERVICE WORKER PWA OFFLINE
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado con éxito.', reg))
            .catch(err => console.error('Error al registrar Service Worker:', err));
    });
}

