// =========================================================================
// R02-DERECHOHABIENTES: CONFIGURACIÓN GENERAL Y ESTADO DE LA APP
// =========================================================================

// URL del Web App de Google Apps Script (Sustituye con tu URL exacta de producción)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbysNXdCdEnKQDjEQaSopY--xmMFiUynFNyJGnGhl4leIEr1HnqNAz4mqXzGGKyiUW2f/exec";

// CURPs Autorizadas en Código para la Pantalla de Acceso (Pantalla 1)
const AUTHORIZED_CURPS = {
    "CURPVALIDA12345678": "Juan Pérez López",
    "CURPVALIDA87654321": "María Gómez García"
};

let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let currentUser = null;
let previousScreen = 'screen-welcome';

// =========================================================================
// INITIALIZACIÓN DE INDEXEDDB (Base de Datos Local para 50,000 registros)
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

// NAVEGACIÓN ENTRE PANTALLAS (ACTUALIZADA PARA PRECARGA DE MEMORIA)
function changeScreen(screenId) {
    if(screenId !== 'screen-history') {
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
// PANTALLA 2: DESCARGA MASIVA POR BLOQUES (Soporta 50k filas de Sheets)
// =========================================================================
async function downloadAllDataMassive() {
    const btn = document.getElementById('btn-massive-download');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if(!db) return alert("La base de datos local aún no está lista. Reintente en un segundo.");
    
    btn.disabled = true;
    progressContainer.style.display = "block";
    
    let offset = 0;
    let limit = 10000; 
    let isDone = false;
    let totalCargados = 0;
    
    // Limpieza total antes de sobreescribir para evitar duplicados en el teléfono
    const txClear = db.transaction(STORE_NAME, "readwrite");
    txClear.objectStore(STORE_NAME).clear();
    
    try {
        while (!isDone) {
            progressText.innerText = `Descargando registros: ${totalCargados} acumulados...`;
            
            const url = `${GOOGLE_SCRIPT_URL}?action=getAllData&offset=${offset}&limit=${limit}&_=${new Date().getTime()}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error("Fallo en la respuesta del servidor Google.");
            const data = await response.json();
            
            if (data.records && data.records.length > 0) {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                
                data.records.forEach(record => {
                    if(record.CURP) {
                        record.CURP = String(record.CURP).replace(/ /g, "").toUpperCase().trim();
                        store.put(record); 
                        totalCargados++;
                    }
                });
                
                await new Promise((resolve) => { tx.oncomplete = resolve; });
            }
            
            isDone = data.done;
            offset = data.nextOffset;
            
            // Render de progreso real basado en el avance del offset
            let percentage = Math.min(100, Math.round((offset / 50000) * 100));
            progressBar.style.width = `${percentage}%`;
        }
        
        progressText.innerText = `¡Descarga completa! ${totalCargados} derechohabientes listos offline.`;
        alert(`Éxito: Se han guardado ${totalCargados} registros en la memoria interna.`);
    } catch (error) {
        console.error(error);
        alert("Ocurrió un error en la transferencia de datos. Verifica tu conexión de red.");
    } finally {
        btn.disabled = false;
    }
}

// =========================================================================
// PANTALLA 3: BUSCADOR MULTICRITERIO INTEGRAL (OPTIMIZADO PARA 20,000 REGISTROS)
// =========================================================================

// Matriz en memoria RAM para búsquedas instantáneas y estables
let localMemoryDatabase = [];

/**
 * Carga todo el contenido de IndexedDB a la memoria RAM del teléfono para evitar que
 * registros rotos detengan la búsqueda. Se ejecuta automáticamente al abrir la pantalla de búsqueda.
 */
function preloadDatabaseToMemory() {
    if (!db) return;
    
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const requestGetAll = store.getAll(); // Extrae los 20,000 registros en un solo viaje limpio

    requestGetAll.onsuccess = (e) => {
        localMemoryDatabase = e.target.result || [];
        console.log(`Base de datos de ${localMemoryDatabase.length} registros cargada con éxito en la memoria RAM.`);
    };

    requestGetAll.onerror = (err) => {
        console.error("Error al precargar la base de datos:", err);
    };
}

/**
 * Buscador de alto rendimiento protegido contra valores nulos o vacíos en Sheets
 */
function searchData() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = "";

    // Requiere un mínimo de 3 letras para iniciar el barrido masivo
    if (query.length < 3) return;

    // Si por alguna razón la memoria RAM se vació, intentamos recargarla
    if (localMemoryDatabase.length === 0) {
        preloadDatabaseToMemory();
    }

    let matchesFound = 0;

    // Recorremos la matriz en memoria de forma ultra rápida y segura
    for (let i = 0; i < localMemoryDatabase.length; i++) {
        const item = localMemoryDatabase[i];
        if (!item) continue;

        // PROTECCIÓN VITAL: Convertimos a String seguro y limpiamos espacios para evitar errores de tipo null/undefined
        const calle = item.CALLE ? String(item.CALLE).toLowerCase() : "";
        const nombre = item.NOMBRE ? String(item.NOMBRE).toLowerCase() : "";
        const curp = item.CURP ? String(item.CURP).toLowerCase() : "";
        const apPaterno = item.AP_PATERNO ? String(item.AP_PATERNO).toLowerCase() : "";
        const apMaterno = item.AP_MATERNO ? String(item.AP_MATERNO).toLowerCase() : "";

        // Búsqueda simultánea cruzada en los 5 campos requeridos
        const match = calle.includes(query) || 
                      nombre.includes(query) || 
                      curp.includes(query) || 
                      apPaterno.includes(query) || 
                      apMaterno.includes(query);

        if (match) {
            // Mostramos un máximo de 30 resultados visuales para no saturar la pantalla del celular
            if (matchesFound < 30) {
                const div = document.createElement('div');
                div.className = "result-item";
                
                // Formateamos los nombres para la interfaz
                const displayNombre = item.NOMBRE || '';
                const displayPaterno = item.AP_PATERNO || '';
                const displayMaterno = item.AP_MATERNO || '';
                const displayCurp = item.CURP || '';
                const displayCalle = item.CALLE || 'No registrada';

                div.innerHTML = `<strong>${displayNombre} ${displayPaterno} ${displayMaterno}</strong><br><small>CURP: ${displayCurp} | Calle: ${displayCalle}</small>`;
                
                // Evento para abrir el formulario al dar clic
                div.onclick = () => openForm(item);
                resultsContainer.appendChild(div);
            }
            matchesFound++;
        }
    }

    // Mensaje en caso de no encontrar ninguna coincidencia
    if (matchesFound === 0) {
        resultsContainer.innerHTML = "<div class='result-item' style='color: gray; text-align: center;'>No se encontraron derechohabientes que coincidan.</div>";
    }
}

// =========================================================================
// PANTALLA 4: RELLENO DE FORMULARIO Y OBTENCIÓN AUTOMÁTICA DE GPS
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

    // Limpieza previa de los campos GPS
    document.getElementById('f-lat').value = "Obteniendo...";
    document.getElementById('f-lon').value = "Obteniendo...";

    // Disparar Georreferencia nativa en tiempo real al abrir el expediente
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('f-lat').value = position.coords.latitude;
                document.getElementById('f-lon').value = position.coords.longitude;
            },
            (error) => { 
                console.error(error);
                document.getElementById('f-lat').value = "";
                document.getElementById('f-lon').value = "";
                alert("Atención: No se pudo obtener la ubicación GPS de forma automática."); 
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    } else {
        alert("Tu celular no cuenta con soporte de hardware para localización GPS.");
    }
    changeScreen('screen-form');
}

function saveData(event) {
    event.preventDefault();
    
    const record = {
        CURP: document.getElementById('f-curp').value,
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
        Latitud: document.getElementById('f-lat').value,
        Longitud: document.getElementById('f-lon').value,
        // Datos de auditoría obligatorios para Sheets
        FECHA_MODIFICACION: new Date().toLocaleString("es-MX"),
        USUARIO_MODIFICA: currentUser.name
    };

    // Actualizar el cambio de forma inmediata en la base de datos IndexedDB local
    const txUpdate = db.transaction(STORE_NAME, "readwrite");
    txUpdate.objectStore(STORE_NAME).put(record);

    // Almacenar en la cola temporal para envío posterior hacia la nube
    pendingSync.push(record);
    localStorage.setItem('pendingSync', JSON.stringify(pendingSync));

    alert("Confirmación: Modificación guardada localmente en la memoria interna del teléfono.");
    
    // Limpiar el buscador y retornar a la pantalla 3 para la siguiente visita
    document.getElementById('search-input').value = "";
    document.getElementById('search-results').innerHTML = "";
    changeScreen('screen-search');
}
// =========================================================================
// PANTALLA 5: CONTROL DE BITÁCORA Y SINCRONIZACIÓN COLA OFFLINE
// =========================================================================
function openHistoryScreen() {
    document.getElementById('pending-count').innerText = pendingSync.length;
    const logList = document.getElementById('history-log');
    logList.innerHTML = "";

    pendingSync.forEach((item) => {
        const div = document.createElement('div');
        div.className = "result-item";
        div.innerHTML = `<strong>${item.NOMBRE} (${item.CURP})</strong><br><small>Modificado: ${item.FECHA_MODIFICACION} por ${item.USUARIO_MODIFICA}</small>`;
        logList.appendChild(div);
    });

    changeScreen('screen-history');
}

function goBackFromHistory() {
    changeScreen(previousScreen);
}

async function syncWithSheets() {
    if(pendingSync.length === 0) return alert("No tienes registros pendientes de sincronizar en la cola.");

    alert("Conectando y sincronizando con Google Sheets de forma masiva...");
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "sync", records: pendingSync })
        });

        const result = await response.json();

        if (result.status === "success") {
            // Vaciar la lista temporal solo tras la confirmación exitosa de Google
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

function downloadBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pendingSync));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "R02_cambios_pendientes.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function clearLocalStorage() {
    if(confirm("¿Estás absolutamente seguro de vaciar la memoria? Perderás los registros pendientes por subir a Sheets.")) {
        pendingSync = [];
        localStorage.clear();
        if(db) {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).clear();
        }
        openHistoryScreen();
        alert("Datos del teléfono eliminados.");
    }
}

// =========================================================================
// REGISTRO DEL SERVICE WORKER PARA CAPACIDAD DE INCIO 100% OFFLINE
// =========================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker de R02 registrado con éxito.', reg))
            .catch(err => console.error('Error de registro del Service Worker:', err));
    });
}
